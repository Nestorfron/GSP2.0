import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import BottomNavbar from "../components/BottomNavbar";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import Loading from "../components/Loading";
import { ArrowDown } from "lucide-react";
import IconButtom from "../components/IconButton";

dayjs.extend(utc);

const PlanillaDiaria = () => {
  const location = useLocation();
  const fechaInicial = location.state?.fecha || dayjs().format("YYYY-MM-DD");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(fechaInicial);
  const [funcionesEditadas, setFuncionesEditadas] = useState({});
  const [situacionesEditadas, setSituacionesEditadas] = useState({});
  const [exportando, setExportando] = useState(false);
  const [funcionesTurnoT, setFuncionesTurnoT] = useState([
    "Chofer de Servicio",
    "Acompañante de Móvil",
    "Atención al Público",
    "Oficina Jurídica",
    "Encargado de Turno",
    "Egdo. Turno/Chofer",
    "Egdo. Turno/Acomp.Móvil",
    "Egdo. Turno/At. al Público",
    "Custodia",
    "Servicio Exterior",
    "Curso",
  ]);

  const {
    usuario,
    dependencias,
    turnos,
    guardias,
    licencias,
    extraordinarias,
    vehiculos,
    funciones,
    loading,
    obtenerGrado,
  } = useAppContext();

  /* ================= DEPENDENCIA ================= */
  const miDependencia = dependencias.find((dep) =>
    dep.usuarios?.some((u) => u.id === usuario.id)
  );
  if (!miDependencia) return null;

  /* ================= UTILIDADES ================= */
  const normalizar = (txt = "") =>
    txt.toUpperCase().replace(/\s+/g, " ").trim();

  const formatHorario = (inicio, fin) => {
    if (!inicio || !fin) return "FULL TIME";
    return `${inicio.slice(0, 2)} A ${fin.slice(0, 2)}`;
  };

  const situacionVehiculo = ["FUERA DE SERVICIO"];

  const nombreFuncion = (id) => funciones.find((f) => f.id === id)?.descripcion;

  const obtenerFuncion = (f) => {
    const estado = estadoPorFuncionario[f.id]?.tipo;
    if (estado === "T") {
      return funcionesEditadas[f.id] || "Agregar función";
    }
    return estado || "Servicio";
  };

  const getNomobreSeccional = (nombre) => {
    switch (nombre) {
      case "SECCIONAL 1":
        return "PRIMERA";
      case "SECCIONAL 2":
        return "SEGUNDA";
      case "SECCIONAL 3":
        return "TERCERA";
      case "SECCIONAL 4":
        return "CUARTA";
      case "SECCIONAL 5":
        return "QUINTA";
      case "SECCIONAL 6":
        return "SEXTA";
      case "SECCIONAL 7":
        return "SÉPTIMA";
      case "SECCIONAL 8":
        return "OCTAVA";
      case "SECCIONAL 9":
        return "NOVENA";
      case "SECCIONAL 10":
        return "DÉCIMA";
      case "SECCIONAL 11":
        return "DECIMOPRIMERA";
      default:
        return nombre;
    }
  };

  const getFuncion = (funcion = "") => {
    switch (normalizar(funcion)) {
      case "REGLAMENTARIA":
        return "Licencia Anual";
      case "MEDICA":
        return "Licencia Médica";
      case "DESCANSO":
      case "D":
        return "Licencia Semanal";
      case "1ER":
        return "Primer Turno (06 a 14)";
      case "2DO":
        return "Segundo Turno (14 a 22)";
      case "3ER":
        return "Tercer Turno (22 a 06)";
      default:
        return funcion;
    }
  };

  /* ================= VEHICULOS ================= */
  const dependenciaVehiculos = vehiculos.filter(
    (v) => v.dependencia_id === miDependencia.id
  );

  /* ================= TURNOS ================= */
  const ordenTurnos = [
    "PRIMER TURNO",
    "SEGUNDO TURNO",
    "TERCER TURNO",
    "DESTACADOS",
    "BROU",
  ];

  const getNombreTurno = (nombre) => {
    switch (normalizar(nombre)) {
      case "PRIMER TURNO":
        return "1er Turno";
      case "SEGUNDO TURNO":
        return "2do Turno";
      case "TERCER TURNO":
        return "3er Turno";
      case "DESTACADOS":
        return "DEST.";
      case "BROU":
        return "EVENTUALES";
      default:
        return nombre;
    }
  };

  const misTurnos = turnos
    .filter((t) => t.dependencia_id === miDependencia.id)
    .sort(
      (a, b) =>
        ordenTurnos.indexOf(normalizar(a.nombre)) -
        ordenTurnos.indexOf(normalizar(b.nombre))
    );

  /* ================= FECHA ================= */
  const hoy = dayjs(fechaSeleccionada).utc().startOf("day");

  /* ================= ESTADOS ================= */

  const estadoPorFuncionario = {};

  /* ===== GUARDIAS (fecha exacta) ===== */
  guardias
    .filter(
      (g) =>
        dayjs(g.fecha_inicio).utc().format("YYYY-MM-DD") === fechaSeleccionada
    )
    .forEach((g) => {
      estadoPorFuncionario[g.usuario_id] = {
        tipo: getFuncion(g.tipo),
        fechaFin: null,
      };
    });

  /* ===== LICENCIAS (rango de fechas) ===== */
  licencias.forEach((l) => {
    const ini = dayjs(l.fecha_inicio).utc().startOf("day");
    const fin = dayjs(l.fecha_fin).utc().startOf("day");

    if (hoy >= ini && hoy <= fin) {
      estadoPorFuncionario[l.usuario_id] = {
        tipo: getFuncion(l.tipo),
        fechaFin: dayjs(l.fecha_fin).utc().format("DD/MM/YYYY"),
      };
    }
  });

  /* ================= ENCARGADO ================= */
  const encargado = miDependencia.usuarios.find(
    (u) => u.rol_jerarquico === "JEFE_DEPENDENCIA"
  );

  const estadoEncargado =
    estadoPorFuncionario[encargado?.id]?.tipo || "ENCARGADO DEPENDENCIA";

  const fechaFinEncargado =
    estadoPorFuncionario[encargado?.id]?.fechaFin || null;

  /* ================= CONTADOR GLOBAL ================= */
  let nro = 1;

  /* ================= FUERZA EFECTIVA ================= */
  const totalFuncionarios = miDependencia.usuarios.length;

  const deducidos = miDependencia.usuarios.filter((u) => {
    const estado = estadoPorFuncionario[u.id]?.tipo?.toUpperCase() || "";
    return (
      estado.includes("LICENCIA MÉDICA") ||
      estado.includes("LICENCIA ANUAL") ||
      estado.includes("EXTRAORDINARIA") ||
      estado.includes("LICENCIA SEMANAL") ||
      estado === "D"
    );
  }).length;

  const enServicio = totalFuncionarios - deducidos;

  /* ================= PDF ================= */
  const capturar = () => {
    setExportando(true);
    setTimeout(async () => {
      const elemento = document.getElementById("planilla-pdf");

      const originalWidth = elemento.style.width;
      const originalHeight = elemento.style.height;
      const originalPadding = elemento.style.padding;

      elemento.style.padding = "20px";
      elemento.style.width = elemento.scrollWidth + 20 + "px";
      elemento.style.height = elemento.scrollHeight + 20 + "px";

      toPng(elemento, {
        cacheBust: true,
        width: elemento.scrollWidth + 20,
        height: elemento.scrollHeight + 20,
        pixelRatio: 2, // 🔥 más nitidez
      })
        .then((dataUrl) => {
          // restaurar estilos
          elemento.style.width = originalWidth;
          elemento.style.height = originalHeight;
          elemento.style.padding = originalPadding;

          // crear PDF
          const pdf = new jsPDF({
            orientation: "landscape",
            unit: "px",
            format: [elemento.scrollWidth + 20, elemento.scrollHeight + 20],
          });
          pdf.addImage(
            dataUrl,
            "PNG",
            0,
            0,
            elemento.scrollWidth + 20,
            elemento.scrollHeight + 20
          );

          pdf.save(
            "Fuerza efectiva " +
              dayjs(fechaSeleccionada).format("DD/MM/YY") +
              ".pdf"
          );
        })
        .catch((err) => {
          console.error("Error capturando pantalla:", err);

          elemento.style.width = originalWidth;
          elemento.style.height = originalHeight;
          elemento.style.padding = originalPadding;
        });

      setExportando(false);
    }, 50);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen  bg-gradient-to-b from-blue-50 to-white p-4">
      {/* CONTROLES */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="date"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
          className="border px-2 py-1 text-sm"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={capturar}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg ml-2
             flex items-center justify-center transition"
            title="Exportar PDF"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-screen-lg w-full overflow-x-auto m-auto">
        <div
          id="planilla-pdf"
          className="bg-gray-300 p-4 text-xs text-black mb-4 min-w-[1000px] mb-10"
        >
          {/* ENCABEZADO */}
          <table className="w-1/2 mb-3">
            <tbody>
              <tr className="bg-white text-center">
                <td className="border font-bold w-32">SECCIONAL:</td>
                <td className="border font-bold w-32">
                 {getNomobreSeccional(miDependencia.nombre.toUpperCase())}
                </td>
                <td className="bg-gray-300 w-32"></td>
                <td className="border font-bold w-24">FECHA:</td>
                <td className="border font-bold w-32">
                  {dayjs(fechaSeleccionada).format("DD/MM/YY")}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ================= ENCARGADO ================= */}
          {encargado && (
            <table className="w-full mb-3">
              <thead>
                <tr className="bg-white">
                  <th className="w-[90px] bg-gray-300"></th>
                  <th className="border w-[30px]">Nro.</th>
                  <th className="border w-[50px]">GRADO</th>
                  <th className="border min-w-[250px]">NOMBRE</th>
                  <th className="border min-w-[180px]">FUNCIÓN</th>
                  <th className="border w-[90px]">HORARIO</th>
                  <th className="border w-[80px]">RÉGIMEN</th>
                  <th className="border w-[150px]">OBSERVACIONES</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="bg-gray-300"></td>
                  <td className="border text-center align-middle">{nro++}</td>
                  <td className="border text-center align-middle">
                    {obtenerGrado(encargado.grado)}
                  </td>
                  <td className="border align-middle break-words whitespace-normal">
                    {encargado.nombre}
                  </td>
                  <td className="border align-middle break-words whitespace-normal px-1">
                    {estadoEncargado}
                  </td>
                  <td className="border text-center align-middle">FULL TIME</td>
                  <td className="border text-center align-middle">24hs</td>
                  <td className="border align-middle break-words whitespace-normal px-1">
                    {fechaFinEncargado
                      ? `Hasta ${fechaFinEncargado.slice(0, 5)}`
                      : ""}
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {/* ================= TURNOS ================= */}
          {misTurnos.map((turno) => {
            const funcionarios = miDependencia.usuarios
              .filter(
                (u) =>
                  u.turno_id === turno.id &&
                  u.rol_jerarquico !== "JEFE_DEPENDENCIA"
              )
              .sort((a, b) => {
                if (a.grado > b.grado) return -1;
                if (a.grado < b.grado) return 1;
                return new Date(a.fecha_ingreso) - new Date(b.fecha_ingreso);
              });

            if (!funcionarios.length) return null;

            const nombreTurno = getNombreTurno(turno.nombre);

            return (
              <table key={turno.id} className="w-full mb-3">
                <thead>
                  <tr className="bg-white">
                    <th className="w-[90px] bg-yellow-300">{nombreTurno}</th>
                    <th className="border w-[30px]">Nro.</th>
                    <th className="border w-[50px]">GRADO</th>
                    <th className="border min-w-[250px]">NOMBRE</th>
                    <th className="border min-w-[180px]">FUNCIÓN</th>
                    <th className="border w-[90px]">HORARIO</th>
                    <th className="border w-[80px]">RÉGIMEN</th>
                    <th className="border w-[150px]">OBSERVACIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionarios.map((f, i) => (
                    <tr key={f.id}>
                      {i === 0 && (
                        <td
                          rowSpan={funcionarios.length}
                          className="bg-gray-300"
                        ></td>
                      )}
                      <td className="border text-center bg-white">{nro++}</td>
                      <td className="border text-center bg-white">
                        {obtenerGrado(f.grado)}
                      </td>
                      <td className="border bg-white">{f.nombre}</td>
                      <td className="border bg-white px-2">
                        {estadoPorFuncionario[f.id]?.tipo === "T" ? (
                          exportando ? (
                            <span className="block bg-white text-xs">
                              {funcionesEditadas[f.id] ??
                                nombreFuncion(f.funcion_id)}
                            </span>
                          ) : (
                            <select
                              value={
                                funcionesEditadas[f.id] ?? "Agregar función"
                              }
                              onChange={(e) =>
                                setFuncionesEditadas((prev) => ({
                                  ...prev,
                                  [f.id]: e.target.value,
                                }))
                              }
                              className="w-full text-xs bg-white outline-none"
                            >
                              <option value={f.funcion_id}>
                                {nombreFuncion(f.funcion_id)}
                              </option>
                              {funcionesTurnoT.map((opcion, index) => (
                                <option key={index} value={opcion}>
                                  {opcion}
                                </option>
                              ))}
                            </select>
                          )
                        ) : (
                          <span className="block bg-white text-xs">
                            {obtenerFuncion(f)}
                          </span>
                        )}
                      </td>

                      <td className="border bg-white text-center">
                        {turno.nombre === "Destacados"
                          ? "24hs"
                          : formatHorario(turno.hora_inicio, turno.hora_fin)}
                      </td>
                      <td className="border bg-white text-center">
                        {turno.nombre === "Destacados"
                          ? "FULL TIME"
                          : "8 horas"}{" "}
                      </td>
                      <td className="border bg-white px-1">
                        {estadoPorFuncionario[f.id]?.tipo ===
                          "Licencia Médica" ||
                        estadoPorFuncionario[f.id]?.tipo === "Licencia Anual"
                          ? "Hasta " +
                            estadoPorFuncionario[f.id]?.fechaFin?.slice(0, 5)
                          : ""}
                        {turno.nombre === "Destacados" &&
                        estadoPorFuncionario[f.id]?.tipo !==
                          "Licencia Semanal" &&
                        estadoPorFuncionario[f.id]?.tipo !==
                          "Licencia Médica" &&
                        estadoPorFuncionario[f.id]?.tipo !== 
                        "Licencia Anual" &&
                        estadoPorFuncionario[f.id]?.tipo !== "T" ? (
                          exportando ? (
                            <span className="block bg-white text-xs">
                              {funcionesEditadas[f.id] ??
                                nombreFuncion(f.funcion_id)}
                            </span>
                          ) : (
                            <select
                              value={
                                funcionesEditadas[f.id] ?? "Agregar función"
                              }
                              onChange={(e) =>
                                setFuncionesEditadas((prev) => ({
                                  ...prev,
                                  [f.id]: e.target.value,
                                }))
                              }
                              className="w-full text-xs bg-white outline-none"
                            >
                              <option value={f.funcion_id}>
                                {nombreFuncion(f.funcion_id)}
                              </option>
                              {funcionesTurnoT.map((opcion, index) => (
                                <option key={index} value={opcion}>
                                  {opcion}
                                </option>
                              ))}
                            </select>
                          )
                        ) : (
                          ""
                        )}
                        {""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })}

          {/* ================= VEHICULOS ================= */}
          {dependenciaVehiculos.length > 0 && (
            <table className="bg-white border border-black mt-3 text-xs">
              <thead>
                <tr>
                  <th
                    colSpan={3}
                    className="border bg-yellow-300 text-left px-2 font-bold"
                  >
                    MÓVILES
                  </th>
                </tr>
                <tr>
                  <th className="border w-[40px] text-center">Nro.</th>
                  <th className="border w-[120px] text-center">MATRÍCULA</th>
                  <th className="border">SITUACIÓN</th>
                </tr>
              </thead>

              <tbody>
                {dependenciaVehiculos.map((m, index) => (
                  <tr key={m.id}>
                    <td className="border text-center">{index + 1}</td>

                    <td className="border text-center">{m.matricula}</td>

                    <td className="border px-2">
                      {exportando ? (
                        <span className="block text-center">
                          {situacionesEditadas[m.id] ?? m.estado}
                        </span>
                      ) : (
                        <select
                          value={situacionesEditadas[m.id] ?? m.estado}
                          onChange={(e) =>
                            setSituacionesEditadas((prev) => ({
                              ...prev,
                              [m.id]: e.target.value,
                            }))
                          }
                          className="w-full text-xs bg-transparent outline-none"
                        >
                          <option value={m.estado}>{m.estado}</option>
                          {situacionVehiculo.map((opcion) => (
                            <option key={opcion} value={opcion}>
                              {opcion}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ================= FUERZA EFECTIVA ================= */}
          <table className="w-full border bg-white border-black mt-2">
            <tbody>
              <tr className="font-bold">
                <td className="border px-1">FUERZA EFECTIVA TOTAL:</td>
                <td className="border w-16 text-center">{totalFuncionarios}</td>
                <td className="border px-1">SE DEDUCEN:</td>
                <td className="border w-16 text-center">{deducidos}</td>
                <td className="border px-1">FUERZA EFECTIVA EN SERVICIO:</td>
                <td className="border w-16 text-center">{enServicio}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <BottomNavbar />
      </div>
    </div>
  );
};

export default PlanillaDiaria;
