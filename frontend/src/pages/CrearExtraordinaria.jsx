import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { postData } from "../utils/api";
import Navbar from "../components/BottomNavbar";
import { estaTokenExpirado } from "../utils/tokenUtils";
import { useAppContext } from "../context/AppContext";
import BackButton from "../components/BackButton";
import dayjs from "dayjs";

export default function CrearGuardia() {
  const { usuario, dependencias, token, recargarDatos } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  //Mi dependencia

  const miDependencia = dependencias.find((dep) =>
    dep.usuarios?.some(
      (u) => u.id === usuario.id && u.rol_jerarquico === "JEFE_DEPENDENCIA"
    )
  );

  //Funcionarios de mi dependencia
  const dependenciaUsuarios = miDependencia?.usuarios
    .filter((u) => u.rol_jerarquico !== "JEFE_DEPENDENCIA")
    .sort((a, b) => {
      
      const gradoA = Number(a.grado) || 0;
      const gradoB = Number(b.grado) || 0;

      if (gradoA !== gradoB) {
        return gradoB - gradoA;
      }
      const fechaA = new Date(a.fecha_ingreso);
      const fechaB = new Date(b.fecha_ingreso);

      return fechaA - fechaB;
    });


  const getNowForInput = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    usuario_id: "",
    fecha_inicio: getNowForInput(),
    fecha_fin: getNowForInput(),
    tipo: "",
    comentario: "",
  });

  const [errors, setErrors] = useState({});

  const validate = (name, value) => {
    let message = "";
    if (!value.trim()) message = "Campo obligatorio";
    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasErrors = Object.values(errors).some((e) => e);
    if (hasErrors) return alert("Corrige los errores antes de enviar");
  
    setLoading(true);
  
    try {
      const token = localStorage.getItem("token");
  
      const body = {
        ...formData,
        fecha_inicio: dayjs(formData.fecha_inicio).format("YYYY-MM-DD HH:mm"),
        fecha_fin: dayjs(formData.fecha_fin).format("YYYY-MM-DD HH:mm"),
      };
  
      // Crear guardia
      const data = await postData("guardias", body, token);
  
      // Crear notificación en backend (el backend se encarga de enviar push)
      const mensaje = `Se le ha asignado ${formData.tipo} para el día ${dayjs(formData.fecha_inicio).format("DD/MM/YYYY")} hora ${dayjs(formData.fecha_inicio).format("HH:mm")}`;
      const data1 = await postData("notificaciones", {
        usuario_id: Number(formData.usuario_id),
        fecha: dayjs(formData.fecha_inicio).format("YYYY-MM-DD HH:mm"),
        mensaje,
      }, token);
  
      if (data && data1) setSuccess(true);
      recargarDatos();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  
  

  const resetForm = () => {
    setFormData({
      usuario_id: "",
      fecha_inicio: getNowForInput(),
      fecha_fin: getNowForInput(),
      tipo: "",
      comentario: "",
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl flex-grow flex flex-col items-center mx-4 mt-8 mb-24 pb-8 shadow-lg">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-4 p-4"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <PlusCircle
              className="text-blue-600 dark:text-blue-300"
              size={28}
            />
            <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-200">
              Asignar Extraordinaria
            </h1>
          </div>

          {/* Usuario */}
          <div>
            <label className="text-sm text-blue-800 dark:text-blue-300 font-medium">
              Funcionario
            </label>
            <select
              name="usuario_id"
              value={formData.usuario_id || ""}
              onChange={handleChange}
              className={`w-full mt-1 border rounded-lg px-3 py-2 bg-transparent outline-none focus:ring-2 ${
                errors.usuario_id
                  ? "border-red-400 focus:ring-red-400"
                  : "border-blue-200 dark:border-slate-700 focus:ring-blue-400"
              }`}
              required
            >
              <option value="">Selecciona un funcionario</option>
              {dependenciaUsuarios?.map((u) => (
                <option key={u.id} value={u.id} className="text-sm">
                  G{u.grado + " " + u.nombre}
                </option>
              ))}
            </select>
            {errors.usuario_id && (
              <p className="text-xs text-red-500 mt-1">{errors.usuario_id}</p>
            )}
          </div>

          {/* Fecha inicio */}
          <div>
            <label className="text-sm text-blue-800 dark:text-blue-300 font-medium">
              Inicio de guardia
            </label>
            <input
              type="datetime-local"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
              required
              className={`w-full mt-1 border rounded-lg px-3 py-2 bg-transparent outline-none focus:ring-2 ${
                errors.fecha_inicio
                  ? "border-red-400 focus:ring-red-400"
                  : "border-blue-200 dark:border-slate-700 focus:ring-blue-400"
              }`}
            />
          </div>

          {/* Fecha fin */}
          <div>
            <label className="text-sm text-blue-800 dark:text-blue-300 font-medium">
              Fin de guardia
            </label>
            <input
              type="datetime-local"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={handleChange}
              required
              className={`w-full mt-1 border rounded-lg px-3 py-2 bg-transparent outline-none focus:ring-2 ${
                errors.fecha_fin
                  ? "border-red-400 focus:ring-red-400"
                  : "border-blue-200 dark:border-slate-700 focus:ring-blue-400"
              }`}
            />
          </div>
          {/* Tipo */}
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
            className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option value="">Seleccionar tipo</option>
            <option value="extraordinaria">Extraordinaria</option>
            <option value="curso">Curso</option>
          </select>

          {/* Comentario */}
          <textarea
            name="comentario"
            placeholder="Comentario (opcional)"
            value={formData.comentario}
            onChange={handleChange}
            className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none resize-none"
          />

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-medium transition-all ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Creando guardia..." : "Crear guardia"}
          </button>

        </form>
        
          {/* Botón volver */}
          <BackButton to={-1} tooltip="Volver" />
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
                Guardia creada con éxito
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                La guardia fue registrada correctamente.
              </p>

              <div className="flex flex-col gap-3 mt-4">
                <button
                  onClick={resetForm}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-all"
                >
                  Crear otra
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
