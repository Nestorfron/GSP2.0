import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { putData } from "../utils/api";
import Navbar from "../components/BottomNavbar";
import { useAppContext } from "../context/AppContext";
import { estaTokenExpirado } from "../utils/tokenUtils";
import BackButton from "../components/BackButton";

export default function EditarRegimen() {
  const { token, recargarDatos } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const regimen = location.state?.regimen;

  const [formData, setFormData] = useState(regimen || {});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await putData(`regimen_horarios/${formData.id}`, formData, token);
      await recargarDatos();
      setSuccess(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= TOKEN ================= */

  useEffect(() => {
    if (!token || estaTokenExpirado(token)) {
      navigate("/login");
    }

    if (!regimen) navigate("/admin");
  }, [token, regimen, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="flex-grow flex flex-col items-center p-4 pb-24 w-full lg:w-3/4 xl:max-w-4xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Edit className="text-blue-600 dark:text-blue-300" size={28} />
            <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-200">
              Editar régimen
            </h1>
          </div>

          <input
            name="nombre"
            value={formData.nombre || ""}
            onChange={handleChange}
            className="input"
          />

          <input
            type="number"
            name="horas_trabajo"
            value={formData.horas_trabajo || ""}
            onChange={handleChange}
            className="input"
          />

          <input
            type="number"
            name="horas_descanso"
            value={formData.horas_descanso || ""}
            onChange={handleChange}
            className="input"
          />

          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="admite_rotacion_par_impar"
                checked={formData.admite_rotacion_par_impar || false}
                onChange={handleChange}
              />
              Rotación par/impar
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="admite_medio_horario"
                checked={formData.admite_medio_horario || false}
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
            {loading ? "Guardando..." : "Guardar cambios"}
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
              <h2 className="modal-title">Régimen actualizado</h2>

              <BackButton to="/admin" tooltip="Volver" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
