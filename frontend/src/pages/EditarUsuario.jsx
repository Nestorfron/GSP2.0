import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Save, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { putData } from "../utils/api";
import Navbar from "../components/BottomNavbar";
import { useAppContext } from "../context/AppContext";
import { estaTokenExpirado } from "../utils/tokenUtils";
import BackButton from "../components/BackButton";

export default function EditarUsuario() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    jefaturas,
    funciones,
    grados,
    token,
    recargarUsuarios,
    recargarDependencias,
  } = useAppContext();

  const usuario = location.state?.usuario;

  const dependencias =
    jefaturas?.flatMap(
      (j) => j.zonas?.flatMap((z) => z.dependencias || []) || []
    ) || [];

  /* =========================
     ESTADO FORMULARIO
  ========================= */
  const [formData, setFormData] = useState(() => ({
    ...usuario,
  }));

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =========================
     TOKEN
  ========================= */
  useEffect(() => {
    if (!token || estaTokenExpirado(token)) navigate("/login");
  }, [token]);

  /* =========================
     TURNOS FILTRADOS
  ========================= */
  const turnosFiltrados = useMemo(() => {
    const dep = dependencias.find(
      (d) => d.id === Number(formData?.dependencia_id)
    );
    return dep?.turnos || [];
  }, [formData?.dependencia_id, dependencias]);

  /* =========================
     CHANGE
  ========================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await putData(`usuarios/${formData.id}`, formData, token);
      setSuccess(true);
      recargarUsuarios();
      recargarDependencias();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-blue-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none";

  if (!formData) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
      
      <div className="flex-grow w-full px-3 sm:px-6 py-6 sm:py-10 mx-auto max-w-xl md:max-w-2xl lg:max-w-3xl">
        
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 space-y-4"
        >
          {/* HEADER */}
          <div className="flex justify-center items-center gap-2">
            <Save size={26} className="text-blue-600" />
            <h1 className="text-lg sm:text-xl font-semibold text-blue-800 dark:text-blue-200">
              Editar usuario
            </h1>
          </div>

          {/* NOMBRE */}
          <input
            name="nombre"
            value={formData.nombre || ""}
            onChange={handleChange}
            className={inputClass}
            placeholder="Nombre"
          />

          {/* CORREO */}
          <input
            name="correo"
            value={formData.correo || ""}
            onChange={handleChange}
            className={inputClass}
            placeholder="Correo"
          />

          {/* GRADO */}
          <select
            name="grado"
            value={formData.grado || ""}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Grado</option>
            {grados.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>

          {/* DEPENDENCIA */}
          <select
            name="dependencia_id"
            value={formData.dependencia_id || ""}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Dependencia</option>
            {dependencias.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>

          {/* TURNO */}
          <select
            name="turno_id"
            value={formData.turno_id || ""}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Turno</option>
            {turnosFiltrados.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>

          {/* FUNCION */}
          <select
            name="funcion_id"
            value={formData.funcion_id || ""}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Función</option>
            {funciones.map((f) => (
              <option key={f.id} value={f.id}>
                {f.descripcion}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="medio_horario"
              checked={formData.medio_horario || false}
              onChange={handleChange}
            />
            Medio horario
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_admin"
              checked={formData.is_admin || false}
              onChange={handleChange}
            />
            Administrador
          </label>

          {/* BOTON */}
          <button className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition">
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>

        <BackButton to={-1} />
      </div>

      <Navbar />

      {/* MODAL SUCCESS */}
      <AnimatePresence>
        {success && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white dark:bg-slate-900 p-8 rounded-2xl text-center shadow-lg"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
            >
              <CheckCircle2 className="mx-auto text-green-500 mb-3" size={50} />
              <p className="font-semibold">Usuario actualizado</p>
              < BackButton to={-1} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
