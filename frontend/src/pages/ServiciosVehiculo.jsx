import React, { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PlusCircle, Search, Edit, Wrench } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import BottomNavbar from "../components/BottomNavbar";
import IconButton from "../components/IconButton";
import Loading from "../components/Loading";
import { utc } from "dayjs";
import dayjs from "dayjs";

dayjs.extend(utc);

export default function ServiciosVehiculo() {
  const navigate = useNavigate();
  const { vehiculos, servicios, loading } = useAppContext();
  const { vehiculoId } = useLocation().state || {};

  const vehiculo = vehiculos.find((v) => v.id === vehiculoId);

  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef(null);

  const formatFecha = (fecha) => {
    if (!fecha) return "";
    const parsed = new Date(fecha);
    return isNaN(parsed) ? "" : parsed.toISOString().split("T")[0];
  };

  const normalizar = (txt) =>
    txt
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const serviciosVehiculo = useMemo(() => {
    const term = normalizar(searchTerm);

    const filtrados = servicios.filter(
      (s) => s.vehiculo_id === vehiculoId
    );

    if (!term) {
      return [...filtrados].sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      );
    }

    return filtrados
      .filter(
        (s) =>
          normalizar(s.nombre).includes(term) ||
          normalizar(s.descripcion).includes(term)
      )
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [servicios, vehiculoId, searchTerm]);

  const handleOpenSearch = () => {
    setShowSearch(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const handleBlurSearch = () => {
    if (!searchTerm.trim()) setShowSearch(false);
  };

  if (loading) return <Loading />;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="flex-grow flex flex-col items-center p-4 pb-24 w-full lg:w-3/4 xl:max-w-4xl mx-auto space-y-6">

        {/* ================= Header vehículo ================= */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-700 p-4 w-full text-center">
          <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400 flex items-center justify-center gap-2">
            <Wrench size={20} />
            Servicios del vehículo
          </h2>
          {vehiculo && (
            <div>
                <p className="text-sm text-slate-500 mt-1">
              Matrícula: {vehiculo.matricula} · Marca: {vehiculo.marca}{" "}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Próximo Service: {formatFecha(vehiculo.proximo_servicio)}
            </p>

            </div>
            
          )}
        </div>

        {/* ================= Crear servicio ================= */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-100 dark:border-slate-700 p-4 w-full flex flex-col items-center gap-3">
          <h3 className="text-md font-semibold text-blue-700 dark:text-blue-400">
            Agregar nuevo servicio
          </h3>

          <IconButton
            icon={PlusCircle}
            tooltip="Agregar servicio"
            onClick={() =>
              navigate("/crear-servicio", {
                state: { vehiculoId },
              })
            }
            size="md"
          />
        </div>

        {/* ================= Tabla servicios ================= */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-blue-100 dark:border-slate-700 overflow-x-auto w-full">

          {/* Header tabla */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-slate-900 border-b border-blue-100 dark:border-slate-700 rounded-t-2xl">
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
              Historial de servicios
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
                  <Search className="text-blue-600 mr-2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Buscar servicio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onBlur={handleBlurSearch}
                    className="bg-transparent outline-none text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {serviciosVehiculo.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-blue-50 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium">
                    Servicio
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium">
                    Fecha
                  </th>
                  <th className="px-2 py-2 text-center text-sm font-medium">
                    ...
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {serviciosVehiculo.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-blue-50 dark:hover:bg-slate-900 transition"
                  >
                    <td className="px-4 py-2 text-sm">
                      <p className="font-medium">{s.nombre}</p>
                      <p className="text-xs text-slate-500">
                        {s.descripcion}
                      </p>
                    </td>

                    <td className="px-4 py-2 text-sm">
                      {dayjs(s.fecha).utc().format("DD/MM/YYYY")}
                    </td>

                    <td className="px-2 py-2 text-center">
                      <IconButton
                        icon={Edit}
                        tooltip="Editar servicio"
                        onClick={() =>
                          navigate("/editar-servicio", {
                            state: { servicio: s },
                          })
                        }
                        size="sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-slate-500">
              No hay servicios registrados para este vehículo.
            </div>
          )}
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
}
