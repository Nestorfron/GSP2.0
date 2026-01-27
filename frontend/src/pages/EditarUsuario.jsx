import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Save } from "lucide-react";
import { putData } from "../utils/api";
import Navbar from "../components/BottomNavbar";
import { useAppContext } from "../context/AppContext";
import { estaTokenExpirado } from "../utils/tokenUtils";
import BackButton from "../components/BackButton";

export default function EditarUsuario() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, jefaturas, funciones, recargarUsuarios, grados } = useAppContext();

  const usuarioData = location.state?.usuario;

  const dependencias =
    jefaturas?.flatMap((jefatura) =>
      jefatura.zonas?.flatMap((zona) => zona.dependencias || []) || []
    ) || [];

  const [formData, setFormData] = useState(
    usuarioData || {
      grado: "",
      nombre: "",
      correo: "",
      rol_jerarquico: "",
      fecha_ingreso: "",
      dependencia_id: "",
      zona_id: "",
      turno_id: null,
      funcion_id: null,
      estado: "",
      is_admin: false,
    }
  );

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || estaTokenExpirado(token)) navigate("/login");
  }, [token, navigate]);

  // 🔹 Función para convertir la fecha a formato válido para el input type="date"
  const formatFecha = (fecha) => {
    if (!fecha) return "";
    const parsed = new Date(fecha);
    return isNaN(parsed) ? "" : parsed.toISOString().split("T")[0];
  };

  // 🔹 Obtener los turnos de la dependencia seleccionada
  const turnosFiltrados = React.useMemo(() => {
    const depSeleccionada = dependencias.find(
      (dep) => dep.id === Number(formData.dependencia_id)
    );
    return depSeleccionada?.turnos || [];
  }, [formData.dependencia_id, dependencias]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      // 🔹 Si cambia la dependencia, limpiamos el turno seleccionado
      ...(name === "dependencia_id" ? { turno_id: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await putData(`usuarios/${formData.id}`, formData, token);
      setSuccess(true);
      recargarUsuarios();
    } catch (err) {
      alert(`❌ Error al actualizar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="flex-grow flex flex-col items-center p-4 pb-24 flex-grow flex flex-col items-center p-4 pb-24 dark:bg-slate-900  p-6 w-full lg:w-3/4 xl:max-w-4xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Save className="text-blue-600 dark:text-blue-300" size={28} />
            <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-200">
              Editar usuario
            </h1>
          </div>

          {/* Campos de texto */}
          {[ "nombre", "correo", "rol_jerarquico"].map((field) => (
            <input
              key={field}
              type="text"
              name={field}
              placeholder={field.replace("_", " ").toUpperCase()}
              value={formData[field] || ""}
              onChange={handleChange}
              className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
            />
          ))}

          {/* Grado */}
          <div>
            <select
              name="grado"
              value={formData.grado || ""}
              onChange={handleChange}
              className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Seleccionar grado</option>
              {grados.map((grado) => (
                <option key={grado} value={grado}>
                  {grado}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
              Estado
            </label>
            <select
              name="estado"
              value={formData.estado || ""}
              onChange={handleChange}
              className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Seleccionar estado</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </div>

          {/* Fecha de ingreso */}
          <div>
            <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
              Fecha de ingreso
            </label>
            <input
              type="date"
              name="fecha_ingreso"
              value={formatFecha(formData.fecha_ingreso)}
              onChange={handleChange}
              className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          {/* Dependencia */}
          <div>
            <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
              Dependencia
            </label>
            <select
              name="dependencia_id"
              value={formData.dependencia_id || ""}
              onChange={handleChange}
              className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Seleccionar dependencia</option>
              {dependencias.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* 🔹 Selector de turno filtrado por dependencia */}
          <div>
            <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
              Turno
            </label>
            <select
              name="turno_id"
              value={formData.turno_id || ""}
              onChange={handleChange}
              disabled={!formData.dependencia_id || turnosFiltrados.length === 0}
              className={`w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none ${
                !formData.dependencia_id ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <option value="">
                {turnosFiltrados.length > 0
                  ? "Seleccionar turno"
                  : "Sin turnos disponibles"}
              </option>
              {turnosFiltrados.map((turno) => (
                <option key={turno.id} value={turno.id}>
                  {turno.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Select Funcion */}
          <div>
            <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
              Función
            </label>
            <select
              name="funcion_id"
              value={formData.funcion_id || ""}
              onChange={handleChange}
              className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Seleccionar función</option>
              {funciones.map((funcion) => (
                <option key={funcion.id} value={funcion.id}>
                  {funcion.descripcion}
                </option>
              ))}
            </select>
          </div>

          {/* Checkbox admin */}
          <label className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300">
            <input
              type="checkbox"
              name="is_admin"
              checked={formData.is_admin}
              onChange={handleChange}
              className="accent-blue-600"
            />
            Es administrador
          </label>

          {/* Botón guardar */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-medium transition-all ${
              loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
          <BackButton to={-1} tooltip="Volver" />
        </form>
      </div>

      <Navbar />

      {/* Modal de éxito */}
      <AnimatePresence>
        {success && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center max-w-sm w-full"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <CheckCircle2 className="text-green-500 w-16 h-16 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                Usuario actualizado con éxito
              </h2>
              <BackButton to={-1} tooltip="Volver" />
              
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
