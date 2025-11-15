import React from "react";
import { Home, User, Bell, Calendar, CalendarCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const BottomNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAppContext();

  // Determinar ruta del Home según rol
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

  const menuItems = [
    { icon: <Home size={24} />, path: getHomePath() },
    { icon: <Calendar size={24} />, path: "/escalafon-servicio" },
    { icon: <CalendarCheck size={24} />, path: "/licencias" },
    { icon: <Bell size={24} />, path: "/notificaciones" },
    { icon: <User size={24} />, path: "/perfil" },

  ];

  // Filtrar el Escalafón para roles permitidos
  const filteredMenuItems = menuItems.filter(item => {
    if (item.label === "Escalafón") {
      return !["ADMINISTRADOR", "JEFE_ZONA"].includes(usuario?.rol_jerarquico);
    }
    return true;
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-blue-100 dark:border-slate-700 shadow-lg z-50 pb-4">
      <div className="flex justify-around items-center h-16">
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center transition-all ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400 hover:text-blue-500 dark:hover:text-blue-300"
              }`}
            >
              <div
                className={`p-2 rounded-full ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950 shadow-sm"
                    : "bg-transparent"
                }`}
              >
                {item.icon}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavbar;
