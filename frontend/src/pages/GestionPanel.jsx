import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import BottomNavbar from "../components/BottomNavbar";
import Loading from "../components/Loading";
import { estaTokenExpirado } from "../utils/tokenUtils";
import IconButton from "../components/IconButton";

import {
  PlusCircle,
  Edit,
  Users,
  Car,
  Shield,
  Building2,
  Map,
  Clock,
  Eye,
} from "lucide-react";

const GestionPanel = () => {
  const {
    usuario,
    loading,
    token,
    jefaturas = [],
    dependencias = [],
    vehiculos = [],
    regimenes = [],
  } = useAppContext();

  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("jefaturas");

  /* ================= SEGURIDAD ================= */
  useEffect(() => {
    if (!token || estaTokenExpirado(token)) {
      navigate("/login");
    }
  }, [token, navigate]);

  /* ================= MÉTRICAS ================= */
  const totalZonas = useMemo(() => {
    return jefaturas.reduce((acc, j) => acc + (j.zonas?.length || 0), 0);
  }, [jefaturas]);

  /* ⚠️ IMPORTANTE: después de todos los hooks */
  if (loading) return <Loading />;

  /* ================= UI ================= */

  const MetricCard = ({ icon: Icon, title, value, section }) => (
    <button
      onClick={() => setActiveSection(section)}
      className={`bg-white dark:bg-slate-800 rounded-2xl shadow p-4 flex items-center gap-3 border transition 
      hover:scale-[1.03] active:scale-[0.98]
      ${
        activeSection === section
          ? "ring-2 ring-blue-500 border-blue-300"
          : "border-blue-100 dark:border-slate-700"
      }`}
    >
      <Icon className="text-blue-600 dark:text-blue-400" size={26} />
      <div className="text-left">
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-blue-700 dark:text-blue-400">
          {value}
        </p>
      </div>
    </button>
  );

  const SectionCard = ({ title, actions, children }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow border border-blue-100 dark:border-slate-700 p-5 animate-fade-in">
      <div className="flex items-center mb-3">
        <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
          {title}
        </h2>
        <div className="ms-auto flex gap-2">{actions}</div>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      <main className="flex-1 px-6 py-8 mb-14 mx-auto w-full lg:w-3/4 xl:max-w-5xl space-y-6">
        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-400">
            Gestión
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {usuario?.nombre} — {usuario?.rol_jerarquico}
          </p>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MetricCard
            icon={Shield}
            title="Jefaturas"
            value={jefaturas.length}
            section="jefaturas"
          />
          <MetricCard
            icon={Map}
            title="Zonas"
            value={totalZonas}
            section="zonas"
          />
          <MetricCard
            icon={Building2}
            title="Dependencias"
            value={dependencias.length}
            section="dependencias"
          />
          <MetricCard
            icon={Car}
            title="Vehículos"
            value={vehiculos.length}
            section="vehiculos"
          />
          <MetricCard
            icon={Clock}
            title="Regímenes"
            value={regimenes.length}
            section="regimenes"
          />
        </div>

        {/* ================= JEFATURAS ================= */}
        {activeSection === "jefaturas" && (
          <SectionCard
            title="Jefaturas"
            actions={
              usuario?.rol_jerarquico === "ADMINISTRADOR" && (
                <IconButton
                  icon={PlusCircle}
                  tooltip="Agregar jefatura"
                  onClick={() => navigate("/crear-jefatura")}
                />
              )
            }
          >
            <div className="space-y-3">
              {jefaturas.map((j) => (
                <div key={j.id} className="border rounded-xl p-3">
                  <p className="font-semibold">{j.nombre}</p>
                  <p className="text-xs text-gray-500">
                    {j.zonas?.length || 0} zonas
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ================= ZONAS ================= */}
        {activeSection === "zonas" && (
          <SectionCard title="Zonas">
            <div className="space-y-4">
              {jefaturas.map((j) => (
                <div key={j.id}>
                  <p className="font-semibold text-blue-600">{j.nombre}</p>
                  <IconButton
                    icon={PlusCircle}
                    className="ms-auto"
                    tooltip="Agregar zona"
                    onClick={() => navigate(`/crear-zona/${j.id}`)}
                  />

                  {j.zonas?.map((zona) => (
                    <div key={zona.id} className="border rounded-xl p-3 mt-2">
                      <p className="font-medium">{zona.nombre}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ================= DEPENDENCIAS ================= */}
        {activeSection === "dependencias" && (
          <SectionCard
            title="Dependencias"
            actions={
              usuario?.rol_jerarquico === "ADMINISTRADOR" && (
                <IconButton
                  icon={PlusCircle}
                  tooltip="Agregar dependencia"
                  onClick={() => navigate("/crear-dependencia")}
                />
              )
            }
          >
            <div className="space-y-5">
              {jefaturas.map((j) => (
                <div key={j.id} className="space-y-3">
                  <p className="text-sm font-semibold text-blue-700">
                    {j.nombre}
                  </p>

                  {j.zonas?.map((zona) => (
                    <div key={zona.id} className="border rounded-xl p-3">
                      <p className="font-semibold mb-2">{zona.nombre}</p>

                      {(zona.dependencias || []).map((d) => {
                        const jefe = d.usuarios?.find(
                          (u) => u.rol_jerarquico === "JEFE_DEPENDENCIA"
                        );

                        return (
                          <div key={d.id} className="flex justify-between mt-2">
                            <div>
                              <p>{d.nombre}</p>
                              <p className="text-xs text-gray-500">
                                {jefe?.nombre || "Sin jefe"}
                              </p>
                            </div>

                            <div className="flex gap-1">
                              <IconButton
                                icon={Eye}
                                size="sm"
                                onClick={() =>
                                  navigate("/detalle-dependencia", {
                                    state: { dependencia: d },
                                  })
                                }
                              />
                              <IconButton
                                icon={Users}
                                size="sm"
                                onClick={() =>
                                  navigate(`/crear-usuario/${d.id}`)
                                }
                              />
                              {usuario?.rol_jerarquico === "ADMINISTRADOR" && (
                                <IconButton
                                  icon={Edit}
                                  size="sm"
                                  onClick={() =>
                                    navigate(`/editar-dependencia/${d.id}`)
                                  }
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ================= VEHÍCULOS ================= */}
        {activeSection === "vehiculos" && (
          <SectionCard
            title="Vehículos"
            actions={
              <IconButton
                icon={PlusCircle}
                onClick={() => navigate("/crear-vehiculo")}
              />
            }
          >
            <div className="space-y-2">
              {vehiculos.map((v) => (
                <div
                  key={v.id}
                  className="border rounded-xl p-3 flex justify-between"
                >
                  <span>
                    {v.matricula} — {v.marca} {v.modelo}
                  </span>
                  <IconButton
                    icon={Car}
                    size="sm"
                    onClick={() =>
                      navigate("/editar-vehiculo", { state: { vehiculo: v } })
                    }
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ================= REGÍMENES ================= */}
        {activeSection === "regimenes" && (
          <SectionCard
            title="Regímenes"
            actions={
              usuario?.rol_jerarquico === "ADMINISTRADOR" && (
                <IconButton
                  icon={PlusCircle}
                  onClick={() => navigate("/crear-regimen")}
                />
              )
            }
          >
            <div className="space-y-3">
              {regimenes.map((r) => (
                <div
                  key={r.id}
                  className="border rounded-xl p-3 flex justify-between"
                >
                  <div>
                    <p>{r.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {r.horas_trabajo} / {r.horas_descanso}
                    </p>
                  </div>

                  <IconButton
                    icon={Edit}
                    size="sm"
                    onClick={() =>
                      navigate("/editar-regimen", { state: { regimen: r } })
                    }
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </main>

      <BottomNavbar />
    </div>
  );
};

export default GestionPanel;
