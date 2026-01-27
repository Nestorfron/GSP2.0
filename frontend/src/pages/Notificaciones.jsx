import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { estaTokenExpirado } from "../utils/tokenUtils";
import BottomNavbar from "../components/BottomNavbar";
import { deleteData } from "../utils/api";
import { Trash, Bell } from "lucide-react";
import IconButton from "../components/IconButton";

const Notificaciones = () => {
  const navigate = useNavigate();
  const { token, recargarNotificaciones, notificaciones, usuario } = useAppContext();

  const notificacionesUsuario = notificaciones.filter(
    (n) => n.usuario_id === usuario.id
  );

  useEffect(() => {
    if (!token || estaTokenExpirado(token)) {
      navigate("/login");
    }
    recargarNotificaciones();
  }, [token, navigate]);

  const handleEliminarNotificacion = async (id) => {
    try {
      const data = await deleteData(`/notificaciones/${id}`, token);
      if (data) navigate("/notificaciones");
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
    recargarNotificaciones();
  };

  const currentYear = new Date().getFullYear();

  // Detecta si la notificación debe llevar al usuario a licencias-solicitadas
  const debeNavegar = (mensaje) => {
    return mensaje?.includes("solicitó una licencia");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      <main className="flex-1 px-6 py-8 space-y-6 dark:bg-slate-900  p-6 w-full lg:w-3/4 xl:max-w-4xl mx-auto">
        
        {/* Encabezado */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-400">
            Notificaciones
          </h1>
        </div>

        {/* Si NO hay notificaciones */}
        {notificacionesUsuario?.length === 0 && (
          <div className="text-center mt-10">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              No tienes notificaciones
            </p>
          </div>
        )}

        {/* Lista de notificaciones */}
        <div className="space-y-6">
          {notificacionesUsuario?.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (debeNavegar(n.mensaje)) {
                  navigate(`/solicitudes-licencia`);
                }
              }}
              className={`flex items-center justify-between p-4 bg-white dark:bg-slate-800 border 
                border-blue-100 dark:border-slate-700 rounded-2xl shadow-sm
                transition-all 
                ${
                  debeNavegar(n.mensaje)
                    ? "cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700"
                    : ""
                }`}
            >
              {/* Botón izquierda */}
              <IconButton
                icon={Bell}
                tooltip="Eliminar notificación"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEliminarNotificacion(n.id);
                }}
                size="sm"
              />

              {/* Mensaje */}
              <p className="text-sm text-gray-700 dark:text-gray-300 px-3">
                {n.mensaje || "Sin contenido"}
              </p>

              {/* Botón derecha */}
              <IconButton
                className="my-auto ms-auto"
                icon={Trash}
                tooltip="Eliminar notificación"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEliminarNotificacion(n.id);
                }}
                size="sm"
              />
            </div>
          ))}
        </div>
      </main>

      <BottomNavbar />
    </div>
  );
};

export default Notificaciones;
