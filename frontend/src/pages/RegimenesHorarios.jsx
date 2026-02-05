import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Search, Edit } from "lucide-react";
import BottomNavbar from "../components/BottomNavbar";
import IconButton from "../components/IconButton";
import Loading from "../components/Loading";

import { useAppContext } from "../context/AppContext";

export default function RegimenesHorarios() {
  const navigate = useNavigate();

  const { regimenes, loading } = useAppContext(); // 👈 USANDO CONTEXT

  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef(null);

  // ================= Normalizador búsqueda =================
  const normalizar = (txt) =>
    txt
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  // ================= Filtro =================
  const filteredRegimenes = useMemo(() => {
    const term = normalizar(searchTerm);

    if (!term) return regimenes || [];

    return (regimenes || []).filter((r) =>
      normalizar(
        `${r.nombre} ${r.horas_trabajo} ${r.horas_descanso}`
      ).includes(term)
    );
  }, [searchTerm, regimenes]);

  // ================= UI Search =================
  const handleOpenSearch = () => {
    setShowSearch(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const handleBlurSearch = () => {
    if (!searchTerm.trim()) setShowSearch(false);
  };

  if (loading) return <Loading />;

  // ================= Render =================
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="flex-grow flex flex-col items-center p-4 pb-24 w-full mx-auto space-y-6 dark:bg-slate-900 lg:w-3/4 xl:max-w-4xl">

        {/* ================= Crear régimen ================= */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-700 p-4 w-full flex flex-col items-center gap-3">
          <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
            Crear régimen horario
          </h2>

          <IconButton
            icon={PlusCircle}
            tooltip="Crear régimen"
            onClick={() => navigate("/crear-regimen")}
            size="md"
          />
        </div>

        {/* ================= Tabla ================= */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-blue-100 dark:border-slate-700 overflow-x-auto w-full">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-slate-900 border-b border-blue-100 dark:border-slate-700 rounded-t-2xl text-sm">
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
              Regímenes horarios
            </h3>

            <div className="flex items-center gap-2">

              {!showSearch && (
                <button
                  onClick={handleOpenSearch}
                  className="p-2 rounded-xl hover:bg-blue-100 dark:hover:bg-slate-800 text-blue-700 dark:text-blue-300 transition"
                >
                  <Search size={20} />
                </button>
              )}

              {showSearch && (
                <div className="flex items-center bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl px-3 py-1">
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
          {filteredRegimenes.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-blue-50 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trabajo
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descanso
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Rotación
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Medio horario
                  </th>
                  <th className="px-2 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    ...
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredRegimenes.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-blue-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {r.nombre}
                    </td>

                    <td className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">
                      {r.horas_trabajo} hs
                    </td>

                    <td className="text-center py-2 text-sm text-gray-700 dark:text-gray-300">
                      {r.horas_descanso} hs
                    </td>

                    <td className="text-center py-2 text-sm">
                      {r.admite_rotacion_par_impar ? "✔" : "-"}
                    </td>

                    <td className="text-center py-2 text-sm">
                      {r.admite_medio_horario ? "✔" : "-"}
                    </td>

                    <td className="px-2 py-2 text-center">
                      <button
                        className="inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 transition-all"
                        onClick={() =>
                          navigate("/editar-regimen", {
                            state: { regimen: r },
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
          ) : (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              No se encontraron regímenes.
            </div>
          )}
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
}
