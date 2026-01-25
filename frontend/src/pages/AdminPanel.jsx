import React, { useEffect } from "react";
import { useNavigate, } from "react-router-dom";

import { useAppContext } from "../context/AppContext";
import BottomNavbar from "../components/BottomNavbar";
import Loading from "../components/Loading";
import { Edit, Plus, PlusCircle, Users } from "lucide-react";
import { estaTokenExpirado } from "../utils/tokenUtils";
import IconButton from "../components/IconButton";
import Logo from "../assets/logo.png";

const AdminPanel = () => {
  const { usuario, jefaturas, vehiculos, loading, token } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || estaTokenExpirado(token)) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (loading) return <Loading />;

  const nombreDependencia = (id) => {
    for (const jefatura of jefaturas) {
      for (const zona of jefatura.zonas || []) {
        const dependencia = zona.dependencias?.find((d) => d.id === id);
        if (dependencia) return dependencia.nombre;
      }
    }
    return null;
  };
  

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      <img
        src={Logo}
        alt="Logo"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
             w-72 opacity-5 blur-sm pointer-events-none"
      />
      <main className="flex-1 px-6 py-8 space-y-8 mb-14 bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 w-full lg:w-1/2 xl:max-w-3xl mx-auto border border-blue-100 dark:border-slate-800">
        {/* Encabezado */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-400">
            Bienvenido, <br />
            {usuario.nombre}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Rol:{" "}
            {usuario.rol_jerarquico === "ADMINISTRADOR"
              ? "Administrador"
              : "Acceso limitado"}
          </p>
        </div>

        {usuario.rol_jerarquico === "ADMINISTRADOR" ? (
          jefaturas && jefaturas.length > 0 ? (
            <div className="space-y-6">
              {jefaturas
                .sort((a, b) =>
                  a.nombre.localeCompare(b.nombre, undefined, { numeric: true })
                )
                .map((jefatura) => (
                  <div key={jefatura.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400">
                        {jefatura.nombre}
                      </h2>
                      <IconButton
                        icon={PlusCircle}
                        tooltip="Agregar zona"
                        onClick={() => navigate(`/crear-zona/${jefatura.id}`)}
                        size="md"
                      />
                    </div>

                    {/* Zonas */}
                    {jefatura.zonas && jefatura.zonas.length > 0 ? (
                      jefatura.zonas
                        .sort((a, b) =>
                          a.nombre.localeCompare(b.nombre, undefined, {
                            numeric: true,
                          })
                        )
                        .map((zona) => (
                          <div key={zona.id} className="space-y-2">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-700 overflow-x-auto">
                              <div className="min-w-full flex px-4 py-3 bg-blue-50 dark:bg-slate-900 border-b border-blue-100 dark:border-slate-700 rounded-t-2xl justify-between items-center">
                                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                                  {zona.nombre}
                                </h3>
                                <IconButton
                                  icon={PlusCircle}
                                  tooltip="Agregar dependencia"
                                  onClick={() =>
                                    navigate(`/crear-dependencia/${zona.id}`)
                                  }
                                  size="sm"
                                />
                              </div>

                              {/* Dependencias */}
                              {zona.dependencias &&
                              zona.dependencias.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                  <thead className="bg-blue-50 dark:bg-slate-900">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Dependencias
                                      </th>
                                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Jefes/Encargados
                                      </th>
                                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Cant. Func.
                                      </th>
                                      <th className="px-4 py-2 text-center text-sm font-bold text-gray-700 dark:text-gray-300">
                                        . . .
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                    {zona.dependencias
                                      .sort((a, b) =>
                                        a.nombre.localeCompare(
                                          b.nombre,
                                          undefined,
                                          { numeric: true }
                                        )
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
                                                ? `G${jefe.grado || ""} ${
                                                    jefe.nombre
                                                  }`
                                                : "Sin jefe";
                                            })()}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                            {dep.usuarios?.filter(
                                              (u) =>
                                                u.rol_jerarquico !==
                                                "JEFE_DEPENDENCIA"
                                            ).length || 0}
                                          </td>
                                          <td className="flex items-center justify-center gap-2 px-4 py-2">
                                            <IconButton
                                              icon={Edit}
                                              tooltip="Editar dependencia"
                                              onClick={() =>
                                                alert(`Editar ${dep.nombre}`)
                                              }
                                              size="sm"
                                            />
                                            <IconButton
                                              icon={Plus}
                                              tooltip="Agregar funcionario"
                                              onClick={() =>
                                                navigate(`/agregar-usuarios/`)
                                              }
                                              size="sm"
                                            />
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              ) : (
                                <div className="p-4 text-center">
                                  <p className="text-gray-600 dark:text-gray-400">
                                    No hay dependencias.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-700 p-4 text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                          No hay zonas.
                        </p>
                        <IconButton
                          icon={PlusCircle}
                          tooltip="Agregar zona"
                          onClick={() => navigate(`/crear-zona/${jefatura.id}`)}
                          size="md"
                        />
                      </div>
                    )}
                  </div>
                ))}
              {/* ================= Vehículos ================= */}
              <div>
                {vehiculos.length > 0 ? (
                  <div className="my-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-700 overflow-x-auto">
                    {/* Título */}
                    <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-slate-900 border-b border-blue-100 dark:border-slate-700 rounded-t-2xl">
                      <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                        Vehículos de la jefatura
                      </h3>
                      <IconButton
                        icon={PlusCircle}
                        tooltip="Agregar vehículo"
                        onClick={() => navigate(`/crear-vehiculo`)}
                        size="sm"
                      />
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-blue-50 dark:bg-slate-900">
                          <tr>
                            <th className="w-24 px-2 py-2 text-center text-sm font-medium">
                              Matrícula
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium">
                              Marca
                            </th>
                            <th className="px-4 py-2 text-center text-sm font-medium">
                              Modelo
                            </th>
                            <th className="px-4 py-2 text-center text-sm font-medium">
                              Año
                            </th>
                            <th className="px-4 py-2 text-center text-sm font-medium">
                              Dependencia
                            </th>
                            <th className="px-4 py-2 text-center text-sm font-medium">
                              …
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                          {vehiculos.map((v) => (
                            <tr key={v.id}>
                              <td className="text-center px-2 py-2 text-sm">
                                {v.matricula}
                              </td>
                              <td className="px-4 py-2 text-sm">{v.marca}</td>
                              <td className="px-4 py-2 text-sm text-center">
                                {v.modelo}
                              </td>
                              <td className="px-4 py-2 text-sm text-center">
                                {v.anio}
                              </td>
                              <td className="px-4 py-2 text-sm text-center">
                                {nombreDependencia(v.dependencia_id)}
                              </td>
                              <td className="px-2 py-2 text-center">
                                <IconButton
                                  icon={Edit}
                                  tooltip="Editar"
                                  onClick={() =>
                                    navigate(`/editar-vehiculo`, {
                                      state: { vehiculo: v },
                                    })
                                  }
                                  size="sm"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 bg-white dark:bg-slate-800 dark:text-gray-400 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-700 p-4">
                    No hay vehículos asignados a esta dependencia.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <p className="text-gray-600 dark:text-gray-400">
                No hay jefaturas.
              </p>
              <IconButton
                icon={PlusCircle}
                tooltip="Agregar jefatura"
                onClick={() => navigate("/crear-jefatura")}
                size="md"
              />
            </div>
          )
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400">
            Tenés acceso limitado a la información.
          </p>
        )}
      </main>

      <BottomNavbar />
    </div>
  );
};

export default AdminPanel;
