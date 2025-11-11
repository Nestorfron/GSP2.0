import React, { useState } from "react";
import dayjs from "dayjs";
import { postData, deleteData } from "../utils/api";
import { useAppContext } from "../context/AppContext";

export default function ModalAgregarLicencia({
  usuario,
  dia,
  onCerrar,
  recargarLicencias,
  token,
}) {
  // Aseguramos que dia sea startOf('day')
  const diaInicial = dia.startOf("day");
  const { guardias } = useAppContext();

  const [tipo, setTipo] = useState("reglamentaria");
  const [fechaInicio, setFechaInicio] = useState(
    diaInicial.format("YYYY-MM-DD")
  );
  const [fechaFin, setFechaFin] = useState(diaInicial.format("YYYY-MM-DD"));
  const [motivo, setMotivo] = useState("");
  const [estado, setEstado] = useState("aprobado");

  const handleSubmit = async () => {
    if (!token) return;

    if (!fechaInicio || !fechaFin || !tipo) {
      alert("Completa todos los campos.");
      return;
    }

    try {
      // Convertimos fechas a UTC startOf('day')
      const inicioUTC = dayjs(fechaInicio).utc().startOf("day");
      const finUTC = dayjs(fechaFin).utc().startOf("day");

      // Generar array de días de la licencia
      const diasLicencia = [];
      let diaActual = inicioUTC.clone();
      while (diaActual.isSameOrBefore(finUTC, "day")) {
        diasLicencia.push(diaActual.clone());
        diaActual = diaActual.add(1, "day");
      }

      // Eliminar solo guardias existentes (tipo distinto a licencias) en esos días para este usuario
      for (const dia of diasLicencia) {
        const guardiaExistente = guardias.find(
          (g) =>
            g.usuario_id === usuario.id &&
            g.tipo !== "licencia" &&
            g.tipo !== "licencia_medica" &&
            dayjs(g.fecha_inicio).utc().startOf("day").isSame(dia, "day")
        );

        if (guardiaExistente) {
          await deleteData(`guardias/${guardiaExistente.id}`, token);
        }
      }

      // Crear la licencia
      await postData(
        "/licencias",
        {
          usuario_id: usuario.id,
          fecha_inicio: inicioUTC.toISOString(),
          fecha_fin: finUTC.toISOString(),
          tipo,
          motivo,
          estado,
        },
        token,
        { "Content-Type": "application/json" }
      );

      recargarLicencias();
      onCerrar();
    } catch (error) {
      console.error("Error creando licencia:", error);
      alert("No se pudo crear la licencia.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-6 w-full sm:w-96 shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Tipo de licencia */}
        <div className="mb-3">
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200 text-sm sm:text-base">
            Tipo de licencia
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full border rounded px-2 py-1 dark:bg-slate-700 dark:text-gray-200 text-sm sm:text-base"
          >
            <option value="reglamentaria">Reglamentaria</option>
            <option value="extraordinaria">Extraordinaria</option>
            <option value="compensacion">Compensación Horas</option>
            <option value="medica">Médica</option>
          </select>
        </div>

        {/* Fechas */}
        <div className="mb-3 flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200 text-sm sm:text-base">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full border rounded px-2 py-1 dark:bg-slate-700 dark:text-gray-200 text-sm sm:text-base"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200 text-sm sm:text-base">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full border rounded px-2 py-1 dark:bg-slate-700 dark:text-gray-200 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Motivo */}
        <div className="mb-3">
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200 text-sm sm:text-base">
            Motivo
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full border rounded px-2 py-1 dark:bg-slate-700 dark:text-gray-200 text-sm sm:text-base"
            rows={3}
          />
        </div>

        {/* Estado */}
        <div className="mb-3">
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200 text-sm sm:text-base">
            Estado
          </label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full border rounded px-2 py-1 dark:bg-slate-700 dark:text-gray-200 text-sm sm:text-base"
          >
            <option value="">Seleccionar estado</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
          </select>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
          <button
            onClick={onCerrar}
            className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm sm:text-base"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm sm:text-base"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
