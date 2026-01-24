import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Camera, CheckCircle, ClipboardList } from "lucide-react";
import Loading from "../components/Loading";
import BottomNavbar from "../components/BottomNavbar";
import ModalAgregarGuardia from "../components/ModalAgregarGuardia";
import ModalAgregarLicencia from "../components/ModalAgregarLicencia";
import { postData, deleteData } from "../utils/api";
import { estaTokenExpirado } from "../utils/tokenUtils";
import { getTurnoProps } from "../utils/turnoHelpers";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";
dayjs.locale("es");
dayjs.extend(utc);
import { toPng } from "html-to-image";

export default function EscalafonServicio() {
  const navigate = useNavigate();
  const {
    usuario,
    dependencias,
    turnos,
    guardias,
    licencias,
    token,
    loading,
    recargarGuaridas,
  } = useAppContext();

  const [daysToShow, setDaysToShow] = useState(14);
  const [startDate, setStartDate] = useState(dayjs().startOf("day"));
  const [selectorTipo, setSelectorTipo] = useState(null);
  const [selectorLicencia, setSelectorLicencia] = useState(null);
  const [controlTurnos, setControlTurnos] = useState({});

  useEffect(() => {
    if (!token || estaTokenExpirado(token)) navigate("/login");
  }, [token, navigate]);

  if (loading) return <Loading />;

  const miDependencia = dependencias.find((dep) =>
    dep.usuarios?.some((u) => u.id === usuario.id)
  );

  if (!miDependencia) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        <h1 className="m-auto">No se encontró tu dependencia.</h1>
        <BottomNavbar />
      </div>
    );
  }

  const dias = Array.from({ length: daysToShow }, (_, i) =>
    startDate.add(i, "day")
  );

  const funcionarios = miDependencia.usuarios.filter(
    (f) => f.rol_jerarquico !== "JEFE_DEPENDENCIA"
  );

  const funcionariosPorTurno = (turnoId) =>
    funcionarios.filter((f) => f.turno_id === turnoId);

  const getCelda = (funcionario, dia) => {
    const fechaDia = dia.utc().format("YYYY-MM-DD");

    const licencia = licencias.find((l) => {
      if (l.usuario_id !== funcionario.id) return false;

      const inicio = dayjs(l.fecha_inicio).utc().format("YYYY-MM-DD");
      const fin = dayjs(l.fecha_fin).utc().format("YYYY-MM-DD");

      return fechaDia >= inicio && fechaDia <= fin;
    });

    if (licencia) {
      switch (licencia.tipo) {
        case "reglamentaria":
          return "L";
        case "extraordinaria":
          return "L.Ext";
        case "compensacion":
          return "CH";
        case "medica":
          return "L.Med";
        default:
          return "L";
      }
    }

    const guardia = guardias.find(
      (g) =>
        g.usuario_id === funcionario.id &&
        dayjs(g.fecha_inicio).utc().format("YYYY-MM-DD") === fechaDia
    );

    if (guardia) return guardia.tipo;

    return "-";
  };

  const capturar = () => {
    const elemento = document.getElementById("contenedor-tablas");

    const originalWidth = elemento.style.width;
    const originalHeight = elemento.style.height;
    const originalPadding = elemento.style.padding;

    elemento.style.padding = "20px";

    elemento.style.width = elemento.scrollWidth + 40 + "px"; // +40 = 20px izquierda + 20px derecha
    elemento.style.height = elemento.scrollHeight + 40 + "px"; // igual para altura

    toPng(elemento, {
      cacheBust: true,
      width: elemento.scrollWidth + 40,
      height: elemento.scrollHeight + 40,
    })
      .then((dataUrl) => {
        elemento.style.width = originalWidth;
        elemento.style.height = originalHeight;
        elemento.style.padding = originalPadding;

        const link = document.createElement("a");
        link.download = "turnos.png";
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Error capturando pantalla:", err);

        elemento.style.width = originalWidth;
        elemento.style.height = originalHeight;
        elemento.style.padding = originalPadding;
      });
  };

  const ordenTurnos = [
    "Primer Turno",
    "BROU",
    "Segundo Turno",
    "Tercer Turno",
    "Destacados",
  ];
  const turnosOrdenados = turnos
    .filter((t) => t.dependencia_id === miDependencia.id)
    .sort(
      (a, b) => ordenTurnos.indexOf(a.nombre) - ordenTurnos.indexOf(b.nombre)
    );

  const abreviarNombre = (nombreCompleto) => {
    if (!nombreCompleto) return "";
    const partes = nombreCompleto.trim().split(" ");
    if (partes.length === 1) return partes[0];

    const inicial = partes[0][0];
    const apellido = partes.find((p) => p === p.toUpperCase());
    return inicial && apellido
      ? `${inicial}. ${apellido}`
      : `${inicial}. ${partes[1] || ""}`;
  };

  const handleCrearGuardia = async ({ usuario, dia, tipo, comentario }) => {
    if (!token) return;

    try {
      const fechaBase = dia.utc().startOf("day");

      const esBloque = tipo === "T" || tipo.toLowerCase() === "brou";

      if (!esBloque) {
        const existente = guardias.find(
          (g) =>
            g.usuario_id === usuario.id &&
            dayjs(g.fecha_inicio).utc().startOf("day").isSame(fechaBase, "day")
        );

        if (existente) {
          const endpoint =
            existente.tipo === "licencia"
              ? `licencias/${existente.id}`
              : existente.tipo === "licencia_medica"
              ? `licencias-medicas/${existente.id}`
              : `guardias/${existente.id}`;
          await deleteData(endpoint, token);
        }

        await postData(
          "/guardias",
          {
            usuario_id: usuario.id,
            fecha_inicio: fechaBase.toISOString(),
            fecha_fin: fechaBase.toISOString(),
            tipo,
            comentario,
          },
          token,
          { "Content-Type": "application/json" }
        );
      } else {
        const diasBloque = Array.from({ length: 5 }, (_, i) =>
          fechaBase.add(i, "day").utc()
        );

        const hayGuardiaFutura = diasBloque.some((f) =>
          guardias.some(
            (g) =>
              g.usuario_id === usuario.id &&
              dayjs(g.fecha_inicio).utc().startOf("day").isSame(f, "day")
          )
        );

        const diasACrear = hayGuardiaFutura ? [fechaBase] : diasBloque;

        for (const fecha of diasACrear) {
          const existente = guardias.find(
            (g) =>
              g.usuario_id === usuario.id &&
              dayjs(g.fecha_inicio).utc().startOf("day").isSame(fecha, "day")
          );

          if (existente) {
            const endpoint =
              existente.tipo === "licencia"
                ? `licencias/${existente.id}`
                : existente.tipo === "licencia_medica"
                ? `licencias-medicas/${existente.id}`
                : `guardias/${existente.id}`;
            await deleteData(endpoint, token);
          }

          await postData(
            "/guardias",
            {
              usuario_id: usuario.id,
              fecha_inicio: fecha.toISOString(),
              fecha_fin: fecha.toISOString(),
              tipo,
              comentario,
            },
            token,
            { "Content-Type": "application/json" }
          );
        }
      }

      recargarGuaridas();
      setSelectorTipo(null);
    } catch (error) {
      console.error("❌ Error al crear/actualizar guardia:", error);
      alert("Ocurrió un error al crear la guardia.");
    }
  };

  const handleEliminarLicencia = async ({ usuario, dia }) => {
    const fechaBase = dia.utc().startOf("day");
    const licencia = licencias.find(
      (l) =>
        l.usuario_id === usuario.id &&
        dayjs(l.fecha_inicio).utc().startOf("day").isSame(fechaBase, "day")
    );

    if (!licencia) return;

    try {
      await deleteData(`licencias/${licencia.id}`, token);
      recargarGuaridas();
    } catch (error) {
      console.error("❌ Error al eliminar licencia:", error);
      alert("Ocurrió un error al eliminar la licencia.");
    }
  };

  const imprimirFuncionariosPorTurno = (dia) => {
    const resultado = {};

    const dias = Array.from({ length: daysToShow }, (_, i) =>
      dia.add(i, "day").utc()
    );

    // Estados que NO cuentan como presencia
    const LICENCIAS = [
      "l",
      "licencia",
      "reglamentaria",
      "l.ext",
      "extraordinaria",
      "l.med",
      "medica",
      "ch",
    ];

    // -----------------------------
    // FECHAS EXCLUIDAS (no verificar)
    // -----------------------------
    const esFechaExcluida = (dia) => {
      const fecha = dia.format("MM-DD");

      // Rango 23 → 26 de diciembre
      if (["12-23", "12-24", "12-25", "12-26"].includes(fecha)) return true;

      // Rango 30 dic → 2 ene (cruza año)
      if (["12-30", "12-31", "01-01", "01-02"].includes(fecha)) return true;

      return false;
    };

    // -----------------------------
    // Lógica de disponibilidad
    // -----------------------------
    const estaDisponible = (estado) => {
      if (!estado) return false;
      const e = estado.toLowerCase();

      if (LICENCIAS.includes(e)) return false;
      if (e === "t" || e === "guardia") return true;
      if (["1ro", "2do", "3er"].includes(e)) return true;
      if (e === "d" || e === "descanso") return false;

      return true;
    };

    const mapTurnoGuardia = (estado) => {
      if (!estado) return null;
      const e = estado.toLowerCase();

      if (e === "1ro") return "Primer Turno";
      if (e === "2do") return "Segundo Turno";
      if (e === "3er") return "Tercer Turno";

      return null;
    };

    // -----------------------------
    // PROCESAMIENTO DE CADA DÍA
    // -----------------------------
    dias.forEach((diaActual) => {
      const fecha = diaActual.format("YYYY-MM-DD");

      // ---- DÍAS EXCLUIDOS ----
      if (esFechaExcluida(diaActual)) {
        resultado[fecha] = {
          "Primer Turno": { cumple: true, presentes: [] },
          "Segundo Turno": { cumple: true, presentes: [] },
          "Tercer Turno": { cumple: true, presentes: [] },
        };
        return;
      }

      // ---- DÍAS NORMALES ----
      resultado[fecha] = {
        "Primer Turno": { cumple: false, presentes: [] },
        "Segundo Turno": { cumple: false, presentes: [] },
        "Tercer Turno": { cumple: false, presentes: [] },
      };

      ["Primer Turno", "Segundo Turno", "Tercer Turno"].forEach(
        (nombreTurno) => {
          const turno = turnosOrdenados.find((t) => t.nombre === nombreTurno);
          if (!turno) return;

          let presentes = [];

          funcionarios.forEach((f) => {
            const estado = getCelda(f, diaActual);
            if (!estaDisponible(estado)) return;

            const turnoEspecial = mapTurnoGuardia(estado);

            if (turnoEspecial) {
              if (turnoEspecial === nombreTurno) {
                presentes.push(f.nombre);
              }
              return;
            }

            if (f.turno_id === turno.id) {
              presentes.push(f.nombre);
            }
          });

          resultado[fecha][nombreTurno] = {
            cumple: presentes.length >= 3,
            presentes,
          };
        }
      );
    });

    setControlTurnos(resultado);
  };

  return (
    <div className="mb-20 p-6 space-y-4 bg-gradient-to-b from-blue-50 to-white min-h-screen dark:bg-slate-950 transition-colors duration-300">
      {/* Controles */}
      <div className="mb-6 flex flex-wrap items-center justify-start gap-4">
        <div>
          <label className="mr-2 font-semibold text-blue-900 dark:text-gray-200">
            Mostrar:
          </label>
          <select
            value={daysToShow}
            onChange={(e) => setDaysToShow(parseInt(e.target.value))}
            className="border rounded px-2 py-1 dark:bg-slate-800 dark:text-gray-200"
          >
            <option value={7}>1 Semana</option>
            <option value={14}>2 Semanas</option>
            <option value={30}>1 Mes</option>
          </select>
        </div>

        <div>
          <label className="mr-2 font-semibold text-blue-900 dark:text-gray-200">
            Desde:
          </label>
          <input
            type="date"
            value={startDate.format("YYYY-MM-DD")}
            onChange={(e) => setStartDate(dayjs(e.target.value).startOf("day"))}
            className="border rounded px-2 py-1 dark:bg-slate-800 dark:text-gray-200"
            disabled={
              usuario?.rol_jerarquico !== "JEFE_DEPENDENCIA" &&
              usuario?.is_admin !== true
            }
          />
        </div>
        {(usuario?.rol_jerarquico === "JEFE_DEPENDENCIA" ||
          usuario?.is_admin) && (
          <button
            onClick={() => imprimirFuncionariosPorTurno(startDate)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg ml-2
             flex items-center justify-center transition"
            title="Verificar"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={() =>
            navigate("/planilla-diaria", {
              state: { fecha: startDate.format("YYYY-MM-DD") },
            })
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded ml-2
             flex items-center gap-2 transition"
             title="Planilla Diaria"
        >
          <ClipboardList className="w-5 h-5" />
        </button>

        <div className="ml-auto">
          <button
            onClick={capturar}
            className="bg-green-500 hover:bg-green-300 text-white px-4 py-2 rounded shadow flex items-center gap-2"
            title="Capturar"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tablas */}
      <div
        id="contenedor-tablas"
        className="space-y-2 bg-white dark:bg-slate-800 rounded-lg shadow p-1 overflow-x-auto"
      >
        {turnosOrdenados.map((turno) => {
          const lista = funcionariosPorTurno(turno.id);

          return (
            <div key={turno.id} className="relative z-[1] -translate-x-2">
              <table className="min-w-full text-sm text-center border-collapse table-fixed w-full">
                <thead>
                  <tr className="bg-gray-200 dark:bg-slate-900">
                    <th className="border bg-white dark:bg-slate-800 px-2 py-1 text-left w-40 min-w-[8rem] sticky left-0 z-20">
                      <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-400 truncate">
                        {turno.nombre}
                      </h2>
                    </th>
                    {dias.map((d) => {
                      const fecha = d.format("YYYY-MM-DD");
                      const turnoActual = turno.nombre; // "Primer Turno", "Segundo Turno", etc.
                      const hayError =
                        controlTurnos[fecha] &&
                        controlTurnos[fecha][turnoActual] &&
                        controlTurnos[fecha][turnoActual].cumple === false;
                      return (
                        <th
                          key={fecha}
                          className="border px-2 py-1 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 w-12 relative"
                        >
                          {d.format("DD/MM")}
                          <br />
                          {d.format("ddd")}

                          {hayError && (
                            <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full"></div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {lista.length > 0 ? (
                    [...lista]
                      .sort((a, b) => {
                        const gradoA = a.grado || "";
                        const gradoB = b.grado || "";
                        if (gradoA > gradoB) return -1;
                        if (gradoA < gradoB) return 1;
                        const fechaA = new Date(a.fecha_ingreso);
                        const fechaB = new Date(b.fecha_ingreso);
                        if (fechaA < fechaB) return -1;
                        if (fechaA > fechaB) return 1;
                        return 0;
                      })
                      .map((f) => (
                        <tr key={f.id}>
                          <td
                            className="border bg-white dark:bg-slate-800 px-2 py-1 text-left w-40 whitespace-nowrap overflow-hidden truncate sticky left-0 z-10"
                            title={`G${f.grado} ${f.nombre}`}
                          >
                            G{f.grado} {abreviarNombre(f.nombre)}
                          </td>

                          {dias.map((d) => {
                            const valor = getCelda(f, d);
                            const { clase, contenido } = getTurnoProps(valor);

                            const puedeEditar =
                              usuario?.rol_jerarquico === "JEFE_DEPENDENCIA" ||
                              usuario?.is_admin === true;

                            return (
                              <td
                                key={d.format("YYYY-MM-DD")}
                                className={`border py-1 relative group ${
                                  turno?.nombre === "BROU"
                                    ? clase
                                    : contenido === "BROU"
                                    ? "text-xs text-white bg-blue-600"
                                    : clase
                                }`}
                              >
                                {contenido}
                                {puedeEditar && (
                                  <>
                                    {["L", "L.Ext", "CH", "L.Med"].includes(
                                      valor
                                    ) ? (
                                      <button
                                        onClick={() => {
                                          handleEliminarLicencia({
                                            usuario: f,
                                            dia: d.clone(),
                                          });
                                        }}
                                        className="absolute top-0 right-0 text-xs text-gray-500 p-1 opacity-0 group-hover:opacity-100 hover:text-red-700 transition"
                                        title="Eliminar Licencia"
                                      >
                                        ❌
                                      </button>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() =>
                                            setSelectorTipo({
                                              usuario: f,
                                              dia: d.clone(),
                                            })
                                          }
                                          className="absolute top-0 right-6 text-xs text-gray-500 p-1 opacity-0 group-hover:opacity-100 hover:text-blue-700 transition"
                                          title="Cambiar Guardia"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          onClick={() =>
                                            setSelectorLicencia({
                                              usuario: f,
                                              dia: d.clone(),
                                            })
                                          }
                                          className="absolute top-0 right-0 text-xs text-gray-500 p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition"
                                          title="Agregar Licencia"
                                        >
                                          📄
                                        </button>
                                      </>
                                    )}
                                  </>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td
                        colSpan={dias.length + 1}
                        className="text-center py-4 text-gray-500 dark:text-gray-400"
                      >
                        No hay funcionarios asignados a este turno.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      <ModalAgregarGuardia
        selectorTipo={selectorTipo}
        setSelectorTipo={setSelectorTipo}
        onConfirmar={handleCrearGuardia}
      />

      {selectorLicencia && (
        <ModalAgregarLicencia
          usuario={selectorLicencia.usuario}
          dia={selectorLicencia.dia}
          token={token}
          recargarLicencias={recargarGuaridas}
          onCerrar={() => setSelectorLicencia(null)}
        />
      )}

      <BottomNavbar />
    </div>
  );
}
