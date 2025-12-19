import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate, useLocation } from "react-router-dom";
import BottomNavbar from "../components/BottomNavbar";
import { estaTokenExpirado } from "../utils/tokenUtils";
import { getTurnoProps } from "../utils/turnoHelpers";
import Loading from "../components/Loading";
import { Home, SearchX } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import IconButton from "../components/IconButton";

const DetalleDependencia = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const { usuario, jefaturas, licencias, guardias, token, loading } =
    useAppContext();



  // ahora guardamos solo el ID cuando se selecciona desde el select
  const [dependenciaSeleccionada, setDependenciaSeleccionada] = useState(null);

  const dependencias = jefaturas
    ?.flatMap(
      (jefatura) =>
        jefatura.zonas?.flatMap((zona) => zona.dependencias || []) || []
    )
    .filter((dep) => dep.zona_id === usuario.zona_id)
    .filter((dep) => dep.nombre?.startsWith("Seccional"));

    const [dependenciaFinal, setDependenciaFinal] = useState(
      location.state?.dependencia || dependencias[0]
    );

  // dependenciaFinal: usa el state si viene por navigate, si no busca por id en la lista

  const handleChange = (e) => {
    const id = Number(e.target.value) || null;
    const dependencia = dependencias.find((d) => d.id === id);
    setDependenciaFinal(dependencia);
  };

  useEffect(() => {
    if (!token || estaTokenExpirado(token)) {
      navigate("/login");
    }
  }, [token, navigate]);

  const JefeDependencia =
    dependenciaFinal?.usuarios.find(
      (u) => u.rol_jerarquico === "JEFE_DEPENDENCIA"
    ) || [];

  const CantidadFuncionarios =
    dependenciaFinal.usuarios.filter(
      (u) => u.rol_jerarquico !== "JEFE_DEPENDENCIA"
    ).length || 0;

  if (loading) return <Loading />;

  // usamos dependenciaFinal en lugar de dependencia
  const turnos = dependenciaFinal?.turnos || [];

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

  // Turnos: filtrar por dependenciaFinal.id
  const misTurnos = turnos
    .filter((t) => t.dependencia_id === dependenciaFinal?.id)
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      <main className="flex-1 px-6 py-8 space-y-6 mb-14">
        <div className="flex flex-col items-center justify-center gap-2 mb-4">
          <select
            name="dependencia"
            value={
              dependenciaSeleccionada
                ? dependenciaSeleccionada
                : dependenciaFinal?.id
            }
            onChange={handleChange}
            className="border border-gray-300 dark:border-slate-700 rounded px-3 py-2 bg-transparent focus:ring-2 transition-all"
          >
            {dependencias
              ?.filter((dep) => dep.nombre?.startsWith("Seccional"))
              .sort((a, b) =>
                a.nombre.localeCompare(b.nombre, undefined, {
                  numeric: true,
                })
              )
              .map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.descripcion}
                </option>
              ))}
          </select>
        </div>

        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
            Jefe:
          </h3>
          <span className="font-bold text-gray-600 dark:text-gray-200">
            {JefeDependencia
              ? "G" + JefeDependencia.grado + " " + JefeDependencia.nombre
              : "Sin Jefe"}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
            Cantidad de funcionarios
          </h3>
          <span className="font-bold text-gray-600 dark:text-gray-200">
            {CantidadFuncionarios}
          </span>
        </div>

        {/* Si el usuario es JEFE_ZONA mostramos contenido para seleccionar/visualizar dependencia */}
        {usuario.rol_jerarquico === "JEFE_ZONA" && dependenciaFinal ? (
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

            {/* ================= Turnos ================= */}
            <div>
              {misTurnos.length > 0 ? (
                misTurnos.map((t) => {
                  const funcionariosDelTurno = dependenciaFinal.usuarios
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
                                      className={`border px-4 py-1 text-sm text-center py-1 relative group ${
                                        turnoPorFuncionario?.nombre === "BROU"
                                          ? clase
                                          : contenido === "BROU"
                                          ? "text-xs text-white bg-blue-600"
                                          : clase
                                      }`}
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {dependenciaFinal.usuarios
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
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          // Si no hay dependenciaFinal mostramos el selector
          <div className="flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-700 p-4 text-center">
            <IconButton
              className="m-auto"
              icon={SearchX}
              tooltip="Seleccionar dependencia"
              onClick={() => setDependenciaSeleccionada(null)}
              size="md"
            />
          </div>
        )}
      </main>

      <BottomNavbar />
    </div>
  );
};

export default DetalleDependencia;
