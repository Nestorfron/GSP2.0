import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PlusCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { postData } from "../utils/api";
import Navbar from "../components/BottomNavbar";
import { estaTokenExpirado } from "../utils/tokenUtils";
import { useAppContext } from "../context/AppContext";
import BackButton from "../components/BackButton";

export default function CrearPeriodoLicencia() {
  const depId = useLocation().state?.depId;
  const navigate = useNavigate();

  const { token, dependencias, recargarPeriodosLicencia } = useAppContext();

  const [formData, setFormData] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    dependencia_id: depId || "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (name, value) => {
    let message = "";

    if (!value && name !== "dependencia_id") {
      message = "Campo obligatorio";
    }

    if (
      name === "fecha_fin" &&
      value &&
      formData.fecha_inicio &&
      value <= formData.fecha_inicio
    ) {
      message = "La fecha de fin debe ser posterior a la fecha de inicio";
    }

    if (
      name === "fecha_inicio" &&
      value &&
      formData.fecha_fin &&
      formData.fecha_fin <= value
    ) {
      setErrors((prev) => ({
        ...prev,
        fecha_fin: "La fecha de fin debe ser posterior a la fecha de inicio",
      }));
    } else if (name === "fecha_inicio") {
      setErrors((prev) => ({ ...prev, fecha_fin: "" }));
    }

    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nuevosErrores = {};

    if (!formData.fecha_inicio) {
      nuevosErrores.fecha_inicio = "Campo obligatorio";
    }

    if (!formData.fecha_fin) {
      nuevosErrores.fecha_fin = "Campo obligatorio";
    }

    if (
      formData.fecha_inicio &&
      formData.fecha_fin &&
      formData.fecha_fin <= formData.fecha_inicio
    ) {
      nuevosErrores.fecha_fin =
        "La fecha de fin debe ser posterior a la fecha de inicio";
    }

    if (!(depId || formData.dependencia_id)) {
      nuevosErrores.dependencia_id = "Seleccioná una dependencia";
    }

    setErrors(nuevosErrores);

    if (Object.values(nuevosErrores).some((error) => error)) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        fecha_inicio: `${formData.fecha_inicio}:00`,
        fecha_fin: `${formData.fecha_fin}:00`,
        dependencia_id: depId || formData.dependencia_id,
      };

      const data = await postData("periodos_licencia", payload, token);

      if (data) {
        setSuccess(true);
        recargarPeriodosLicencia();
      }
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fecha_inicio: "",
      fecha_fin: "",
      dependencia_id: depId || "",
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
      <div className="flex flex-col items-center m-4 py-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg flex-grow p-4 pb-24 w-full lg:w-3/4 xl:max-w-4xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white dark:bg-slate-900 rounded-2xl mb-2 p-6 space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <PlusCircle
              className="text-blue-600 dark:text-blue-300"
              size={28}
            />

            <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-200">
              Crear período de licencia
            </h1>
          </div>

          {/* Fecha de inicio */}
          <div>
            <label className="block text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
              Fecha de inicio
            </label>

            <input
              type="date"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 bg-transparent outline-none focus:ring-2 transition-all ${
                errors.fecha_inicio
                  ? "border-red-400 focus:ring-red-400"
                  : "border-blue-200 dark:border-slate-700 focus:ring-blue-400"
              }`}
            />

            {errors.fecha_inicio && (
              <p className="text-xs text-red-500 mt-1">{errors.fecha_inicio}</p>
            )}
          </div>

          {/* Fecha de fin */}
          <div>
            <label className="block text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
              Fecha de fin
            </label>

            <input
              type="date"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 bg-transparent outline-none focus:ring-2 transition-all ${
                errors.fecha_fin
                  ? "border-red-400 focus:ring-red-400"
                  : "border-blue-200 dark:border-slate-700 focus:ring-blue-400"
              }`}
            />

            {errors.fecha_fin && (
              <p className="text-xs text-red-500 mt-1">{errors.fecha_fin}</p>
            )}
          </div>

          {/* Dependencia */}
          {!depId && (
            <div>
              <select
                name="dependencia_id"
                value={formData.dependencia_id}
                onChange={handleChange}
                className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="">Seleccionar dependencia</option>

                {dependencias?.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.nombre}
                  </option>
                ))}
              </select>

              {errors.dependencia_id && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.dependencia_id}
                </p>
              )}
            </div>
          )}

          {/* Botón crear */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-medium transition-all ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Creando período..." : "Crear período de licencia"}
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
                Período de licencia creado con éxito
              </h2>

              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={resetForm}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-all"
                >
                  Crear otro
                </button>

                <BackButton to={-1} tooltip="Volver" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
