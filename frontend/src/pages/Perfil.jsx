import React, { useState, useEffect } from "react";
import { User, Mail, Key, LogOut } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/BottomNavbar";
import PrendasUsaurio from "./PrendasUsuario";
import { estaTokenExpirado } from "../utils/tokenUtils";
import { putData } from "../utils/api";
import Loading from "../components/Loading";

export default function Perfil() {
  const navigate = useNavigate();
  const { usuario, token, dependencias, loading, logout, obtenerGrado } = useAppContext();

  const [mostrarCambioPass, setMostrarCambioPass] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loadingPass, setLoadingPass] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!token || estaTokenExpirado(token)) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (loading || !usuario) {
    return (
      <Loading />      
    );
  }

  // Buscar nombre de la dependencia (si tiene)
  const dependenciaActual = dependencias?.find(
    (d) => d.id === usuario.dependencia_id
  );

  const handleChangePassword = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      setMensaje("Por favor completa todos los campos.");
      return;
    }

    if (newPass !== confirmPass) {
      setMensaje("Las contraseñas nuevas no coinciden.");
      return;
    }

    setLoadingPass(true);
    setMensaje("");

    try {
      await putData(
        `/usuarios/${usuario.id}/cambiar-password`,
        {
          correo: usuario.correo,
          current_password: currentPass,
          new_password: newPass,
          confirm_password: confirmPass,
        },
        token
      );
      setMensaje("Contraseña actualizada correctamente ✅");
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      setMostrarCambioPass(false);
    } catch (err) {
      setMensaje("Error al cambiar contraseña ❌");
      console.error(err);
    } finally {
      setLoadingPass(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

 
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="flex-grow flex flex-col items-center px-4 py-8 pb-10">
        {/* Tarjeta principal */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 w-full lg:w-1/2 xl:max-w-3xl mx-auto text-center border border-blue-100 dark:border-slate-800">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-slate-800 flex items-center justify-center">
              <User size={48} className="text-blue-600 dark:text-blue-300" />
            </div>
            <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-200">
              {usuario.nombre}
            </h1>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {usuario.rol_jerarquico === "JEFE_DEPENDENCIA"
                ? "JEFE DEPENDENCIA"
                : usuario.rol_jerarquico === "JEFE_ZONA"
                ? "JEFE DE ZONA"
                : usuario.rol_jerarquico || "sin rol definido"}
            </p>
          </div>

          {/* Información del usuario */}
          <div className="mt-6 space-y-4 text-left">
            <div className="flex items-center gap-3 border-b border-blue-100 dark:border-slate-700 pb-2">
              <Mail className="text-blue-500 dark:text-blue-400" size={18} />
              <span className="text-sm text-blue-900 dark:text-blue-200">
                {usuario.correo}
              </span>
            </div>

            {usuario.dependencia_id && (
              <div className="flex items-center gap-3 border-b border-blue-100 dark:border-slate-700 pb-2">
                <span className="text-blue-500 font-medium text-sm">
                  Dependencia:
                </span>
                <span className="text-sm text-blue-900 dark:text-blue-200">
                  {dependenciaActual?.nombre || "Sin asignar"}
                </span>
              </div>
            )}

            {usuario.grado && (
              <div className="flex items-center gap-3 border-b border-blue-100 dark:border-slate-700 pb-2">
                <span className="text-blue-500 font-medium text-sm">
                  Grado:
                </span>
                <span className="text-sm text-blue-900 dark:text-blue-200">
                  {obtenerGrado(usuario.grado)}
                </span>
              </div>
            )}

            {usuario.estado && (
              <div className="flex items-center gap-3 border-b border-blue-100 dark:border-slate-700 pb-2">
                <span className="text-blue-500 font-medium text-sm">
                  Estado:
                </span>
                <span
                  className={`text-sm font-semibold ${
                    usuario.estado.toLowerCase() === "activo"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {usuario.estado}
                </span>
              </div>
            )}

            <PrendasUsaurio />
          </div>

          {/* Botón Cambiar contraseña */}
          <div className="mt-6">
            {!mostrarCambioPass ? (
              <button
                onClick={() => setMostrarCambioPass(true)}
                className="w-full flex items-center justify-center gap-2 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 py-2 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Key size={18} />
                Cambiar contraseña
              </button>
            ) : (
              <div className="mt-4 text-left">
                <h2 className="text-lg font-semibold mb-2 flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                  <Key size={20} /> <span>Cambiar contraseña</span>
                </h2>

                <input
                  type="password"
                  placeholder="Contraseña actual"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full mb-2 dark:bg-slate-800 dark:border-slate-700"
                />
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full mb-2 dark:bg-slate-800 dark:border-slate-700"
                />
                <input
                  type="password"
                  placeholder="Confirmar nueva contraseña"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full mb-3 dark:bg-slate-800 dark:border-slate-700"
                />

                {mensaje && (
                  <p className="text-sm mb-2 text-center text-blue-600 dark:text-blue-300">
                    {mensaje}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleChangePassword}
                    disabled={loadingPass}
                    className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 disabled:opacity-60 transition-colors"
                  >
                    {loadingPass ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => setMostrarCambioPass(false)}
                    className="border border-gray-300 dark:border-slate-700 w-full py-2 rounded text-blue-900 dark:text-blue-100 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="mt-6 w-full flex items-center justify-center gap-2 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 py-2 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-800 transition-colors"
          >
            <LogOut size={24} /> Cerrar sesión
          </button>
        </div>
      </div>
      <Navbar />
    </div>
  );
}
