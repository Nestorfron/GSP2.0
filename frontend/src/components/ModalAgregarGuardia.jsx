import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ModalAgregarGuardia({
  selectorTipo,
  setSelectorTipo,
  onConfirmar,
}) {
  if (!selectorTipo) return null;

  const { usuario, dia } = selectorTipo;

  const tipos = [
    "D",
    "T",
    "1ro",
    "2do",
    "3er",
    "Curso",
    "BROU",
    "Custodia",
    "T-1",
    "T-2",
  ];

  const handleClickTipo = async (tipo) => {
    if (!usuario || !dia) return;

    // Aseguramos que la fecha sea exacta sin desfases
    const diaSeleccionado = dia.clone().startOf("day");

    await onConfirmar({
      usuario,
      dia: diaSeleccionado,
      tipo,
      comentario: "",
    });

    setSelectorTipo(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-4 sm:p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <h2 className="text-lg font-semibold text-center text-blue-800 dark:text-blue-300 mb-4">
            Seleccionar tipo de guardia
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {tipos.map((tipo) => {
              const baseClass = `w-full font-medium py-2 px-4 rounded transition text-sm`;
              const colorClass =
                tipo === "D"
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-100"
                  : tipo === "Curso" || tipo === "Custodia"
                  ? "bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  : tipo === "BROU"
                  ? "bg-white hover:bg-gray-100 text-black dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700"
                  : tipo === "T-1"
                  ? "bg-violet-300 hover:bg-violet-400 text-violet-900 font-semibold dark:bg-violet-500 dark:hover:bg-violet-600 dark:text-white"
                  : tipo === "T-2"
                  ? "bg-violet-700 hover:bg-violet-800 text-white font-semibold dark:bg-violet-900 dark:hover:bg-violet-950"
                  : "bg-blue-100 hover:bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100";

              return (
                <button
                  key={tipo}
                  onClick={() => handleClickTipo(tipo)}
                  className={`${baseClass} ${colorClass}`}
                >
                  {tipo === "D" ? "Descanso (D)" : tipo}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setSelectorTipo(null)}
              className="px-3 py-1 rounded-lg bg-gray-300 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-slate-600 transition text-sm"
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
