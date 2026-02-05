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

  const {
    jefaturas,
    funciones,
    regimenes,
    grados,
    token,
    recargarJefaturas,
    recargarDependencias,
  } = useAppContext();

  const dependencias =
    jefaturas?.flatMap((j) =>
      j.zonas?.flatMap((z) => z.dependencias || []) || []
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
    estado: "ACTIVO",
    is_admin: false,
  });

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const turnosFiltrados = useMemo(() => {
    const dep = dependencias.find(
      (d) => d.id === Number(formData.dependencia_id)
    );
    return dep?.turnos || [];
  }, [formData.dependencia_id, dependencias]);

  useEffect(() => {
    if (!token || estaTokenExpirado(token)) navigate("/login");
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "dependencia_id" ? { turno_id: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      await postData("usuarios", formData, token);
      setSuccess(true);
      recargarJefaturas();
      recargarDependencias();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-blue-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none text-sm sm:text-base";

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="flex-grow w-full px-3 sm:px-6 py-6 sm:py-10 mx-auto max-w-xl md:max-w-2xl lg:max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 space-y-4"
        >
          <div className="flex justify-center items-center gap-2 mb-3">
            <PlusCircle size={26} className="text-blue-600" />
            <h1 className="text-lg sm:text-xl font-semibold text-blue-800 dark:text-blue-200">
              Crear usuario
            </h1>
          </div>

          <input
            name="nombre"
            placeholder="Nombre completo"
            value={formData.nombre}
            onChange={handleChange}
            className={inputClass}
          />

          <input
            type="email"
            name="correo"
            placeholder="Correo"
            value={formData.correo}
            onChange={handleChange}
            className={inputClass}
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            className={inputClass}
          />

          <select
            name="grado"
            value={formData.grado}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Seleccionar grado</option>
            {grados.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>

          <input
            type="date"
            name="fecha_ingreso"
            value={formData.fecha_ingreso}
            onChange={handleChange}
            className={inputClass}
          />

          <select
            name="rol_jerarquico"
            value={formData.rol_jerarquico}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Rol jerárquico</option>
            <option value="ADMINISTRADOR">Administrador</option>
            <option value="JEFE_ZONA">Jefe Zona</option>
            <option value="JEFE_DEPENDENCIA">Jefe Dependencia</option>
            <option value="FUNCIONARIO">Funcionario</option>
          </select>

          <select
            name="dependencia_id"
            value={formData.dependencia_id}
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

          <select
            name="turno_id"
            value={formData.turno_id}
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

          <select
            name="funcion_id"
            value={formData.funcion_id}
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
              name="is_admin"
              checked={formData.is_admin}
              onChange={handleChange}
            />
            Administrador
          </label>

          <button
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {loading ? "Creando..." : "Crear usuario"}
          </button>

        </form>
        <BackButton to={-1} />

      </div>

      <Navbar />

      <AnimatePresence>
        {success && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <motion.div className="bg-white dark:bg-slate-900 p-8 rounded-2xl text-center shadow-lg">
              <CheckCircle2 className="mx-auto text-green-500 mb-3" size={50} />
              <p className="font-semibold">Usuario creado correctamente</p>
              <BackButton to={-1} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
