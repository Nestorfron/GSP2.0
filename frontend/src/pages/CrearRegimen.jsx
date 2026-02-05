import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { postData } from "../utils/api";
import Navbar from "../components/BottomNavbar";
import { useAppContext } from "../context/AppContext";
import { estaTokenExpirado } from "../utils/tokenUtils";
import BackButton from "../components/BackButton";

export default function CrearRegimen() {
  const { token, recargarRegimenes } = useAppContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    horas_trabajo: "",
    horas_descanso: "",
    admite_rotacion_par_impar: false,
    admite_medio_horario: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ================= VALIDACIÓN ================= */

  const validate = (name, value) => {
    let message = "";
  
    if (name === "nombre" && !value.trim()) {
      message = "Campo obligatorio";
    }
  
    if (name === "horas_trabajo" && (!value || Number(value) <= 0)) {
      message = "Debe ser mayor a 0";
    }
  
    if (name === "horas_descanso" && Number(value) < 0) {
      message = "No puede ser negativo";
    }
  
    setErrors((prev) => ({ ...prev, [name]: message }));
  };
  

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    validate(name, newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasErrors = Object.values(errors).some((e) => e);
    if (hasErrors) return alert("Corrige los errores");

    setLoading(true);

    try {
      await postData("regimen_horarios", formData, token);
      await recargarRegimenes();
      setSuccess(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      horas_trabajo: "",
      horas_descanso: "",
      admite_rotacion_par_impar: false,
      admite_medio_horario: false,
    });
    setSuccess(false);
  };

  /* ================= TOKEN ================= */

  useEffect(() => {
    if (!token || estaTokenExpirado(token)) {
      navigate("/login");
    }
  }, [token, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">

      <div className="flex-grow flex flex-col items-center p-4 pb-24 w-full lg:w-3/4 xl:max-w-4xl mx-auto">

        <form
          onSubmit={handleSubmit}
          className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 space-y-4"
        >

          <div className="flex items-center justify-center gap-2 mb-4">
            <PlusCircle className="text-blue-600 dark:text-blue-300" size={28} />
            <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-200">
              Crear régimen horario
            </h1>
          </div>

          <input
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="input"
          />

          <input
            type="number"
            name="horas_trabajo"
            placeholder="Horas de trabajo"
            value={formData.horas_trabajo}
            onChange={handleChange}
            className="input"
          />

          <input
            type="number"
            name="horas_descanso"
            placeholder="Horas de descanso"
            value={formData.horas_descanso}
            onChange={handleChange}
            className="input"
          />

          <div className="flex gap-4 text-sm">

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="admite_rotacion_par_impar"
                checked={formData.admite_rotacion_par_impar}
                onChange={handleChange}
              />
              Rotación par/impar
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="admite_medio_horario"
                checked={formData.admite_medio_horario}
                onChange={handleChange}
              />
              Medio horario
            </label>

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
            {loading ? "Creando regimen..." : "Crear regimen"}
          </button>


        </form>
        <BackButton to={-1} tooltip="Volver" />

      </div>

      <Navbar />

      <AnimatePresence>
        {success && (
          <motion.div className="modal-overlay">
            <motion.div className="modal-card">
              <CheckCircle2 className="text-green-500 w-16 h-16 mx-auto mb-3" />
              <h2 className="modal-title">
                Régimen creado con éxito
              </h2>

              <div className="flex justify-center gap-3 mt-6">
                <button onClick={resetForm} className="btn-primary">
                  Crear otro
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
