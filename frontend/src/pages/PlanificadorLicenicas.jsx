import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
  Camera,
  PlusCircle,
  Pencil,
  XCircle,
} from "lucide-react";
import { toPng } from "html-to-image";
import IconButton from "../components/IconButton";
import { postData, deleteData } from "../utils/api";
import Navbar from "../components/BottomNavbar";
import BackButton from "../components/BackButton";
import { useAppContext } from "../context/AppContext";
import { estaTokenExpirado } from "../utils/tokenUtils";
import dayjs from "dayjs";
import "dayjs/locale/es";
import Loading from "../components/Loading";

dayjs.locale("es");

// ----------------------------------
// COLORES DE LOS 8 PERÍODOS
// ----------------------------------

const coloresPeriodos = [
  {
    borde: "border-blue-500",
    texto: "text-blue-700 dark:text-blue-400",
    fondo: "bg-blue-600",
  },
  {
    borde: "border-green-500",
    texto: "text-green-700 dark:text-green-400",
    fondo: "bg-green-600",
  },
  {
    borde: "border-purple-500",
    texto: "text-purple-700 dark:text-purple-400",
    fondo: "bg-purple-600",
  },
  {
    borde: "border-orange-500",
    texto: "text-orange-700 dark:text-orange-400",
    fondo: "bg-orange-600",
  },
  {
    borde: "border-cyan-500",
    texto: "text-cyan-700 dark:text-cyan-400",
    fondo: "bg-cyan-600",
  },
  {
    borde: "border-pink-500",
    texto: "text-pink-700 dark:text-pink-400",
    fondo: "bg-pink-600",
  },
  {
    borde: "border-yellow-500",
    texto: "text-yellow-700 dark:text-yellow-400",
    fondo: "bg-yellow-600",
  },
  {
    borde: "border-red-500",
    texto: "text-red-700 dark:text-red-400",
    fondo: "bg-red-600",
  },
];

// ----------------------------------
// ORDEN DE TURNOS
// ----------------------------------

const ordenTurnos = [
  "Primer Turno",
  "1er Turno 7 a 15",
  "BROU 11 a 19",
  "2do Turno 15 a 23",
  "3er Turno 23 a 07",
  "Desarmados",
  "Interna",
  "Jurídica",
  "Segundo Turno",
  "Tercer Turno",
  "Destacados",
  "Primera Guardia",
  "Segunda Guardia",
  "Tercera Guardia",
  "Cuarta Guardia",
];

export default function SeleccionarPeriodosLicencia() {
  const navigate = useNavigate();

  const {
    token,
    usuario,
    dependencias = [],
    turnos = [],
    obtenerGradoAbreviado,
    periodosLicencia,
    loading,
    recargarPeriodosLicencia,
    recargarDependencias,
  } = useAppContext();

  const [selecciones, setSelecciones] = useState({});
  const [mostrarResumen, setMostrarResumen] = useState(false);

  const year = 2027;

  const exportarGrillaPNG = async () => {
    const elemento = document.getElementById("grilla-licencias");

    if (!elemento) {
      alert("No se encontró la grilla para exportar.");
      return;
    }

    const anchoOriginal = elemento.style.width;
    const altoOriginal = elemento.style.height;
    const paddingOriginal = elemento.style.padding;
    const overflowOriginal = elemento.style.overflow;

    const ancho = elemento.scrollWidth;
    const alto = elemento.scrollHeight;

    try {
      elemento.style.width = `${ancho + 10}px`;
      elemento.style.height = `${alto + 10}px`;
      elemento.style.padding = "10px";
      elemento.style.overflow = "visible";

      const imagen = await toPng(elemento, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        width: ancho + 20,
        height: alto + 20,
        pixelRatio: 1,
      });

      const link = document.createElement("a");
      link.download = `planificación-licencias.png`;
      link.href = imagen;
      link.click();
    } catch (error) {
      console.error("Error exportando la grilla:", error);
      alert("No se pudo exportar la grilla.");
    } finally {
      elemento.style.width = anchoOriginal;
      elemento.style.height = altoOriginal;
      elemento.style.padding = paddingOriginal;
      elemento.style.overflow = overflowOriginal;
    }
  };

  // ----------------------------------
  // CONTROL DE ACCESO
  // ----------------------------------

  useEffect(() => {
    if (!token || estaTokenExpirado(token)) {
      navigate("/login");
    }
  }, [token, navigate]);

  // ----------------------------------
  // DEPENDENCIA
  // ----------------------------------

  const miDependencia = dependencias.find((dep) =>
    dep.usuarios?.some((u) => u.id === usuario?.id)
  );

  useEffect(() => {
    if (!miDependencia?.usuarios) return;

    const inicial = {};

    miDependencia.usuarios.forEach((funcionario) => {
      inicial[`${funcionario.id}`] = (funcionario.periodos_licencia || []).map(
        (periodo) => Number(typeof periodo === "object" ? periodo.id : periodo)
      );
    });

    setSelecciones(inicial);
  }, [miDependencia?.usuarios]);

  // ----------------------------------
  // PERÍODOS DE LICENCIA
  // ----------------------------------

  const periodosFiltrados = periodosLicencia
    .filter(
      (periodo) => Number(periodo.dependencia_id) === Number(miDependencia.id)
    )
    .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));

  // ----------------------------------
  // TURNOS ORDENADOS
  // ----------------------------------

  const turnosOrdenados = useMemo(() => {
    if (!miDependencia) return [];

    return turnos
      .filter((t) => t.dependencia_id === miDependencia.id)
      .sort((a, b) => {
        const indexA = ordenTurnos.indexOf(a.nombre);
        const indexB = ordenTurnos.indexOf(b.nombre);

        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      });
  }, [turnos, miDependencia]);

  // ----------------------------------
  // ORDENAR FUNCIONARIOS
  // ----------------------------------

  const ordenarFuncionarios = (lista) => {
    return [...lista].sort((a, b) => {
      const gradoA = a.grado || "";
      const gradoB = b.grado || "";

      if (gradoA > gradoB) return -1;
      if (gradoA < gradoB) return 1;

      const fechaA = new Date(a.fecha_ingreso);
      const fechaB = new Date(b.fecha_ingreso);

      return fechaA - fechaB;
    });
  };

  const funcionariosPorTurno = (turnoId) => {
    if (!miDependencia) return [];

    const funcionarios = miDependencia.usuarios.filter(
      (f) => f.rol_jerarquico !== "JEFE_DEPENDENCIA" && f.turno_id === turnoId
    );
    return ordenarFuncionarios(funcionarios);
  };

  // ----------------------------------
  // ABREVIAR NOMBRES
  // ----------------------------------

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

  // ----------------------------------
  // SELECCIONAR / DESELECCIONAR PERÍODO
  // ----------------------------------

  const togglePeriodo = async (funcionarioId, periodoId) => {
    const clave = `${funcionarioId}`;
    const idPeriodo = Number(periodoId);
    const actuales = selecciones[clave] || [];

    const estaAsignado = actuales.includes(idPeriodo);

    try {
      let nuevos;

      if (estaAsignado) {
        await deleteData(
          `/usuarios/${funcionarioId}/periodos-licencia/${idPeriodo}`,
          token
        );

        nuevos = actuales.filter((id) => id !== idPeriodo);
      } else {
        const response = await postData(
          `/usuarios/${funcionarioId}/periodos-licencia/${idPeriodo}`,
          {},
          token
        );

        nuevos = response.periodos_asignados.map(Number);
      }

      setSelecciones((prev) => ({
        ...prev,
        [clave]: [...nuevos].sort((a, b) => a - b),
      }));

      setMostrarResumen(false);

      recargarDependencias();
    } catch (error) {
      console.error("Error al modificar período:", error);
      alert(error.message);
    }
  };

  // ----------------------------------
  // SELECCIONAR TODOS LOS PERÍODOS
  // DE UN FUNCIONARIO
  // ----------------------------------

  const seleccionarTodosFuncionario = (funcionarioId) => {
    const clave = `${funcionarioId}`;

    setSelecciones((prev) => {
      const actuales = prev[clave] || [];

      return {
        ...prev,
        [clave]:
          actuales.length === periodos.length ? [] : periodos.map((p) => p.id),
      };
    });

    setMostrarResumen(false);
  };

  // ----------------------------------
  // RESUMEN GENERAL
  // ----------------------------------

  const totalSeleccionados = Object.values(selecciones).reduce(
    (total, lista) => total + lista.length,
    0
  );

  const funcionariosSeleccionados = Object.values(selecciones).filter(
    (lista) => lista.length > 0
  ).length;

  // ----------------------------------
  // CONFIRMAR SELECCIÓN
  // ----------------------------------

  const handleConfirmar = () => {
    if (totalSeleccionados === 0) {
      alert("No hay períodos seleccionados.");
      return;
    }

    const resultado = Object.entries(selecciones)
      .filter(([id, lista]) => lista.length > 0)
      .map(([id, lista]) => ({
        usuario_id: Number(id),
        periodos: periodos.filter((p) => lista.includes(p.id)),
      }));

    console.log("Planificación de licencias:", resultado);

    setMostrarResumen(true);
  };

  // ----------------------------------
  // LIMPIAR SELECCIONES
  // ----------------------------------

  const limpiarTodo = () => {
    setSelecciones({});
    setMostrarResumen(false);
  };

  // ----------------------------------
  // VALIDACIÓN
  // ----------------------------------

  if (!miDependencia) {
    return <Loading />;
  }

  const cantidadFuncionarios = miDependencia.usuarios.filter(
    (f) => f.rol_jerarquico !== "JEFE_DEPENDENCIA"
  ).length;

  // ----------------------------------
  // ELIMINAR PERIODO LICENCIA
  // ----------------------------------

  const handleDelete = async (id) => {
    try {
      await deleteData(`/periodos_licencia/${id}`, token);
      recargarPeriodosLicencia();
    } catch (error) {
      alert("No se pudo eliminar la prenda.");
    }
  };

  // ----------------------------------
  // RENDER
  // ----------------------------------

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="m-3 mb-24 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-lg flex-grow w-full lg:w-3/4 xl:max-w-7xl mx-auto">
        {/* ENCABEZADO */}

        <div className="flex items-center justify-center gap-2 mb-2">
          <CalendarDays
            className="text-blue-600 dark:text-blue-300"
            size={28}
          />

          <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-200">
            Planificador de licencias
          </h1>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-5">
          {miDependencia.nombre} · Año {year}
        </p>

        <IconButton
          className="ms-auto my-2"
          icon={PlusCircle}
          tooltip="Agregar periodo licencia"
          onClick={() => navigate(`/crear-periodo-licencia`)}
          size="sm"
        />

        {/* RESUMEN GENERAL */}

        {/* <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-blue-50 dark:bg-slate-800 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Funcionarios
            </p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
              {cantidadFuncionarios}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-slate-800 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Seleccionados
            </p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
              {funcionariosSeleccionados}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-slate-800 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Selecciones
            </p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
              {totalSeleccionados}
            </p>
          </div>
        </div> */}

        {/* REFERENCIA DE PERÍODOS */}

        {/* <div className="mb-4">
          <h2 className="font-semibold text-sm text-blue-900 dark:text-blue-300 mb-2">
            Períodos disponibles
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-2">
            {periodos.map((p, index) => {
              const color = coloresPeriodos[index];

              return (
                <div
                  key={p.id}
                  className={`border-l-4 ${color.borde} bg-gray-50 dark:bg-slate-800 rounded p-2`}
                >
                  <p className={`font-semibold text-xs ${color.texto}`}>
                    Período {p.id}
                  </p>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {dayjs(p.fecha_inicio).format("DD/MM")}
                    {" - "}
                    {dayjs(p.fecha_fin).format("DD/MM")}
                  </p>
                </div>
              );
            })}
          </div>
        </div> */}

        {/* GRILLA DE FUNCIONARIOS */}

        <div
          id="grilla-licencias"
          className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700"
        >
          <table className="w-full table-fixed border-collapse text-xs text-center">
            <colgroup>
              <col style={{ width: "170px" }} />

              {periodosFiltrados.map((p) => (
                <col key={p.id} style={{ width: "110px" }} />
              ))}
            </colgroup>

            <thead>
              <tr className="bg-gray-100 dark:bg-slate-800">
                <th className="sticky left-0 z-30 w-[190px] min-w-[190px] border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 px-2 py-1 text-left">
                  Funcionario
                </th>

                {periodosFiltrados.map((p, index) => {
                  const color = coloresPeriodos[index];

                  return (
                    <th
                      key={p.id}
                      className={`border border-gray-200 dark:border-slate-700 border-t-4 ${color.borde} px-1 py-0.5`}
                    >
                      <div
                        className={`font-bold ${color.texto} flex items-center justify-center gap-1 whitespace-nowrap`}
                      >
                        <h3 className="mb-0">Período {index + 1}</h3>

                        <IconButton
                          icon={Pencil}
                          tooltip="Editar período licencia"
                          onClick={() =>
                            navigate("/editar-periodo-licencia", {
                              state: { periodo: p },
                            })
                          }
                          size="xxs"
                        />

                        <IconButton
                          icon={XCircle}
                          tooltip="Eliminar período licencia"
                          onClick={() => handleDelete(p.id)}
                          size="xxs"
                        />
                      </div>

                      <div className="mt-0.5 text-[10px] leading-3 font-normal text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {dayjs(p.fecha_inicio).utc().format("DD/MM")}
                        <br />
                        al {dayjs(p.fecha_fin).utc().format("DD/MM")}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {turnosOrdenados.map((turno) => {
                const funcionarios = funcionariosPorTurno(turno.id);

                if (funcionarios.length === 0) return null;

                return (
                  <React.Fragment key={turno.id}>
                    {/* ENCABEZADO DEL TURNO */}
                    <tr className="bg-blue-100 dark:bg-slate-800">
                      <td
                        colSpan={periodosFiltrados.length + 1}
                        className="border border-gray-200 dark:border-slate-700 px-2 py-0.5 text-left font-bold text-blue-900 dark:text-blue-300"
                      >
                        {turno.nombre}

                        <span className="ml-2 text-[10px] font-normal text-gray-500 dark:text-gray-400">
                          ({funcionarios.length} funcionarios)
                        </span>
                      </td>
                    </tr>

                    {/* FUNCIONARIOS */}
                    {funcionarios.map((f) => {
                      const seleccionados = selecciones[f.id] || [];

                      return (
                        <tr
                          key={f.id}
                          className="hover:bg-blue-50 dark:hover:bg-slate-800/70"
                        >
                          {/* NOMBRE DEL FUNCIONARIO */}
                          <td
                            className="sticky left-0 z-10 w-[190px] min-w-[190px] border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-0.5 text-left leading-tight"
                            title={`${obtenerGradoAbreviado(f.grado)} ${f.nombre
                              }`}
                          >
                            <div className="truncate font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                              {obtenerGradoAbreviado(f.grado)}{" "}
                              {abreviarNombre(f.nombre)}
                            </div>

                            {f.medio_horario && (
                              <span className="rounded bg-yellow-100 px-1 text-[9px] leading-none text-yellow-800">
                                1/2 horario
                              </span>
                            )}
                          </td>

                          {/* PERÍODOS DE LICENCIA */}
                          {periodosFiltrados.map((p, index) => {
                            const activo = seleccionados.includes(Number(p.id));
                            const color = coloresPeriodos[index];

                            return (
                              <td
                                key={p.id}
                                className="w-[110px] border border-gray-200 dark:border-slate-700 px-1 py-0.5"
                              >
                                <button
                                  type="button"
                                  onClick={() => togglePeriodo(f.id, p.id)}
                                  aria-label={`Funcionario ${f.nombre}, período ${p.id}`}
                                  aria-pressed={activo}
                                  className={`flex min-h-5 w-full items-center justify-center rounded border transition-all ${activo
                                      ? `${color.fondo} ${color.borde} text-white shadow`
                                      : "border-gray-200 bg-gray-100 text-gray-400 hover:bg-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-400 dark:hover:bg-slate-700"
                                    }`}
                                >
                                  {activo ? (
                                    <CheckCircle2 size={14} />
                                  ) : (
                                    <span className="leading-none">+</span>
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ACCIONES */}

        <div className="flex flex-wrap gap-3 justify-between items-center mt-5">
          <button
            type="button"
            onClick={exportarGrillaPNG}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition"
          >
            <Camera size={17} />
            Exportar PNG
          </button>
        </div>

        <div className="mt-6">
          <BackButton to={-1} tooltip="Volver" />
        </div>
      </div>

      <Navbar />
    </div>
  );
}
