import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { putData } from "../utils/api";
import Navbar from "../components/BottomNavbar";
import { estaTokenExpirado } from "../utils/tokenUtils";
import { useAppContext } from "../context/AppContext";
import BackButton from "../components/BackButton";

export default function EditarTurno() {

  const navigate = useNavigate();
  const location = useLocation();

  const turno = location.state?.turno;
  

  const { token, regimenes, dependencias, recargarTurnos } = useAppContext();

  const [formData, setFormData] = useState({
    nombre: "",
    hora_inicio: "",
    hora_fin: "",
    descripcion: "",
    dependencia_id: "",
    regimen_id: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* =====================
     CARGAR DATOS DEL TURNO
  ===================== */
  useEffect(() => {

    // Si alguien refresca la página, volvemos
    if (!turno) {
      navigate(-1);
      return;
    }

    setFormData({
      nombre: turno.nombre || "",
      hora_inicio: turno.hora_inicio?.slice(0, 5) || "",
      hora_fin: turno.hora_fin?.slice(0, 5) || "",
      descripcion: turno.descripcion || "",
      dependencia_id: turno.dependencia_id || "",
      regimen_id: turno.regimen_id || "",
    });

  }, [turno, navigate]);

  /* =====================
     VALIDACIÓN
  ===================== */
  const validate = (name, value) => {

    let message = "";

    if (!value?.toString().trim() && name !== "descripcion") {
      message = "Campo obligatorio";
    }

    setErrors(prev => ({ ...prev, [name]: message }));
  };

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    validate(name, value);
  };

  /* =====================
     SUBMIT
  ===================== */
  const handleSubmit = async (e) => {

    e.preventDefault();

    const hasErrors = Object.values(errors).some(e => e);
    if (hasErrors) return alert("Corrige los errores");

    setLoading(true);

    try {

      await putData(`turnos/${turno.id}`, formData, token);
      



      recargarTurnos();
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
          className="w-full bg-white dark:bg-slate-900 rounded-2xl p-6 space-y-4"
        >

          <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-200 text-center">
            Editar Turno
          </h1>

          {/* INPUTS */}
          {[
            { name: "nombre", placeholder: "Nombre del turno" },
            { name: "hora_inicio", type: "time" },
            { name: "hora_fin", type: "time" },
            { name: "descripcion", placeholder: "Descripción (opcional)" },
          ].map(({ name, placeholder, type = "text" }) => (

            <div key={name}>
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={formData[name]}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 bg-transparent outline-none focus:ring-2 ${
                  errors[name]
                    ? "border-red-400 focus:ring-red-400"
                    : "border-blue-200 dark:border-slate-700 focus:ring-blue-400"
                }`}
              />

              {errors[name] && (
                <p className="text-xs text-red-500 mt-1">
                  {errors[name]}
                </p>
              )}
            </div>

          ))}

          {/* DEPENDENCIA */}
          <select
            name="dependencia_id"
            value={formData.dependencia_id}
            onChange={handleChange}
            className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option value="">Seleccionar dependencia</option>

            {dependencias?.map(dep => (
              <option key={dep.id} value={dep.id}>
                {dep.nombre}
              </option>
            ))}
          </select>

          {/* RÉGIMEN */}
          <select
            name="regimen_id"
            value={formData.regimen_id}
            onChange={handleChange}
            className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option value="">Seleccionar régimen</option>

            {regimenes?.map(r => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>

          {/* BOTÓN */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-medium ${
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
                Turno actualizado
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
