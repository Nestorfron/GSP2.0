import React, { useEffect, useState } from "react";
import { Home, User, Bell, Calendar, CalendarCheck, List } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { estaTokenExpirado } from "../utils/tokenUtils";
import { postData } from "../utils/api"; // usado para renovar token

const BottomNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, notificaciones, setNewToken } = useAppContext();

  // ⏳ Estado para mostrar modal
  const [showModal, setShowModal] = useState(false);

  // 🕒 Verificar expiración cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const payloadBase64 = token.split(".")[1];
      if (!payloadBase64) return;

      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

      const ahora = Math.floor(Date.now() / 1000);
      const falta = payload.exp - ahora;

      // Mostrar modal cuando falten ≤ 5 minutos
      if (falta > 0 && falta < 300) {
        setShowModal(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // 🔄 Extender sesión
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
    if (!usuario?.rol_jerarquico) return "/";
    switch (usuario.rol_jerarquico) {
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

  const notificacionesUsuario = notificaciones.filter(
    (n) => n.usuario_id === usuario.id
  );
  const notificacionesCount = notificacionesUsuario.length;

  const menuItems = [
    { key: "home", icon: Home, path: getHomePath(), label: "Inicio" },
    {
      key: "dependencia",
      icon: List,
      path: "/detalle-dependencia",
      label: "Detalle Dep.",
    },
    {
      key: "escalafon",
      icon: Calendar,
      path: "/escalafon-servicio",
      label: "Escalafon",
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
      label: "Notificaciones",
    },
    { key: "perfil", icon: User, path: "/perfil", label: "Perfil" },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.path === "/escalafon-servicio" || item.path === "/licencias") {
      return !["ADMINISTRADOR", "JEFE_ZONA"].includes(usuario?.rol_jerarquico);
    } else if (item.path === "/detalle-dependencia") {
      return !["ADMINISTRADOR", "FUNCIONARIO", "JEFE_DEPENDENCIA"].includes(
        usuario?.rol_jerarquico
      );
    }
    return true;
  });

  return (
    <>
      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-blue-100 dark:border-slate-700 shadow-lg z-50 pb-4">
        <div className="flex justify-around items-center h-16">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            const handleClick = () => {
              if (item.key === "notificaciones") {
                navigate("/notificaciones", {
                  state: { notificaciones: notificacionesUsuario },
                });
              } else {
                navigate(item.path);
              }
            };

            return (
              <button
                key={item.key}
                onClick={handleClick}
                className={`flex flex-col items-center justify-center transition-all ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400 hover:text-blue-500 dark:hover:text-blue-300"
                }`}
              >
                <div
                  className={`relative p-2 rounded-full ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950 shadow-sm"
                      : "bg-transparent"
                  }`}
                >
                  <Icon size={24} />

                  {item.key === "notificaciones" && notificacionesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full shadow">
                      {notificacionesCount}
                    </span>
                  )}
                </div>
                <span className="mt-1 text-[12px] font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* MODAL EXTENDER SESIÓN */}
      {/* MODAL EXTENDER SESIÓN */}
{showModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl w-80 text-center">
      {/* ICONO de advertencia */}
      <div className="flex justify-center mb-4">
        <span className="text-red-500 text-4xl">⚠️</span>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
        Tu sesión está por expirar. ¿Deseas mantenerla activa?
      </p>

      <div className="flex justify-between gap-3">
        <button
          onClick={() => setShowModal(false)}
          className="flex-1 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          No
        </button>

        <button
          onClick={renovarSesion}
          className="flex-1 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
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
