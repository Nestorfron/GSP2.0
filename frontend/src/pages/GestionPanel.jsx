import React, { useEffect, useState } from "react";
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
} from "lucide-react";

const GestionPanel = () => {
  const {
    usuario,
    loading,
    token,
    jefaturas,
    dependencias,
    vehiculos,
  } = useAppContext();

  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState(null);

  useEffect(() => {
    if (!token || estaTokenExpirado(token)) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (loading) return <Loading />;

  const toggle = (section) =>
    setOpenSection(openSection === section ? null : section);

  const Card = ({ title, actions, children }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow border border-blue-100 dark:border-slate-700 p-4">
      <div className="flex items-center mb-2">
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
      <main className="flex-1 px-6 py-8 mb-14 mx-auto w-full lg:w-3/4 xl:max-w-4xl space-y-5">

        {/* Encabezado */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-400">
            Gestión General
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {usuario.nombre} — {usuario.rol_jerarquico}
          </p>
        </div>

        {/* JEFATURAS + ZONAS */}
        <Card
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
                tooltip="Ver"
                onClick={() => toggle("jefaturas")}
              />
            </>
          }
        >
          {openSection === "jefaturas" && (
            <div className="mt-3 space-y-4 text-sm">
              {jefaturas.map((j) => (
                <div
                  key={j.id}
                  className="border border-blue-100 dark:border-slate-700 rounded-xl p-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-blue-700 dark:text-blue-400">
                      {j.nombre}
                    </div>
                    {usuario.rol_jerarquico === "ADMINISTRADOR" && (
                      <IconButton
                        icon={PlusCircle}
                        tooltip="Agregar zona"
                        onClick={() => navigate(`/crear-zona/${j.id}`)}
                        size="sm"
                      />
                    )}
                  </div>

                  {/* Zonas */}
                  <ul className="mt-2 space-y-1 text-xs">
                    {j.zonas && j.zonas.length > 0 ? (
                      j.zonas.map((z) => (
                        <li
                          key={z.id}
                          className="flex justify-between items-center text-gray-600 dark:text-gray-400"
                        >
                          <span>• {z.nombre}</span>

                          {usuario.rol_jerarquico === "ADMINISTRADOR" && (
                            <IconButton
                              icon={Edit}
                              tooltip="Editar zona"
                              onClick={() =>
                                navigate(`/editar-zona/${z.id}`, {
                                    state: {zona: z}
                                })
                              }
                              size="sm"
                            />
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="italic text-gray-500">Sin zonas</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* DEPENDENCIAS */}
        <Card
          title="Dependencias"
          actions={
            <IconButton
              icon={openSection === "dependencias" ? EyeOff : Eye}
              tooltip="Ver"
              onClick={() => toggle("dependencias")}
            />
          }
        >
          {openSection === "dependencias" && (
            <ul className="mt-2 space-y-3 text-sm">
              {dependencias.map((d) => {
                const jefe = d.usuarios?.find(
                  (u) => u.rol_jerarquico === "JEFE_DEPENDENCIA"
                );

                return (
                  <li
                    key={d.id}
                    className="flex justify-between items-center gap-2"
                  >
                    <div>
                      <div className="font-medium">{d.nombre}</div>
                      <div className="text-xs text-gray-500">
                        {jefe ? jefe.nombre : "Sin jefe"}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <IconButton
                        icon={Eye}
                        tooltip="Ver dependencia"
                        onClick={() => navigate(`/dependencia/${d.id}`)}
                        size="sm"
                      />
                      <IconButton
                        icon={Users}
                        tooltip="Agregar funcionario"
                        onClick={() =>
                          navigate(`/agregar-usuarios/${d.id}`)
                        }
                        size="sm"
                      />
                      {usuario.rol_jerarquico === "ADMINISTRADOR" && (
                        <IconButton
                          icon={Edit}
                          tooltip="Editar dependencia"
                          onClick={() =>
                            navigate(`/editar-dependencia/${d.id}`)
                          }
                          size="sm"
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* VEHÍCULOS */}
        <Card
          title="Vehículos"
          actions={
            <>
              <IconButton
                icon={PlusCircle}
                tooltip="Agregar vehículo"
                onClick={() => navigate("/crear-vehiculo")}
              />
              <IconButton
                icon={openSection === "vehiculos" ? EyeOff : Eye}
                tooltip="Ver"
                onClick={() => toggle("vehiculos")}
              />
            </>
          }
        >
          {openSection === "vehiculos" && (
            <ul className="mt-2 space-y-2 text-sm">
              {vehiculos.map((v) => (
                <li
                  key={v.id}
                  className="flex justify-between items-center"
                >
                  <span>
                    • {v.matricula} — {v.marca} {v.modelo}
                  </span>
                  <IconButton
                    icon={Car}
                    tooltip="Editar vehículo"
                    onClick={() =>
                      navigate("/editar-vehiculo", {
                        state: { vehiculo: v },
                      })
                    }
                    size="sm"
                  />
                </li>
              ))}
            </ul>
          )}
        </Card>

      </main>

      <BottomNavbar />
    </div>
  );
};

export default GestionPanel;
