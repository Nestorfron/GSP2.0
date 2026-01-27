import React from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import BottomNavbar from "../components/BottomNavbar";
import Loading from "../components/Loading";
import IconButton from "../components/IconButton";
import { Eye } from "lucide-react";
import {
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import Logo from "../assets/logo.png";

const Zona = () => {
  const { usuario, jefaturas, loading, obtenerGrado } = useAppContext();
  const navigate = useNavigate();

  const dependencias = jefaturas
    ?.flatMap(
      (jefatura) =>
        jefatura.zonas?.flatMap((zona) => zona.dependencias || []) || []
    )
    .filter((dep) => dep.zona_id === usuario.zona_id)
    .filter((dep) => dep.nombre?.startsWith("Seccional"));

  if (loading) return <Loading />;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-2 rounded-md shadow border border-gray-200 dark:border-slate-700 text-sm">
          <p className="font-semibold text-gray-800 dark:text-gray-200">
            {label}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            {payload[0].value} func.
          </p>
        </div>
      );
    }
    return null;
  };

  if (!usuario) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-slate-900">
        <p className="text-gray-600 dark:text-gray-300">
          No se encontró información del usuario.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
     <img
        src={Logo}
        alt="Logo"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
             w-72 opacity-5 blur-sm pointer-events-none"
      />
      <main className="flex-1 px-6 py-8 space-y-8 bg-white dark:bg-slate-900  p-6 w-full lg:w-1/2 xl:max-w-3xl mx-auto  mb-10">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-400">
            Bienvenido, {usuario.nombre}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Rol: {usuario.rol_jerarquico === "JEFE_ZONA" ? "Jefe de zona" : ""}
          </p>
        </div>

        {usuario.rol_jerarquico === "JEFE_ZONA" ? (
          <div className="space-y-6">
            {jefaturas
              .sort((a, b) =>
                a.nombre.localeCompare(b.nombre, undefined, { numeric: true })
              )
              .map((jefatura) => {
                const zonasFiltradas =
                  jefatura.zonas?.filter(
                    (zona) => zona.id === usuario.zona_id
                  ) || [];

                if (zonasFiltradas.length === 0) return null;

                return (
                  <div key={jefatura.id} className="space-y-4">
                    <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400">
                      {jefatura.nombre}
                    </h2>

                    {zonasFiltradas
                      .sort((a, b) =>
                        a.nombre.localeCompare(b.nombre, undefined, {
                          numeric: true,
                        })
                      )
                      .map((zona) => (
                        <div
                          key={zona.id}
                          className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-700 overflow-x-auto"
                        >
                          {/* Título mejorado */}
                          <div className="px-4 py-3 bg-blue-50 dark:bg-slate-900 border-b border-blue-100 dark:border-slate-700 rounded-t-2xl">
                            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                              {zona.nombre}
                            </h3>
                          </div>

                          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-blue-50 dark:bg-slate-900">
                              <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Dependencia
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Jefe
                                </th>
                                <th className="px-4 py-2 text-center text-sm text-gray-700 dark:text-gray-300">
                                  . . .
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                              {zona.dependencias
                                ?.filter((dep) => dep.nombre?.startsWith("Seccional"))
                                .sort((a, b) =>
                                  a.nombre.localeCompare(b.nombre, undefined, {
                                    numeric: true,
                                  })
                                )
                                .map((dep) => (
                                  <tr
                                    key={dep.id}
                                    className="hover:bg-blue-50 dark:hover:bg-slate-900 transition-colors"
                                  >
                                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                      {dep.nombre}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                      {(() => {
                                        const jefe = dep.usuarios?.find(
                                          (u) =>
                                            u.rol_jerarquico ===
                                            "JEFE_DEPENDENCIA"
                                        );
                                        return jefe
                                          ? `${obtenerGrado(jefe.grado || "")} ${
                                              jefe.nombre
                                            }`
                                          : "Sin jefe";
                                      })()}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <IconButton
                                          className="m-auto"
                                          icon={Eye}
                                          tooltip="Ver detalles"
                                          onClick={() =>
                                            navigate(`/detalle-dependencia`,
                                              {
                                                state: { dependencia: dep },
                                              }
                                            )
                                          }
                                          size="sm"
                                        />
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400">
            Tenés acceso limitado a la información.
          </p>
        )}

        {/* === GRAFICA DE BARRAS VERTICAL === */}
        <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-blue-100 dark:border-slate-700">
          <h3 className="text-center pt-6 text-md font-semibold text-blue-700 dark:text-blue-400">
            Funcionarios por Dependencia
          </h3>

          <div className="w-full px-4 pb-6" style={{ height: "350px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dependencias?.map((dep) => ({
                  name: dep.nombre.replace("Seccional", "Secc"),
                  value:
                    dep.usuarios?.filter(
                      (u) => u.rol_jerarquico !== "JEFE_DEPENDENCIA"
                    ).length || 0,
                }))}
                margin={{ top: 20, right: 20, bottom: 30, left: 10 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />

                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {dependencias.map((_, index) => (
                    <Cell
                      key={index}
                      fill={`hsl(${(index * 60) % 360}, 70%, 55%)`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default Zona;
