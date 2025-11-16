import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { postData } from "../utils/api";
import Navbar from "../components/BottomNavbar";
import { estaTokenExpirado } from "../utils/tokenUtils";
import { useAppContext } from "../context/AppContext";
import BackButton from "../components/BackButton";
import Loading from "../components/Loading";

export default function CrearLicencia() {
  const navigate = useNavigate();
  const { token, usuario, recargarDatos } = useAppContext();

  const [formData, setFormData] = useState({
    usuario_id: usuario?.id || "",
    fecha_inicio: "",
    fecha_fin: "",
    tipo: "",
    motivo: "",
    estado: "pendiente",
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
      const data = await postData("licencias", formData, token);
      if (data) setSuccess(true);
      recargarDatos();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      usuario_id: usuario?.id || "",
      fecha_inicio: "",
      fecha_fin: "",
      tipo: "",
      motivo: "",
      estado: "pendiente",
    });
    setErrors({});
    setSuccess(false);
  };

  useEffect(() => {
    if (!token || estaTokenExpirado(token)) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (loading) return <Loading />;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="flex-grow flex flex-col items-center p-4 pb-24">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 space-y-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <ClipboardList
              className="text-blue-600 dark:text-blue-300"
              size={28}
            />
            <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-200">
              Solicitar Nueva Licencia
            </h1>
          </div>

          {/* Campos */}
          {[
            { name: "fecha_inicio", type: "date", label: "Fecha de inicio" },
            { name: "fecha_fin", type: "date", label: "Fecha de fin" },
          ].map(({ name, type, label }) => (
            <div key={name}>
              <label className="text-sm text-blue-900 dark:text-blue-200">
                {label}
              </label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 bg-transparent outline-none focus:ring-2 transition-all ${
                  errors[name]
                    ? "border-red-400 focus:ring-red-400"
                    : "border-blue-200 dark:border-slate-700 focus:ring-blue-400"
                }`}
              />
              {errors[name] && (
                <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
              )}
            </div>
          ))}

          {/* Tipo */}
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option value="">Seleccionar tipo de licencia</option>
            <option value="reglamentaria">Reglamentaria</option>
            <option value="extraordinaria">Extraordinaria</option>
            <option value="compensacion">Compensación</option>
          </select>
          {errors.tipo && (
            <p className="text-xs text-red-500 mt-1">{errors.tipo}</p>
          )}

          {/* Motivo */}
          <input
            type="text"
            name="motivo"
            placeholder="Motivo (opcional)"
            value={formData.motivo}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 bg-transparent outline-none focus:ring-2 transition-all ${
              errors.motivo
                ? "border-red-400 focus:ring-red-400"
                : "border-blue-200 dark:border-slate-700 focus:ring-blue-400"
            }`}
          />
          {errors.motivo && (
            <p className="text-xs text-red-500 mt-1">{errors.motivo}</p>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-medium transition-all ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Enviando Solicitud..." : "Solicitar"}
          </button>

        </form>
        <BackButton to={"/licencias"} tooltip="Volver" />
        </div>
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
                Solicitud enviada con éxito
              </h2>
              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={resetForm}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-all"
                >
                  Solicitar otra licencia
                </button>
                <BackButton to="/licencias" tooltip="Volver" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
