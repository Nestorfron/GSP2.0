import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { postData } from "../utils/api";
import Navbar from "../components/BottomNavbar";
import { useAppContext } from "../context/AppContext";
import { estaTokenExpirado } from "../utils/tokenUtils";
import dayjs from "dayjs";
import BackButton from "../components/BackButton";

export default function CrearUsuario() {
  const navigate = useNavigate();
  const { jefaturas, token, funciones, recargarUsuarios, grados } = useAppContext();

  const dependencias =
    jefaturas?.flatMap((jefatura) =>
      jefatura.zonas?.flatMap((zona) => zona.dependencias || []) || []
    ) || [];

  const [formData, setFormData] = useState({
    grado: "",
    nombre: "",
    correo: "",
    password: "",
    rol_jerarquico: "",
    fecha_ingreso: dayjs().format("YYYY-MM-DD"),
    dependencia_id: "",
    turno_id: "",
    funcion_id: "",
    estado: "Activo",
    is_admin: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ✅ Filtrar turnos por dependencia seleccionada
  const turnosFiltrados = useMemo(() => {
    const depSeleccionada = dependencias.find(
      (dep) => dep.id === Number(formData.dependencia_id)
    );
    return depSeleccionada?.turnos || [];
  }, [formData.dependencia_id, dependencias]);

  const validate = (name, value) => {
    let message = "";
    switch (name) {
      case "correo":
        if (!/\S+@\S+\.\S+/.test(value)) message = "Correo inválido";
        break;
      case "password":
        if (value.length < 6) message = "Debe tener al menos 6 caracteres";
        break;
      case "nombre":
        if (value.trim().length < 3) message = "Debe tener al menos 3 letras";
        break;
      default:
        if (!value.trim() && name !== "fecha_ingreso") message = "Campo obligatorio";
    }
    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "dependencia_id" ? { turno_id: "" } : {}), 
    }));
    validate(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasErrors = Object.values(errors).some((e) => e);
    if (hasErrors) return alert("Corrige los errores antes de enviar");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        dependencia_id: formData.dependencia_id || null,
        turno_id: formData.turno_id || null,
        fecha_ingreso: formData.fecha_ingreso || null,
      };

      const data = await postData("usuarios", payload, token);
      if (data) setSuccess(true);
      recargarUsuarios();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      grado: "",
      nombre: "",
      correo: "",
      password: "",
      rol_jerarquico: "",
      fecha_ingreso: dayjs().format("YYYY-MM-DD"),
      dependencia_id: "",
      turno_id: "",
      funcion_id: "",
      estado: "Activo",
      is_admin: false,
    });
    setErrors({});
    setSuccess(false);
  };

  useEffect(() => {
    if (!token || estaTokenExpirado(token)) navigate("/login");
  }, [token, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="flex-grow flex flex-col items-center p-4 pb-24 flex-grow flex flex-col items-center p-4 pb-24 dark:bg-slate-900  p-6 w-full lg:w-1/2 xl:max-w-3xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="w-full  bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <PlusCircle className="text-blue-600 dark:text-blue-300" size={28} />
            <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-200">
              Crear nuevo usuario
            </h1>
          </div>

          {/* Inputs principales */}
          {[
            { name: "nombre", placeholder: "Nombre completo" },
            { name: "correo", placeholder: "Correo electrónico", type: "email" },
            { name: "password", placeholder: "Contraseña", type: "password" },
          ].map(({ name, placeholder, type = "text" }) => (
            <div key={name}>
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={formData[name]}
                onChange={handleChange}
                required
                className={`w-full border rounded-lg px-3 py-2 bg-transparent outline-none focus:ring-2 transition-all ${
                  errors[name]
                    ? "border-red-400 focus:ring-red-400"
                    : "border-blue-200 dark:border-slate-700 focus:ring-blue-400"
                }`}
              />
              {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
            </div>
          ))}
          {/* Grado */}
          <div>
            <select
              name="grado"
              value={formData.grado || ""}
              onChange={handleChange}
              className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Seleccionar grado</option>
              {grados.map((grado) => (
                <option key={grado} value={grado}>
                  {grado}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha ingreso */}
          <input
            type="date"
            name="fecha_ingreso"
            value={formData.fecha_ingreso}
            onChange={handleChange}
            className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
          />

          {/* Select Rol */}
          <select
            name="rol_jerarquico"
            value={formData.rol_jerarquico}
            onChange={handleChange}
            required
            className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option value="">Seleccionar rol</option>
            <option value="ADMINISTRADOR">Administrador</option>
            <option value="JEFE_ZONA">Jefe de Zona</option>
            <option value="JEFE_DEPENDENCIA">Jefe de Dependencia</option>
            <option value="FUNCIONARIO">Funcionario</option>
          </select>

          {/* Select Dependencia */}
          <select
            name="dependencia_id"
            value={formData.dependencia_id}
            onChange={handleChange}
            className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option value="">Seleccionar dependencia (opcional)</option>
            {dependencias.map((dep) => (
              <option key={dep.id} value={dep.id}>
                {dep.nombre}
              </option>
            ))}
          </select>

          {/* 🔹 Select Turno filtrado por dependencia */}
          <select
            name="turno_id"
            value={formData.turno_id}
            onChange={handleChange}
            disabled={!formData.dependencia_id || turnosFiltrados.length === 0}
            className={`w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none ${
              !formData.dependencia_id ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <option value="">
              {turnosFiltrados.length > 0
                ? "Seleccionar turno (opcional)"
                : "Sin turnos disponibles"}
            </option>
            {turnosFiltrados.map((turno) => (
              <option key={turno.id} value={turno.id}>
                {turno.nombre}
              </option>
            ))}
          </select>

          {/* Select Funcion */}
          <select
            name="funcion_id"
            value={formData.funcion_id}
            onChange={handleChange}
            className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option value="">Seleccionar función (opcional)</option>
            {funciones.map((funcion) => (
              <option key={funcion.id} value={funcion.id}>
                {funcion.descripcion}
              </option>
            ))}
          </select>

          {/* Checkbox admin */}
          <label className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300 mt-2">
            <input
              type="checkbox"
              name="is_admin"
              checked={formData.is_admin}
              onChange={handleChange}
              className="accent-blue-600"
            />
            ¿Es administrador?
          </label>

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
            {loading ? "Creando usuario..." : "Crear usuario"}
          </button>

          <BackButton to={-1} tooltip="Volver" />
        </form>
      </div>

      <Navbar />

      {/* Modal éxito */}
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
                Usuario creado con éxito
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
