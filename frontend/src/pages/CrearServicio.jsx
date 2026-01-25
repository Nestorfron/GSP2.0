import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Wrench, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { postData } from "../utils/api";
import Navbar from "../components/BottomNavbar";
import { estaTokenExpirado } from "../utils/tokenUtils";
import { useAppContext } from "../context/AppContext";
import BackButton from "../components/BackButton";

export default function CrearServicio() {
  const vehiculoId = useLocation().state?.vehiculoId;
  const navigate = useNavigate();
  const { token, recargarServicios, vehiculos } = useAppContext();

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    fecha: "",
    vehiculo_id: vehiculoId || "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ================= VALIDACIÓN ================= */
  const validate = (name, value) => {
    let message = "";
    if (!value.trim()) {
      message = "Campo obligatorio";
    }
    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasErrors = Object.values(errors).some((e) => e);
    if (hasErrors) return alert("Corrige los errores antes de enviar");

    setLoading(true);
    try {
      const payload = {
        ...formData,
        vehiculo_id: vehiculoId || formData.vehiculo_id,
      };

      const data = await postData("servicios", payload, token);
      if (data) setSuccess(true);
      recargarServicios();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      fecha: "",
      vehiculo_id: vehiculoId || "",
    });
    setErrors({});
    setSuccess(false);
  };

  /* ================= AUTH ================= */
  useEffect(() => {
    if (!token || estaTokenExpirado(token)) {
      navigate("/login");
    }
  }, [token, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="flex flex-col items-center m-4 py-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg flex-grow p-6 w-full lg:w-1/2 xl:max-w-3xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white dark:bg-slate-900 rounded-2xl mb-2 p-6 space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wrench className="text-blue-600 dark:text-blue-300" size={28} />
            <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-200">
              Agregar servicio
            </h1>
          </div>
          {/* Tipo de servicio */}
          <div>
            <select
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 bg-transparent outline-none focus:ring-2 transition-all ${
                errors.nombre
                  ? "border-red-400 focus:ring-red-400"
                  : "border-blue-200 dark:border-slate-700 focus:ring-blue-400"
              }`}
            >
              <option value="">Seleccionar tipo de servicio</option>
              <option value="SERVICE">SERVICE</option>
              <option value="REPARACIÓN">REPARACIÓN</option>
              <option value="OTRO">OTRO</option>
            </select>

            {errors.nombre && (
              <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>
            )}
          </div>

          {[
            { name: "descripcion", placeholder: "kilometraje, etc" },
            { name: "fecha", placeholder: "Fecha", type: "date" },
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
              {errors[name] && (
                <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
              )}
            </div>
          ))}

          {/* Vehículo solo si no viene por state */}
          {!vehiculoId && (
            <select
              name="vehiculo_id"
              value={formData.vehiculo_id}
              onChange={handleChange}
              className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Seleccionar vehículo</option>
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.matricula} - {v.marca} {v.modelo}
                </option>
              ))}
            </select>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-medium transition-all ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Guardando servicio..." : "Guardar servicio"}
          </button>
        </form>

        <BackButton to={-1} tooltip="Volver" />
      </div>

      <Navbar />

      {/* MODAL ÉXITO */}
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
                Servicio agregado correctamente
              </h2>
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={resetForm}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-all"
                >
                  Agregar otro
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
