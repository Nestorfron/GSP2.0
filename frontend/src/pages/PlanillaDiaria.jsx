import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import html2pdf from "html2pdf.js";
import BottomNavbar from "../components/BottomNavbar"
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

dayjs.extend(utc);

const PlanillaDiaria = () => {
  const location = useLocation();
  const fechaInicial = location.state?.fecha || dayjs().format("YYYY-MM-DD");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(fechaInicial);
  const [funcionesEditadas, setFuncionesEditadas] = useState({});

  const {
    usuario,
    dependencias,
    turnos,
    guardias,
    licencias,
    extraordinarias,
    moviles = [],
  } = useAppContext();

  /* ================= DEPENDENCIA ================= */
  const miDependencia = dependencias.find((dep) =>
    dep.usuarios?.some(
      (u) => u.id === usuario.id)
  );
  if (!miDependencia) return null;

  /* ================= UTILIDADES ================= */
  const normalizar = (txt = "") =>
    txt.toUpperCase().replace(/\s+/g, " ").trim();

  const formatHorario = (inicio, fin) => {
    if (!inicio || !fin) return "FULL TIME";
    return `${inicio.slice(0, 2)} A ${fin.slice(0, 2)}`;
  };


  const funcionesTurnoT = [
    "Agregar función",
    "Chofer de Servicio",
    "Acompañante de Móvil",
    "Atención al Público",
    "Oficina Jurídica",
    "Egdo Turno/Chofer",
    "Egdo Turno/Acomp.Móvil",
  ];

  const obtenerFuncion = (f) => {
    const estado = estadoPorFuncionario[f.id]?.funcion;

    if (estado === "T") {
      return funcionesEditadas[f.id] || "Agregar función";
    }

    return estado || "Servicio";
  };



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
        return "Primer Turno";
      case "2DO":
        return "Segundo Turno";
      case "3ER":
        return "Tercer Turno";
      default:
        return funcion;
    }
  };

  /* ===== GUARDIAS (fecha exacta) ===== */
  guardias
    .filter(
      (g) =>
        dayjs(g.fecha_inicio).utc().format("YYYY-MM-DD") === fechaSeleccionada
    )
    .forEach((g) => {
      estadoPorFuncionario[g.usuario_id] = {
        funcion: getFuncion(g.tipo),
        fechaFin: null,
      };
    });

  /* ===== LICENCIAS (rango de fechas) ===== */
  licencias.forEach((l) => {
    const ini = dayjs(l.fecha_inicio).utc().startOf("day");
    const fin = dayjs(l.fecha_fin).utc().startOf("day");

    if (hoy >= ini && hoy <= fin) {
      estadoPorFuncionario[l.usuario_id] = {
        funcion: getFuncion(l.tipo),
        fechaFin: dayjs(l.fecha_fin).utc().format("DD/MM/YYYY"),
      };
    }
  });



  /* ================= ENCARGADO ================= */
  const encargado = miDependencia.usuarios.find(
    (u) => u.rol_jerarquico === "JEFE_DEPENDENCIA"
  );

  const estadoEncargado = estadoPorFuncionario[encargado?.id]?.funcion || "ENCARGADO DEPENDENCIA";

  const fechaFinEncargado =
    estadoPorFuncionario[encargado?.id]?.fechaFin || null;


  /* ================= CONTADOR GLOBAL ================= */
  let nro = 1;

  /* ================= FUERZA EFECTIVA ================= */
  const totalFuncionarios = miDependencia.usuarios.length;

  const deducidos = miDependencia.usuarios.filter((u) => {
    const estado = estadoPorFuncionario[u.id]?.funcion?.toUpperCase() || "";
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
          format: [
            elemento.scrollWidth + 20,
            elemento.scrollHeight + 20,
          ],
        });

        pdf.addImage(
          dataUrl,
          "PNG",
          0,
          0,
          elemento.scrollWidth + 20,
          elemento.scrollHeight + 20
        );

        pdf.save("Fuerza efectiva " + dayjs(fechaSeleccionada).format("DD/MM/YY") + ".pdf");
      })
      .catch((err) => {
        console.error("Error capturando pantalla:", err);

        elemento.style.width = originalWidth;
        elemento.style.height = originalHeight;
        elemento.style.padding = originalPadding;
      });
  };




  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      {/* CONTROLES */}
      <div className="flex gap-3 mb-4">
        <input
          type="date"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
          className="border px-2 py-1 text-sm"
        />
        <button
          onClick={capturar}
          className="px-3 py-1 bg-blue-600 text-white text-sm"
        >
          Exportar PDF
        </button>
      </div>

      <div id="planilla-pdf" className="bg-gray-300 p-4 text-xs text-black mb-4">
        {/* ENCABEZADO */}
        <table className="w-full mb-3 bg-white border border-black">
          <tbody>
            <tr>
              <td className="border font-bold w-32">SECCIONAL:</td>
              <td className="border font-bold">
                {miDependencia.nombre.toUpperCase()}
              </td>
              <td className="border font-bold w-24">FECHA:</td>
              <td className="border font-bold w-32">
                {dayjs(fechaSeleccionada).format("DD/MM/YY")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= ENCARGADO ================= */}
        {encargado && (
          <table className="w-full bg-white border mb-3 table-fixed">
            <thead>
              <tr>
                <th className="border w-[30px]">Nro.</th>
                <th className="border w-[60px]">GRADO</th>
                <th className="border min-w-[300px]">NOMBRE</th>
                <th className="border min-w-[200px]">FUNCIÓN</th>
                <th className="border w-[90px]">HORARIO</th>
                <th className="border w-[80px]">RÉGIMEN</th>
                <th className="border">OBSERVACIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border text-center align-middle">{nro++}</td>
                <td className="border text-center align-middle">
                  {encargado.grado}
                </td>
                <td className="border align-middle break-words whitespace-normal">
                  {encargado.nombre}
                </td>
                <td className="border align-middle break-words whitespace-normal">
                  {estadoEncargado}
                </td>
                <td className="border text-center align-middle">FULL TIME</td>
                <td className="border text-center align-middle">24hs</td>
                <td className="border align-middle break-words whitespace-normal">
                  {fechaFinEncargado ? `Hasta ${fechaFinEncargado.slice(0, 5)}` : ""}
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
            <table
              key={turno.id}
              className="w-full bg-white mb-3"
            >
              <thead>
                <tr>
                  <th className=" w-[90px] bg-yellow-300">{nombreTurno}</th>
                  <th className="border w-[30px]">Nro.</th>
                  <th className="border w-[50px]">GRADO</th>
                  <th className="border min-w-[250px]">NOMBRE</th>
                  <th className="border min-w-[200px]">FUNCIÓN</th>
                  <th className="border w-[90px]">HORARIO</th>
                  <th className="border w-[80px]">RÉGIMEN</th>
                  <th className="border">OBSERVACIONES</th>
                </tr>
              </thead>
              <tbody>
                {funcionarios.map((f, i) => (
                  <tr key={f.id}>
                    {i === 0 && (
                      <td
                        rowSpan={funcionarios.length}
                        className="bg-gray-300"
                      >

                      </td>
                    )}
                    <td className="border text-center">{nro++}</td>
                    <td className="border text-center">{f.grado}</td>
                    <td className="border">{f.nombre}</td>
                    <td className="border">
                      {estadoPorFuncionario[f.id]?.funcion === "T" ? (
                        <select
                          value={funcionesEditadas[f.id] || "Agregar función"}
                          onChange={(e) =>
                            setFuncionesEditadas((prev) => ({
                              ...prev,
                              [f.id]: e.target.value,
                            }))
                          }
                          className="w-full text-xs bg-transparent outline-none"
                        >
                          {funcionesTurnoT.map((opcion) => (
                            <option key={opcion} value={opcion}>
                              {opcion}
                            </option>
                          ))}
                        </select>
                      ) : (
                        obtenerFuncion(f)
                      )}
                    </td>

                    <td className="border text-center">
                      {turno.nombre === "Destacados" ? "24hs" : formatHorario(turno.hora_inicio, turno.hora_fin)}
                    </td>
                    <td className="border text-center">{turno.nombre === "Destacados" ? "FULL TIME" : "8 horas"} </td>
                    <td className="border">{estadoPorFuncionario[f.id]?.funcion === "Licencia Médica" || estadoPorFuncionario[f.id]?.funcion === "Licencia Anual" ? "Hasta " + estadoPorFuncionario[f.id]?.fechaFin?.slice(0, 5) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        })}

        {/* ================= FUERZA EFECTIVA ================= */}
        <table className="w-full border bg-white border-black mt-2">
          <tbody>
            <tr className="font-bold">
              <td className="border px-1">FUERZA EFECTIVA TOTAL:</td>
              <td className="border w-16 text-center">
                {totalFuncionarios}
              </td>
              <td className="border px-1">SE DEDUCEN:</td>
              <td className="border w-16 text-center">{deducidos}</td>
              <td className="border px-1">
                FUERZA EFECTIVA EN SERVICIO:
              </td>
              <td className="border w-16 text-center">{enServicio}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <BottomNavbar />
    </div>
  );
};

export default PlanillaDiaria;
