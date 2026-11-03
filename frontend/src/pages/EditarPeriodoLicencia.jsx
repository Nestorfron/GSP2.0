import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { putData } from "../utils/api";
import Navbar from "../components/BottomNavbar";
import { estaTokenExpirado } from "../utils/tokenUtils";
import { useAppContext } from "../context/AppContext";
import BackButton from "../components/BackButton";

export default function EditarPeriodoLicencia() {
  const navigate = useNavigate();
  const location = useLocation();

  console.log(location.state.periodo)

  const periodo = location.state?.periodo;

  const { token, dependencias, recargarPeriodosLicencia } = useAppContext();

  const [formData, setFormData] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    dependencia_id: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* =====================
     CARGAR DATOS DEL PERÍODO
  ===================== */
  useEffect(() => {
    if (!periodo) {
      navigate(-1);
      return;
    }
  
    setFormData({
      fecha_inicio: formatearFecha(periodo.fecha_inicio),
      fecha_fin: formatearFecha(periodo.fecha_fin),
      dependencia_id: periodo.dependencia_id || "",
    });
  }, [periodo, navigate]);

  /* =====================
     VALIDACIÓN
  ===================== */
  const validate = (name, value, datos = formData) => {
    let message = "";

    if (!value && name !== "dependencia_id") {
      message = "Campo obligatorio";
    }

    if (
      name === "fecha_fin" &&
      value &&
      datos.fecha_inicio &&
      value <= datos.fecha_inicio
    ) {
      message = "La fecha de fin debe ser posterior a la fecha de inicio";
    }

    if (
      name === "fecha_inicio" &&
      value &&
      datos.fecha_fin &&
      datos.fecha_fin <= value
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

    const nuevosDatos = {
      ...formData,
      [name]: value,
    };

    setFormData(nuevosDatos);
    validate(name, value, nuevosDatos);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
  
    return new Date(fecha).toISOString().slice(0, 10);
  };

  /* =====================
     GUARDAR CAMBIOS
  ===================== */
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

    if (!formData.dependencia_id) {
      nuevosErrores.dependencia_id = "Seleccioná una dependencia";
    }

    setErrors(nuevosErrores);

    if (Object.values(nuevosErrores).some(Boolean)) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fecha_inicio: `${formData.fecha_inicio}:00`,
        fecha_fin: `${formData.fecha_fin}:00`,
        dependencia_id: formData.dependencia_id,
      };

      await putData(
        `periodos_licencia/${periodo.id}`,
        payload,
        token
      );

      await recargarPeriodosLicencia();

      setSuccess(true);
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     VALIDAR TOKEN
  ===================== */
  useEffect(() => {
    if (!token || estaTokenExpirado(token)) {
      navigate("/login");
    }
  }, [token, navigate]);

  /* =====================
     UI
  ===================== */
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">

      <div className="flex flex-col items-center m-4 py-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg flex-grow p-4 pb-24 w-full lg:w-3/4 xl:max-w-4xl mx-auto">

        <form
          onSubmit={handleSubmit}
          className="w-full bg-white dark:bg-slate-900 rounded-2xl mb-2 p-6 space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <CalendarDays
              className="text-blue-600 dark:text-blue-300"
              size={28}
            />

            <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-200">
              Editar período de licencia
            </h1>
          </div>

          {/* FECHA DE INICIO */}
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
              <p className="text-xs text-red-500 mt-1">
                {errors.fecha_inicio}
              </p>
            )}
          </div>

          {/* FECHA DE FIN */}
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
              <p className="text-xs text-red-500 mt-1">
                {errors.fecha_fin}
              </p>
            )}
          </div>

          {/* DEPENDENCIA */}
          <div>
            <label className="block text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
              Dependencia
            </label>

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

          {/* BOTÓN GUARDAR */}
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

      {/* MODAL DE ÉXITO */}
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
                Período de licencia actualizado
              </h2>

              <div className="flex justify-center mt-6">
                <BackButton to={-1} tooltip="Volver" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}