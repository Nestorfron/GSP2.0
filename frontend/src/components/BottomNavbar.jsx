import React, { useEffect, useState } from "react";
import {
  Home,
  User,
  Bell,
  Calendar,
  CalendarCheck,
  List,
  Users,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { postData } from "../utils/api";

const BottomNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, notificaciones, setNewToken, dependencias, regimenes } =
    useAppContext();

  const [showModal, setShowModal] = useState(false);

  // ⏳ Verificación periódica de expiración
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const payloadBase64 = token.split(".")[1];
      if (!payloadBase64) return;

      const payload = JSON.parse(atob(payloadBase64));
      const tiempoRestante = payload.exp - Math.floor(Date.now() / 1000);

      if (tiempoRestante > 0 && tiempoRestante < 300) {
        setShowModal(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // 🔄 Renovar token
  const renovarSesion = async () => {
    try {
      const tokenActual = localStorage.getItem("token");

      const { token: nuevoToken } = await postData(
        "/refresh-token",
        {},
        tokenActual
      );

      localStorage.setItem("token", nuevoToken);
      setNewToken(nuevoToken);
      setShowModal(false);
    } catch (error) {
      console.error("Error al renovar token:", error);
      alert("Error al renovar la sesión.");
    }
  };

  // 📌 Rutas según rol
  const getHomePath = () => {
    switch (usuario?.rol_jerarquico) {
      case "ADMINISTRADOR":
        return "/admin";
      case "JEFE_ZONA":
        return "/zona";
      case "JEFE_DEPENDENCIA":
        return "/dependencia";
      case "FUNCIONARIO":
        return "/funcionario";
      default:
        return "/";
    }
  };

  // const getEscalafonPath = () => {
  //   if (usuario.rol_jerarquico === "ADMINISTRADOR" || usuario.rol_jerarquico === "JEFE_ZONA") return "/escalafon-servicio";
  //   const regimen_id = dependencias.find((d) => d.id === usuario.dependencia_id).regimen_id;
  //   const regimen = regimenes.find((r) => r.id === regimen_id)?.nombre;
  //   if (regimen === "12X36") {
  //     return "/escalafon-12x36";
  //   }
  //   return "/escalafon-servicio";
  // };

  const notificacionesUsuario = notificaciones.filter(
    (n) => n.usuario_id === usuario.id
  );

  const notificacionesCount = notificacionesUsuario.length;

  // 📋 Ítems del menú
  const menuItems = [
    { key: "home", icon: Home, path: getHomePath(), label: "Inicio" },
    {
      key: "gestion",
      icon: Users,
      path: "/gestion",
      label: "Gestión",
    },
    {
      key: "dependencia",
      icon: List,
      path: "/detalle-dependencia",
      label: "Detalle",
    },
    {
      key: "escalafon",
      icon: Calendar,
      // path: getEscalafonPath(),
      path: "/escalafon-servicio",
      label: "Escalafón",
    },
    {
      key: "licencias",
      icon: CalendarCheck,
      path: "/licencias",
      label: "Licencias",
    },
    {
      key: "notificaciones",
      icon: Bell,
      path: "/notificaciones",
      label: "Avisos",
    },
    { key: "perfil", icon: User, path: "/perfil", label: "Perfil" },
  ];

  // 🔐 Filtros por rol
  const filteredMenuItems = menuItems.filter((item) => {
    // SOLO ADMIN
    if (item.path === "/gestion") {
      return usuario?.rol_jerarquico === "ADMINISTRADOR";
    }

    if (["/escalafon-servicio", "/licencias"].includes(item.path)) {
      return !["ADMINISTRADOR", "JEFE_ZONA"].includes(usuario?.rol_jerarquico);
    }

    if (item.path === "/detalle-dependencia") {
      return !["ADMINISTRADOR", "FUNCIONARIO", "JEFE_DEPENDENCIA"].includes(
        usuario?.rol_jerarquico
      );
    }

    return true;
  });

  return (
    <>
      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg z-50 pb-6">
        <div className="flex justify-around items-center h-16 px-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.key}
                onClick={() =>
                  item.key === "notificaciones"
                    ? navigate("/notificaciones", {
                        state: { notificaciones: notificacionesUsuario },
                      })
                    : navigate(item.path)
                }
                className="flex flex-col items-center justify-center w-16"
              >
                <div
                  className={`relative p-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                  }`}
                >
                  <Icon size={24} />

                  {item.key === "notificaciones" && notificacionesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full shadow">
                      {notificacionesCount}
                    </span>
                  )}
                </div>

                <span
                  className={`mt-1 text-[11px] font-medium ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* FOOTER */}
      <footer className="pb-24 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>
          SGP — desarrollado por{" "}
          <a
            href="https://github.com/nestorfron"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 dark:text-blue-400"
          >
            Nestor Frones
          </a>
        </p>
        <p>Todos los derechos reservados — © 2025</p>
      </footer>

      {/* MODAL EXTENDER SESIÓN */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl w-80 text-center border border-gray-200 dark:border-slate-700">
            <div className="text-5xl mb-3">⚠️</div>

            <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
              Tu sesión está por expirar. ¿Deseas mantenerla activa?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition"
              >
                No
              </button>

              <button
                onClick={renovarSesion}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Sí, continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNavbar;
