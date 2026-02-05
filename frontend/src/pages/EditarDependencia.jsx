import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { putData } from "../utils/api";
import Navbar from "../components/BottomNavbar";
import { estaTokenExpirado } from "../utils/tokenUtils";
import { useAppContext } from "../context/AppContext";
import BackButton from "../components/BackButton";

export default function EditarDependencia() {
  const { token, jefaturas, regimenes, recargarDependencias, loading, setLoading } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const dependencia = location.state?.dependencia;

  const zonas = jefaturas?.flatMap((j) => j.zonas || []) || [];

  const [formData, setFormData] = useState({
    nombre: dependencia?.nombre || "",
    descripcion: dependencia?.descripcion || "",
    zona_id: dependencia?.zona_id || "",
    regimen_id: dependencia?.regimen_id || "",
  });


  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  /* ================= VALIDACIÓN ================= */
  const validate = (name, value) => {
    let message = "";
    if (!value?.toString().trim() && name === "nombre") {
      message = "Campo obligatorio";
    }
    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  /* ================= CARGAR DESDE STATE ================= */


  /* ================= TOKEN ================= */
  useEffect(() => {
    if (!token || estaTokenExpirado(token)) {
      navigate("/login");
    }
  }, [token]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasErrors = Object.values(errors).some((e) => e);
    if (hasErrors) return alert("Corrige los errores antes de enviar");

    setLoading(true);

    try {
      await putData(`dependencias/${dependencia.id}`, formData, token);

      setSuccess(true);
      recargarDependencias();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="flex-grow flex flex-col items-center p-4 pb-24 p-6 w-full lg:w-3/4 xl:max-w-4xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Pencil className="text-blue-600 dark:text-blue-300" size={28} />
            <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-200">
              Editar dependencia
            </h1>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre de la dependencia"
              value={formData.nombre}
              onChange={handleChange}
              required
              className={`w-full border rounded-lg px-3 py-2 bg-transparent outline-none focus:ring-2 transition-all ${
                errors.nombre
                  ? "border-red-400 focus:ring-red-400"
                  : "border-blue-200 dark:border-slate-700 focus:ring-blue-400"
              }`}
            />

            {errors.nombre && (
              <p className="text-xs text-red-500">{errors.nombre}</p>
            )}

            <textarea
              name="descripcion"
              placeholder="Descripción"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none resize-none"
            />

            <select
              name="zona_id"
              value={formData.zona_id}
              onChange={handleChange}
              className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
            >
              {zonas.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.nombre}
                </option>
              ))}
            </select>

            <select
              name="regimen_id"
              value={formData.regimen_id}
              onChange={handleChange}
              className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Regimen horario</option>
              {regimenes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-medium transition-all ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Guardar cambios
          </button>

        </form>
        <BackButton to={-1} tooltip="Volver" />

      </div>

      <Navbar />

      {/* MODAL SUCCESS */}
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
                Dependencia actualizada
              </h2>

              <div className="flex justify-center gap-3 mt-6">
                <BackButton to="/admin" tooltip="Volver al panel" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
