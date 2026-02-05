import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { CheckCircle2, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/BottomNavbar";
import { useAppContext } from "../context/AppContext";
import { estaTokenExpirado } from "../utils/tokenUtils";
import BackButton from "../components/BackButton";
import { putData } from "../utils/api";

export default function EditarZona() {
    const { token, recargarDatos, jefaturas } = useAppContext();
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        jefatura_id: "",
    });

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);

    /* 🔹 Buscar zona en contexto */
    const buscarZona = () => {
        for (const j of jefaturas) {
            const zona = j.zonas?.find((z) => z.id === Number(id));
            if (zona) return zona;
        }
        return null;
    };

    useEffect(() => {
        if (!token || estaTokenExpirado(token)) {
            navigate("/login");
            return;
        }

        const zona =
            location.state?.zona ||
            buscarZona();

        if (!zona) {
            alert("Zona no encontrada");
            navigate(-1);
            return;
        }

        setFormData({
            nombre: zona.nombre,
            descripcion: zona.descripcion || "",
            jefatura_id: zona.jefatura_id,
        });

        setLoading(false);
    }, [id]);

    /* 🔹 Handlers */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await putData(`zonas/${id}`, formData, token);
            recargarDatos();
            setSuccess(true);
        } catch (err) {
            alert("Error al actualizar la zona");
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Cargando zona...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
            <div className="flex-grow flex flex-col items-center p-6 pb-24 w-full lg:w-3/4 xl:max-w-4xl mx-auto">
                <div className="flex flex-col w-full bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 space-y-4 mb-2">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full space-y-4 mb-2"
                    >
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Edit className="text-blue-600 dark:text-blue-300" size={26} />
                            <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-200">
                                Editar zona
                            </h1>
                        </div>

                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none"
                        />

                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            placeholder="Descripción"
                            className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-400 outline-none resize-none"
                        />

                        <button
                            type="submit"
                            className="w-full py-2 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 transition-all"
                        >
                            Guardar cambios
                        </button>
                    </form>
                    <BackButton to={-1} tooltip="Volver" />

                </div>


            </div>

            <Navbar />

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
                            <h2 className="text-lg font-semibold">
                                Zona actualizada
                            </h2>
                            <button
                                onClick={() => navigate(-1)}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                            >
                                Volver
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
