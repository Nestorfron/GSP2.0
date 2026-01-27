import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PlusCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { postData } from "../utils/api";
import Navbar from "../components/BottomNavbar";
import { useAppContext } from "../context/AppContext";
import { estaTokenExpirado } from "../utils/tokenUtils";
import BackButton from "../components/BackButton";

export default function CrearZona() {
  const { token, recargarDatos } = useAppContext();

  const navigate = useNavigate();
  const { jefaturaId } = useParams();
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    jefatura_id: jefaturaId || "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (name, value) => {
    let message = "";
    if (!value.trim()) message = "Campo obligatorio";
    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasErrors = Object.values(errors).some((e) => e);
    if (hasErrors) return alert("Corrige los errores antes de enviar");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const data = await postData("zonas", formData, token);
      if (data) setSuccess(true);
      recargarDatos();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: "", descripcion: "", jefatura_id: jefaturaId || "" });
    setErrors({});
    setSuccess(false);
  };

  useEffect(() => {
    if (!token || estaTokenExpirado(token)) {
      navigate("/login");
    }
  }, [token, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="flex-grow flex flex-col items-center p-4 pb-24 dark:bg-slate-900  p-6 w-full lg:w-3/4 xl:max-w-4xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <PlusCircle
              className="text-blue-600 dark:text-blue-300"
              size={28}
            />
            <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-200">
              Crear nueva zona
            </h1>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre de la zona"
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
              <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>
            )}

            <textarea
              name="descripcion"
              placeholder="Descripción (opcional)"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none resize-none"
            />

            {!jefaturaId && (
              <input
                type="number"
                name="jefatura_id"
                placeholder="ID de la Jefatura"
                value={formData.jefatura_id}
                onChange={handleChange}
                className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
              />
            )}
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
            {loading ? "Creando zona..." : "Crear zona"}
          </button>

          <BackButton to={-1} tooltip="Volver" />
        </form>
      </div>

      <Navbar />

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
                Zona creada con éxito
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                La nueva zona fue registrada correctamente.
              </p>
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={resetForm}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-all"
                >
                  Crear otra
                </button>
                <BackButton to="/admin" tooltip="Volver" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
