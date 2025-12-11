import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Search, Edit } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import BottomNavbar from "../components/BottomNavbar";
import IconButton from "../components/IconButton";

export default function AgregarUsuarios() {
  const navigate = useNavigate();
  const { dependencias, usuario } = useAppContext();



  const miDependencia =
  dependencias.find((dep) =>
    dep.usuarios?.some(
      (u) => u.id === usuario.id && u.rol_jerarquico === "JEFE_DEPENDENCIA"
    )
  ) || dependencias[0];



  const usuarios = dependencias?.flatMap((dep) => dep.usuarios) || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef(null);

  const normalizar = (txt) =>
    txt
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filteredUsuarios = useMemo(() => {
    const term = normalizar(searchTerm);

    // === ORDEN PRINCIPAL SI NO HAY BÚSQUEDA ===
    if (!term)
      return [...usuarios].sort((a, b) => {
        if (a.grado > b.grado) return -1;
        if (a.grado < b.grado) return 1;
        return new Date(a.fecha_ingreso) - new Date(b.fecha_ingreso);
      });

    // === FILTRO + ORDEN ===
    return usuarios
      .filter((u) => {
        const nombreCompleto = normalizar(u.nombre);
        const grado = `g${u.grado}`;
        const combinacion = normalizar(`g${u.grado} ${u.nombre}`);

        return (
          nombreCompleto.includes(term) ||
          grado.includes(term) ||
          combinacion.includes(term)
        );
      })
      .sort((a, b) => {
        if (a.grado > b.grado) return -1;
        if (a.grado < b.grado) return 1;
        return new Date(a.fecha_ingreso) - new Date(b.fecha_ingreso);
      });
  }, [searchTerm, usuarios]);

  const handleOpenSearch = () => {
    setShowSearch(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const handleBlurSearch = () => {
    if (searchTerm.trim() === "") {
      setShowSearch(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="flex-grow flex flex-col items-center p-4 pb-24 w-full max-w-xl mx-auto space-y-6">

        {/* ================= Crear usuario ================= */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-700 p-4 w-full flex flex-col items-center gap-3">
          <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
            Crear usuario nuevo
          </h2>

          <IconButton
            icon={PlusCircle}
            tooltip="Crear usuario"
            onClick={() => navigate(`/crear-usuario/${miDependencia.id}`)}
            size="md"
          />
        </div>

        {/* ================= Tabla todos los funcionarios ================= */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-blue-100 dark:border-slate-700 overflow-x-auto w-full">

          {/* Header tabla */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-slate-900 border-b border-blue-100 dark:border-slate-700 rounded-t-2xl text-sm">
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
              Todos los funcionarios
            </h3>

            <div className="flex items-center gap-2">

              {/* Buscador oculto hasta click */}
              {!showSearch && (
                <button
                  onClick={handleOpenSearch}
                  className="p-2 rounded-xl hover:bg-blue-100 dark:hover:bg-slate-800 text-blue-700 dark:text-blue-300 transition"
                >
                  <Search size={20} />
                </button>
              )}

              {showSearch && (
                <div className="flex items-center bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl px-3 py-1 transition-all">
                  <Search className="text-blue-600 dark:text-blue-300 mr-2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onBlur={handleBlurSearch}
                    className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-300"
                  />
                </div>
              )}

            </div>
          </div>

          {/* Tabla */}
          {filteredUsuarios.length > 0 ? <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-blue-50 dark:bg-slate-900">
              <tr>
                <th className="px-2 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  Grado
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dependencia
                </th>
                <th className="font-bold py-1 text-center text-sm text-gray-700 dark:text-gray-300">
                  . . .
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {filteredUsuarios.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-blue-50 dark:hover:bg-slate-900 transition-colors"
                >
                  <td className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">
                    {u.grado}
                  </td>

                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    {u.nombre}
                  </td>

                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    {
                      dependencias.find((d) =>
                        d.usuarios.some((usr) => usr.id === u.id)
                      )?.nombre || "-"
                    }
                  </td>

                  <td className="px-2 py-2 text-center">
                    <button
                      className="inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 transition-all"
                      onClick={() =>
                        navigate("/editar-usuario", {
                          state: { usuario: u },
                        })
                      }
                    >
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table> : 
          <div className="flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-700 p-4 text-center">
            <p className="text-center text-slate-500 dark:text-slate-400">
              No se encontraron usuarios.
            </p>
          </div>
          }
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
}
