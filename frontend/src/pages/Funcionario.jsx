import React, { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import BottomNavbar from "../components/BottomNavbar";
import { estaTokenExpirado } from "../utils/tokenUtils";
import { getTurnoProps } from "../utils/turnoHelpers";
import Loading from "../components/Loading";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const Funcionario = () => {
  const navigate = useNavigate();
  const fechaSeleccionada = dayjs().format("YYYY-MM-DD");
  const {
    usuario,
    dependencias,
    turnos,
    guardias,
    extraordinarias,
    licencias,
    token,
    loading,
  } = useAppContext();

  useEffect(() => {   
    if (!token || estaTokenExpirado(token)) navigate("/login");
  }, [token, navigate]);

  if (loading) return <Loading />;

  if (!usuario)
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-slate-900">
        <p className="text-gray-600 dark:text-gray-300">
          No se encontró información del usuario.
        </p>
      </div>
    );

  // Dependencia y turno del funcionario
  const miDependencia = dependencias.find((dep) =>
    dep.usuarios?.some(
      (u) => u.id === usuario.id && u.rol_jerarquico === "FUNCIONARIO"
    )
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

  const miTurno = turnos.find(
    (t) => t.dependencia_id === miDependencia?.id && t.id === usuario.turno_id
  );

  // Fechas siguientes a la seleccionada
  const proximosDias = Array.from({ length: 7 }, (_, i) =>
    dayjs(fechaSeleccionada).utc().add(i, "day").startOf("day")
  );

  // Construir asignaciones de guardias/licencias
  const turnoPorFuncionario = {};
  miDependencia?.usuarios.forEach((f) => {
    turnoPorFuncionario[f.id] = {};
    proximosDias.forEach((dia) => {
      const fechaStr = dia.format("YYYY-MM-DD");
      const diaMs = dia.valueOf();

      // Licencia
      const licencia = licencias.find(
        (l) =>
          l.usuario_id === f.id &&
          diaMs >= dayjs(l.fecha_inicio).utc().startOf("day").valueOf() &&
          diaMs <= dayjs(l.fecha_fin).utc().startOf("day").valueOf()
      );
      if (licencia) {
        turnoPorFuncionario[f.id][fechaStr] = getTurnoProps(licencia.tipo);
        return;
      }

      // Guardia
      const guardia = guardias.find(
        (g) =>
          g.usuario_id === f.id &&
          dayjs(g.fecha_inicio).utc().format("YYYY-MM-DD") === fechaStr
      );
      if (guardia) {
        turnoPorFuncionario[f.id][fechaStr] = getTurnoProps(guardia.tipo);
        return;
      }

      // Sin asignación
      turnoPorFuncionario[f.id][fechaStr] = getTurnoProps("-");
    });
  });

  const getAsignacion = (usuarioId, fecha) =>
    turnoPorFuncionario[usuarioId][fecha];

  //Mis extraordinarias
  const misExtraordinarias = extraordinarias.filter(
    (u) => u.usuario_id === usuario.id
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <main className="flex-1 px-6 py-8 space-y-6 mb-8">
        {/* Encabezado */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            Bienvenido,
            <br />G{usuario.grado} {usuario.nombre}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Funcionario de {miDependencia?.nombre}
          </p>
        </div>

        {/* Tabla: Mi turno */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-blue-100 dark:border-slate-700 overflow-x-auto">
          <div className="px-4 py-3 bg-blue-50 dark:bg-slate-900 border-b border-blue-100 dark:border-slate-700 rounded-t-xl">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400">
              Mi Turno
            </h3>
          </div>
          <table className="min-w-full text-xs divide-y divide-gray-200 dark:divide-slate-700">
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {miTurno ? (
                <tr className="text-sm">
                  <td className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">
                    {miTurno.nombre}
                  </td>
                  <td className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">
                    {miTurno.hora_inicio.slice(0, 5)} -{" "}
                    {miTurno.hora_fin.slice(0, 5)}
                  </td>
                  <td className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">
                    {miTurno.descripcion}
                  </td>
                </tr>
              ) : (
                <tr className="text-sm">
                  <td
                    colSpan={3}
                    className="px-4 py-2 text-center text-gray-500 dark:text-gray-400"
                  >
                    No se encontró información del turno
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= Extraordinarias ================= */}

        <div>
          {misExtraordinarias.length > 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-700 overflow-x-auto">
              <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-slate-900 border-b border-blue-100 dark:border-slate-700 rounded-t-2xl">
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                  Extraordinarias Asignadas
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-blue-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fecha
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                        Comentario
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {misExtraordinarias.map((g) => {
                      return (
                        <tr
                          key={g.id}
                          className="hover:bg-blue-50 dark:hover:bg-slate-900 transition-colors"
                        >
                          <td className="text-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                            {dayjs(g.fecha_inicio).utc().format("DD/MM HH:mm")}{" "}
                            -{" "}
                            {dayjs(g.fecha_inicio).utc().format("DD/MM") ===
                            dayjs(g.fecha_fin).utc().format("DD/MM")
                              ? dayjs(g.fecha_fin).utc().format("HH:mm")
                              : dayjs(g.fecha_fin).utc().format("DD/MM HH:mm")}
                          </td>
                          <td className="border px-4 py-2 text-sm text-center">
                            {g.comentario}
                          </td>
                        </tr>
                      );
                    })}
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

        {/* Tabla: Próximas Guardias */}
        <div className="overflow-x-auto bg-blue-50 dark:bg-slate-800 rounded-xl shadow border border-blue-100 dark:border-slate-700 mt-6">
          <h3 className=" p-4 text-lg font-semibold text-blue-800 dark:text-blue-400">
            Próximas Guardias
          </h3>

          <table className="bg-white dark:bg-slate-800 min-w-full text-xs divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-blue-50 dark:bg-slate-900">
              <tr className="bg-white dark:bg-slate-800 text-sm">
                <th className="px-2 py-2 text-center font-medium text-gray-700 dark:text-gray-300">
                  Grado / Nombre
                </th>
                {proximosDias.map((fecha) => (
                  <th
                    key={fecha}
                    className="px-2 py-2 text-center font-medium text-gray-700 dark:text-gray-300"
                  >
                    {dayjs(fecha).format("DD/MM")}
                    <br />
                    {dayjs(fecha).format("ddd")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200 dark:divide-slate-700">
              {miDependencia.usuarios
                .filter(
                  (f) =>
                    f.rol_jerarquico !== "JEFE_DEPENDENCIA" &&
                    f.turno_id === miTurno?.id
                )
                .sort((a, b) =>
                  a.grado > b.grado
                    ? -1
                    : a.grado < b.grado
                    ? 1
                    : new Date(a.fecha_ingreso) - new Date(b.fecha_ingreso)
                )
                .map((f) => (
                  <tr
                    key={f.id}
                    className="hover:bg-blue-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <td className="text-left px-2 py-2 text-gray-700 dark:text-gray-300 truncate">
                      G{f.grado} {abreviarNombre(f.nombre)}
                    </td>
                    {proximosDias.map((fecha) => {
                      const { clase, contenido } = getAsignacion(
                        f.id,
                        fecha.format("YYYY-MM-DD")
                      );
                      return (
                        <td
                          key={fecha}
                          className={`px-2 py-1 text-center ${clase}`}
                        >
                          {contenido}
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>

      <BottomNavbar />
    </div>
  );
};

export default Funcionario;
