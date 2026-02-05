import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PlusCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { postData } from "../utils/api";
import Navbar from "../components/BottomNavbar";
import { estaTokenExpirado } from "../utils/tokenUtils";
import { useAppContext } from "../context/AppContext";
import BackButton from "../components/BackButton";

export default function CrearTurno() {
  const depId = useLocation().state?.depId;
  const navigate = useNavigate();
  const { token, regimenes, recargarDatos } = useAppContext();

  const [formData, setFormData] = useState({
    nombre: "",
    hora_inicio: "",
    hora_fin: "",
    descripcion: "",
    dependencia_id: depId || "",
    regimen_id: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (name, value) => {
    let message = "";
    if (!value.trim() && name !== "descripcion") {
      message = "Campo obligatorio";
    }
    setErrors(prev => ({ ...prev, [name]: message }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasErrors = Object.values(errors).some(e => e);
    if (hasErrors) return alert("Corrige los errores antes de enviar");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        // Enviar null al backend si dependencia_id está vacío
        dependencia_id: depId || formData.dependencia_id || null,
      };
      const data = await postData("turnos", payload, token);
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
      nombre: "",
      hora_inicio: "",
      hora_fin: "",
      descripcion: "",
      dependencia_id: depId || "",
      regimen_id: null,
    });
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
      <div className="flex flex-col items-center m-4 py-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg flex-grow flex flex-col items-center p-4 pb-24 dark:bg-slate-900 w-full lg:w-3/4 xl:max-w-4xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white dark:bg-slate-900 rounded-2xl mb-2 p-6  space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <PlusCircle className="text-blue-600 dark:text-blue-300" size={28} />
            <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-200">
              Crear nuevo turno
            </h1>
          </div>

          {/* Inputs del turno */}
          {[
            { name: "nombre", placeholder: "Nombre del turno" },
            { name: "hora_inicio", placeholder: "Hora de inicio (HH:MM)", type: "time" },
            { name: "hora_fin", placeholder: "Hora de fin (HH:MM)", type: "time" },
            { name: "descripcion", placeholder: "Descripción (opcional)", type: "text" },
          ].map(({ name, placeholder, type = "text" }) => (
            <div key={name}>
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={formData[name]}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 bg-transparent outline-none focus:ring-2 transition-all ${
                  errors[name]
                    ? "border-red-400 focus:ring-red-400"
                    : "border-blue-200 dark:border-slate-700 focus:ring-blue-400"
                }`}
              />
              {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
            </div>
          ))}

          {/* Select de dependencias solo si no hay depId */}
          {!depId && (
            <select
              name="dependencia_id"
              value={formData.dependencia_id}
              onChange={handleChange}
              className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Seleccionar dependencia (opcional)</option>
              {dependencias.map(dep => (
                <option key={dep.id} value={dep.id}>
                  {dep.nombre}
                </option>
              ))}
            </select>
          )}
          
            <select
              name="regimen_id"
              value={formData.regimen_id}
              onChange={handleChange}
              className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Seleccionar régimen</option>
              {regimenes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>

          {/* Botones */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-medium transition-all ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Creando turno..." : "Crear turno"}
          </button>

        </form>
        <BackButton to={-1} tooltip="Volver" />
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
                Turno creado con éxito
              </h2>
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={resetForm}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-all"
                >
                  Crear otro
                </button>
                <BackButton to="/dependencia" tooltip="Volver" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
