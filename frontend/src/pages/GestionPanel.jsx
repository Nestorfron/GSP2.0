import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import BottomNavbar from "../components/BottomNavbar";
import Loading from "../components/Loading";
import { estaTokenExpirado } from "../utils/tokenUtils";
import IconButton from "../components/IconButton";

import {
  PlusCircle,
  Eye,
  EyeOff,
  Edit,
  Users,
  Car,
  Shield,
  Building2,
  Map,
  Clock,
} from "lucide-react";

const GestionPanel = () => {
  const {
    usuario,
    loading,
    token,
    jefaturas,
    dependencias,
    vehiculos,
    regimenes,
  } = useAppContext();

  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState(null);

  /* ================= SEGURIDAD ================= */

  useEffect(() => {
    if (!token || estaTokenExpirado(token)) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (loading) return <Loading />;

  const toggle = (section) =>
    setOpenSection(openSection === section ? null : section);

  /* ================= MÉTRICAS ================= */

  const totalZonas = useMemo(
    () => jefaturas.reduce((acc, j) => acc + (j.zonas?.length || 0), 0),
    [jefaturas]
  );

  /* ================= COMPONENTES UI ================= */

  const MetricCard = ({ icon: Icon, title, value }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-4 flex items-center gap-3 border border-blue-100 dark:border-slate-700">
      <Icon className="text-blue-600 dark:text-blue-400" size={26} />
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-blue-700 dark:text-blue-400">
          {value}
        </p>
      </div>
    </div>
  );

  const SectionCard = ({ title, actions, children }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow border border-blue-100 dark:border-slate-700 p-5">
      <div className="flex items-center mb-3">
        <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
          {title}
        </h2>
        <div className="ms-auto flex gap-2">{actions}</div>
      </div>
      {children}
    </div>
  );

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      <main className="flex-1 px-6 py-8 mb-14 mx-auto w-full lg:w-3/4 xl:max-w-5xl space-y-6">
        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-400">
            Dashboard de Gestión
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {usuario.nombre} — {usuario.rol_jerarquico}
          </p>
        </div>

        {/* ================= MÉTRICAS ================= */}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MetricCard
            icon={Shield}
            title="Jefaturas"
            value={jefaturas.length}
          />
          <MetricCard icon={Map} title="Zonas" value={totalZonas} />
          <MetricCard
            icon={Building2}
            title="Dependencias"
            value={dependencias.length}
          />
          <MetricCard icon={Car} title="Vehículos" value={vehiculos.length} />
          <MetricCard
            icon={Clock}
            title="Regímenes"
            value={regimenes?.length || 0}
          />
        </div>

        {/* ================= JEFATURAS ================= */}

        <SectionCard
          title="Jefaturas"
          actions={
            <>
              {usuario.rol_jerarquico === "ADMINISTRADOR" && (
                <IconButton
                  icon={PlusCircle}
                  tooltip="Agregar jefatura"
                  onClick={() => navigate("/crear-jefatura")}
                />
              )}

              <IconButton
                icon={openSection === "jefaturas" ? EyeOff : Eye}
                onClick={() => toggle("jefaturas")}
              />
            </>
          }
        >
          {openSection === "jefaturas" && (
            <div className="space-y-3">
              {jefaturas.map((j) => (
                <div
                  key={j.id}
                  className="border border-blue-100 dark:border-slate-700 rounded-xl p-3"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">{j.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {j.zonas?.length || 0} zonas
                      </p>
                    </div>

                    {usuario.rol_jerarquico === "ADMINISTRADOR" && (
                      <IconButton
                        icon={PlusCircle}
                        tooltip="Agregar zona"
                        size="sm"
                        onClick={() => navigate(`/crear-zona/${j.id}`)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ================= DEPENDENCIAS ================= */}

        <SectionCard
          title="Dependencias"
          actions={
            <IconButton
              icon={openSection === "dependencias" ? EyeOff : Eye}
              onClick={() => toggle("dependencias")}
            />
          }
        >
          {openSection === "dependencias" && (
            <div className="space-y-4">
              {jefaturas.map((j) => (
                <div key={j.id} className="space-y-3">
                  {/* JEFATURA */}
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                    {j.nombre}
                  </p>

                  {/* ZONAS */}
                  {j.zonas?.map((zona) => (
                    <div
                      key={zona.id}
                      className="border border-blue-100 dark:border-slate-700 rounded-xl p-3"
                    >
                      {/* NOMBRE ZONA */}
                      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        {zona.nombre}
                      </p>

                      {/* DEPENDENCIAS */}
                      <div className="space-y-2">
                        {zona.dependencias?.length > 0 ? (
                          zona.dependencias.map((d) => {
                            const jefe = d.usuarios?.find(
                              (u) => u.rol_jerarquico === "JEFE_DEPENDENCIA"
                            );

                            return (
                              <div
                                key={d.id}
                                className="border border-blue-50 dark:border-slate-700 rounded-lg p-3 flex justify-between bg-gray-50 dark:bg-slate-800"
                              >
                                <div>
                                  <p className="font-medium">{d.nombre}</p>
                                  <p className="text-xs text-gray-500">
                                    {jefe?.nombre || "Sin jefe"}
                                  </p>
                                </div>

                                <div className="flex gap-1">
                                  <IconButton
                                    icon={Eye}
                                    size="sm"
                                    onClick={() =>
                                      navigate(`/detalle-dependencia`,
                                        {
                                          state: { dependencia: d },
                                        }
                                      )
                                    }
                                  />

                                  <IconButton
                                    icon={Users}
                                    size="sm"
                                    onClick={() =>
                                      navigate(`/crear-usuario/${d.id}`)
                                    }
                                  />

                                  {usuario.rol_jerarquico ===
                                    "ADMINISTRADOR" && (
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
                          })
                        ) : (
                          <p className="text-xs text-gray-400">
                            Sin dependencias
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ================= VEHÍCULOS ================= */}

        <SectionCard
          title="Vehículos"
          actions={
            <>
              <IconButton
                icon={PlusCircle}
                onClick={() => navigate("/crear-vehiculo")}
              />

              <IconButton
                icon={openSection === "vehiculos" ? EyeOff : Eye}
                onClick={() => toggle("vehiculos")}
              />
            </>
          }
        >
          {openSection === "vehiculos" && (
            <div className="space-y-2">
              {vehiculos.map((v) => (
                <div
                  key={v.id}
                  className="border border-blue-100 dark:border-slate-700 rounded-xl p-3 flex justify-between"
                >
                  <span>
                    {v.matricula} — {v.marca} {v.modelo}
                  </span>

                  <IconButton
                    icon={Car}
                    size="sm"
                    onClick={() =>
                      navigate("/editar-vehiculo", {
                        state: { vehiculo: v },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ================= REGÍMENES ================= */}

        <SectionCard
          title="Regímenes Horarios"
          actions={
            <>
              {usuario.rol_jerarquico === "ADMINISTRADOR" && (
                <IconButton
                  icon={PlusCircle}
                  tooltip="Crear régimen"
                  onClick={() => navigate("/crear-regimen")}
                />
              )}

              <IconButton
                icon={openSection === "regimenes" ? EyeOff : Eye}
                onClick={() => toggle("regimenes")}
              />
            </>
          }
        >
          {openSection === "regimenes" && (
            <div className="space-y-3">
              {regimenes?.map((r) => (
                <div
                  key={r.id}
                  className="border border-blue-100 dark:border-slate-700 rounded-xl p-3 flex justify-between"
                >
                  <div>
                    <p className="font-medium">{r.nombre}</p>

                    <p className="text-xs text-gray-500">
                      {r.horas_trabajo}h trabajo / {r.horas_descanso}h descanso
                    </p>

                    <p className="text-xs text-gray-400">
                      {r.admite_rotacion_par_impar && "Rotación par/impar "}
                      {r.admite_medio_horario && "• Medio horario"}
                    </p>
                  </div>

                  {usuario.rol_jerarquico === "ADMINISTRADOR" && (
                    <IconButton
                      icon={Edit}
                      size="sm"
                      tooltip="Editar régimen"
                      onClick={() =>
                        navigate("/editar-regimen", {
                          state: { regimen: r },
                        })
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </main>

      <BottomNavbar />
    </div>
  );
};

export default GestionPanel;
