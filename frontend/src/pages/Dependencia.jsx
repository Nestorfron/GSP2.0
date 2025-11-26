import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import BottomNavbar from "../components/BottomNavbar";
import { estaTokenExpirado } from "../utils/tokenUtils";
import { getTurnoProps } from "../utils/turnoHelpers";
import { AnimatePresence, motion } from "framer-motion";
import Loading from "../components/Loading";
import { Edit, Home, PlusCircle, Trash, CheckCircle2 } from "lucide-react";
import { deleteData } from "../utils/api";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import IconButton from "../components/IconButton";

const Dependencia = () => {
  const navigate = useNavigate();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const {
    usuario,
    dependencias,
    turnos,
    guardias,
    extraordinarias,
    licencias,
    licenciasPendientes,
    token,
    loading,
    recargarDatos,
  } = useAppContext();
  const [success, setSuccess] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  const [guardiaAEliminar, setGuardiaAEliminar] = useState(null);
  const [verTodas, setVerTodas] = useState(false);

  useEffect(() => {
    if (!token || estaTokenExpirado(token)) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (loading) return <Loading />;

  // Dependencia del jefe
  const miDependencia = dependencias.find((dep) =>
    dep.usuarios?.some(
      (u) => u.id === usuario.id && u.rol_jerarquico === "JEFE_DEPENDENCIA"
    )
  );

  // Extraordinarias a partir de hoy
  const extraordinariasDesdeHoy = extraordinarias.filter(
    (g) =>
      dayjs(g.fecha_inicio).utc().format("YYYY-MM-DD") === fechaSeleccionada
  );

  // Licencias pendientes de TODOS los funcionarios de la dependencia
  const licenciasPendientesDeLaDependencia = licenciasPendientes.filter((l) =>
    miDependencia.usuarios.some((u) => u.id === l.usuario_id)
  );

  // Guardías de la fecha seleccionada
  const guardiasHoy = guardias.filter(
    (g) =>
      dayjs(g.fecha_inicio).utc().format("YYYY-MM-DD") === fechaSeleccionada
  );

  // Licencias de la fecha seleccionada
  const hoy = dayjs(fechaSeleccionada).utc().startOf("day");

  const licenciasHoy = licencias.filter((l) => {
    const inicio = dayjs(l.fecha_inicio).utc().startOf("day");
    const fin = dayjs(l.fecha_fin).utc().startOf("day");
    return hoy >= inicio && hoy <= fin;
  });

  // Guardias y Licencias por funcionario
  const turnoPorFuncionario = {};

  // Asignacion de guardias
  guardiasHoy.forEach((g) => {
    turnoPorFuncionario[g.usuario_id] = g.tipo; // "T", "1er", "2do", etc.
  });

  // Asignacion de licencias
  licenciasHoy.forEach((l) => {
    turnoPorFuncionario[l.usuario_id] = l.tipo; // "descanso" u otro tipo de licencia
  });

  // Orden de turnos
  const ordenTurnos = [
    "Primer Turno",
    "BROU",
    "Segundo Turno",
    "Tercer Turno",
    "Destacados",
  ];

  // Turnos
  const misTurnos = turnos
    .filter((t) => t.dependencia_id === miDependencia?.id)
    .sort(
      (a, b) => ordenTurnos.indexOf(a.nombre) - ordenTurnos.indexOf(b.nombre)
    );

  // Abreviar nombre

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

  // Funcionario extraordinaria

  const usuarioExtraordinaria = (id) => {
    const usuario = miDependencia.usuarios.find((u) => u.id === id);
    return "G" + usuario.grado + " " + abreviarNombre(usuario.nombre);
  };

  // Eliminar Extraordinaria (ahora con loading)
  const handleDelete = async (id) => {
    setLoading2(true);
    try {
      const tokenLocal = localStorage.getItem("token");
      await deleteData(`/guardias/${id}`, tokenLocal);
      setSuccess(true);
      if (typeof recargarDatos === "function") recargarDatos();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading2(false);
      // cerrar modal si se estaba usando
      setConfirmarBorrado(false);
      setGuardiaAEliminar(null);
    }
  };

  // Abrir modal de confirmación
  const handleAbrirConfirmacion = (id) => {
    setGuardiaAEliminar(id);
    setConfirmarBorrado(true);
  };

  // Confirmar y borrar
  const handleEliminarGuardia = async () => {
    if (!guardiaAEliminar) return;
    await handleDelete(guardiaAEliminar);
    setConfirmarBorrado(false);
    setGuardiaAEliminar(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      <main className="flex-1 px-6 py-8 space-y-6 mb-14">
        {/* Encabezado */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-400">
            Bienvenido,
            <br />G{usuario.grado} {usuario.nombre}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {" "}
            {usuario.rol_jerarquico === "JEFE_DEPENDENCIA"
              ? `Jefe de ${miDependencia?.nombre}`
              : ""}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total de funcionarios:{" "}
            {miDependencia ? miDependencia.usuarios.length - 1 : 0}
          </p>
        </div>



        {/* Solicitudes de licencias pendientes */}

        {licenciasPendientesDeLaDependencia.length > 0 && (
          <div
            onClick={() => navigate("/solicitudes-licencia")}
            className="cursor-pointer bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300 rounded-xl px-4 py-3 text-center text-sm font-medium shadow-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            📌 Tienes {licenciasPendientes.length} solicitud
            {licenciasPendientes.length > 1 ? "es" : ""} de licencia pendiente
            {licenciasPendientes.length > 1 ? "s" : ""}. Haz clic para
            revisarlas.
          </div>
        )}

        {/* Contenido */}
        {usuario.rol_jerarquico === "JEFE_DEPENDENCIA" && miDependencia ? (
          <div className="space-y-6">
            <div className="flex items-center mb-4 gap-2">
              <input
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                className="border border-gray-300 dark:border-slate-700 rounded px-2 py-1 text-sm"
              />
              <button
                onClick={() =>
                  setFechaSeleccionada(dayjs().format("YYYY-MM-DD"))
                }
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                title="Volver a hoy"
              >
                <Home size={20} />
              </button>
            </div>

            {/* ================= Extraordinarias ================= */}
            <div>
              <IconButton
                className="ms-auto"
                icon={PlusCircle}
                tooltip="Agregar Extraordinaria"
                onClick={() =>
                  navigate("/crear-extraordinaria", {
                    state: { depId: miDependencia?.id },
                  })
                }
                size="sm"
              />

              {/* Botón para ver todas */}
              <div className="flex justify-end my-2">
                {extraordinarias.length > 0 && <button
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  onClick={() => setVerTodas(!verTodas)}
                >
                  {verTodas ? "Ver menos" : "Ver más"}
                </button>}
              </div>

              {(verTodas ? extraordinarias : extraordinariasDesdeHoy)
                .length > 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-700 overflow-x-auto">
                  <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-slate-900 border-b border-blue-100 dark:border-slate-700 rounded-t-2xl">
                    <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                      Extraordinarias
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                      <thead className="bg-blue-50 dark:bg-slate-900">
                        <tr>
                          <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                            Grado / Nombre
                          </th>
                          <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                            Fecha
                          </th>
                          <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                            Observaciones
                          </th>
                          <th className="px-1 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                            -
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {(verTodas
                          ? extraordinarias
                          : extraordinariasDesdeHoy
                        ).map((g) => (
                          <tr
                            key={g.id}
                            className="hover:bg-blue-50 dark:hover:bg-slate-900 transition-colors"
                          >
                            <td className="text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                              {usuarioExtraordinaria(g.usuario_id)}
                            </td>
                            <td className="border px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                              {dayjs(g.fecha_inicio)
                                .utc()
                                .format("DD/MM HH:mm")}{" "}
                              -{" "}
                              {dayjs(g.fecha_inicio).utc().format("DD/MM") ===
                              dayjs(g.fecha_fin).utc().format("DD/MM")
                                ? dayjs(g.fecha_fin).utc().format("HH:mm")
                                : dayjs(g.fecha_fin)
                                    .utc()
                                    .format("DD/MM HH:mm")}
                            </td>
                            <td className="border px-4 py-2 text-sm text-center">
                              {g.tipo} - {g.comentario}
                            </td>
                            <td className="px-2 py-2 text-center">
                              <button
                                className="inline-flex items-center justify-center p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 transition-all"
                                onClick={() => handleAbrirConfirmacion(g.id)}
                              >
                                <Trash size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-center text-gray-500 bg-white dark:bg-slate-800 dark:text-gray-400 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-700 p-4 text-center">
                    No hay extraordinarias asignadas.
                  </p>
                </div>
              )}
            </div>

            {/* ================= Turnos ================= */}
            <div>
              <IconButton
                className="ms-auto"
                icon={PlusCircle}
                tooltip="Agregar turno"
                onClick={() =>
                  navigate("/crear-turno", {
                    state: { depId: miDependencia?.id },
                  })
                }
                size="sm"
              />
              {misTurnos.length > 0 ? (
                misTurnos.map((t) => {
                  const funcionariosDelTurno = miDependencia.usuarios
                    .filter(
                      (f) =>
                        f.rol_jerarquico !== "JEFE_DEPENDENCIA" &&
                        f.turno_id === t.id
                    )
                    .sort((a, b) => {
                      const gradoA = a.grado || "";
                      const gradoB = b.grado || "";
                      if (gradoA > gradoB) return -1;
                      if (gradoA < gradoB) return 1;
                      return (
                        new Date(a.fecha_ingreso) - new Date(b.fecha_ingreso)
                      );
                    });

                  return (
                    <div
                      key={t.id}
                      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-700 overflow-x-auto"
                    >
                      {/* Título del turno */}
                      <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-slate-900 border-b border-blue-100 dark:border-slate-700 rounded-t-2xl">
                        <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                          {t.nombre}
                        </h3>
                      </div>

                      {/* Tabla de funcionarios del turno */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                          <thead className="bg-blue-50 dark:bg-slate-900">
                            <tr>
                              <th className="w-12 px-2 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                Grado
                              </th>
                              <th className="w-48 sm:w-1/2  px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                Nombre
                              </th>
                              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                {fechaSeleccionada ===
                                dayjs().format("YYYY-MM-DD")
                                  ? "Hoy"
                                  : dayjs(fechaSeleccionada).format("DD/MM")}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {funcionariosDelTurno.length > 0 ? (
                              funcionariosDelTurno.map((f) => {
                                const { clase, contenido } = getTurnoProps(
                                  turnoPorFuncionario[f.id]
                                );
                                return (
                                  <tr
                                    key={f.id}
                                    className="hover:bg-blue-50 dark:hover:bg-slate-900 transition-colors"
                                  >
                                    <td className="text-center px-2 py-2 text-sm text-gray-700 dark:text-gray-300">
                                      {f.grado}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                      {abreviarNombre(f.nombre)}
                                    </td>
                                    <td
                                      className={`border px-4 py-2 text-sm text-center ${clase}`}
                                    >
                                      {contenido}
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="px-4 py-2 text-center text-gray-500 dark:text-gray-400"
                                >
                                  No hay funcionarios asignados a este turno.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div>
                  <p className="text-center text-gray-500 bg-white dark:bg-slate-800 dark:text-gray-400 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-700 p-4 text-center">
                    No hay turnos asignados a esta dependencia.
                  </p>
                </div>
              )}
            </div>

            {/* ================= Tabla general de todos los funcionarios ================= */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-700 overflow-x-auto">
              <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-slate-900 border-b border-blue-100 dark:border-slate-700 rounded-t-2xl">
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                  Todos los funcionarios
                </h3>
                <IconButton
                  className="ms-auto"
                  icon={PlusCircle}
                  tooltip="Agregar usuario"
                  onClick={() => navigate(`/agregar-usuarios`)}
                  size="sm"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-blue-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-1 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                        Grado
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nombre
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Turno
                      </th>
                      <th className="font-bold py-1 text-center text-sm text-gray-700 dark:text-gray-300">
                        . . .
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {miDependencia.usuarios
                      .filter((f) => f.rol_jerarquico !== "JEFE_DEPENDENCIA")
                      .sort((a, b) => {
                        const gradoA = a.grado || "";
                        const gradoB = b.grado || "";
                        if (gradoA > gradoB) return -1;
                        if (gradoA < gradoB) return 1;
                        return (
                          new Date(a.fecha_ingreso) - new Date(b.fecha_ingreso)
                        );
                      })
                      .map((f) => (
                        <tr
                          key={f.id}
                          className="hover:bg-blue-50 dark:hover:bg-slate-900 transition-colors"
                        >
                          <td className="text-center  py-2 text-sm text-gray-700 dark:text-gray-300">
                            {f.grado}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                            {f.nombre}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                            {turnos.find((t) => t.id === f.turno_id)?.nombre ||
                              "-"}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <button
                              className="inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 transition-all"
                              onClick={() =>
                                navigate("/editar-usuario", {
                                  state: { usuario: f },
                                })
                              }
                            >
                              <Edit size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400">
            Tenés acceso limitado a la información.
          </p>
        )}
        {/* Modal confirmación eliminar */}
        <AnimatePresence>
          {confirmarBorrado && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center max-w-sm w-full"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
              >
                <CheckCircle2 className="text-red-500 w-16 h-16 mx-auto mb-3" />

                <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">
                  ¿Eliminar guardia?
                </h2>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Esta acción no se puede deshacer. ¿Seguro que deseas eliminar
                  esta guardia?
                </p>

                <div className="flex justify-center gap-3 mt-6">
                  <button
                    onClick={() => {
                      setConfirmarBorrado(false);
                      setGuardiaAEliminar(null);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:text-white px-5 py-2 rounded-lg font-medium transition-all"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleEliminarGuardia}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium transition-all"
                  >
                    {loading2 ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNavbar />
    </div>
  );
};

export default Dependencia;
