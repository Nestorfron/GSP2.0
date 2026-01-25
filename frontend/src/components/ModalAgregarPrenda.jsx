import React, { useState, useEffect } from "react";
import { postData, putData } from "../utils/api";
import { useAppContext } from "../context/AppContext";

export default function ModalAgregarPrenda({
  usuario,
  prenda = null,
  onCerrar,
  onPrendaGuardada,
}) {
  const [nombre, setNombre] = useState("");
  const [talle, setTalle] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const { recargarPrendas, token } = useAppContext();
  const esBotas = nombre === "Botas";

  const esEdicion = Boolean(prenda);

  const TALLES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  useEffect(() => {
    if (prenda) {
      setNombre(prenda.nombre || "");
      setTalle(prenda.talle || "");
      setDescripcion(prenda.descripcion || "");
    }
  }, [prenda]);

  const handleSubmit = async () => {
    if (!nombre || !talle) {
      alert("Completa los campos obligatorios.");
      return;
    }

    try {
      const payload = {
        nombre,
        talle,
        descripcion,
        usuario_id: usuario.id,
      };

      const data = esEdicion
        ? await putData(`/prendas/${prenda.id}`, payload, token)
        : await postData("/prendas", payload, token);

      onPrendaGuardada?.(data);
      recargarPrendas();
      onCerrar();
    } catch (error) {
      alert("No se pudo guardar la prenda.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4 text-blue-700 dark:text-blue-400">
          {esEdicion ? "Editar prenda" : "Agregar prenda"}
        </h2>

        {/* Prenda */}
        <select
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full mb-3 border rounded px-2 py-1 dark:bg-slate-700"
        >
          <option value="">Seleccionar prenda</option>
          <option value="Camisa manga larga">Camisa manga larga</option>
          <option value="Camisa manga corta">Camisa manga corta</option>
          <option value="Pantalón">Pantalón</option>
          <option value="Buzo">Buzo</option>
          <option value="Campera">Campera</option>
          <option value="Kepi">Kepi</option>
          <option value="Botas">Botas</option>
          <option value="Chaleco balístico">Chaleco balístico</option>
        </select>

        {/* Talle */}
        {esBotas ? (
          <input
            type="text"
            value={talle}
            onChange={(e) => setTalle(e.target.value)}
            placeholder="Ingrese talle de calzado"
            className="w-full mb-3 border rounded px-2 py-1 dark:bg-slate-700 dark:text-gray-200"
          />
        ) : (
          <select
            value={talle}
            onChange={(e) => setTalle(e.target.value)}
            className="w-full mb-3 border rounded px-2 py-1 dark:bg-slate-700 dark:text-gray-200"
          >
            <option value="">Seleccionar talle</option>
            {TALLES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}

        {/* Observaciones */}
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className="w-full border rounded px-2 py-1 dark:bg-slate-700"
        />

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCerrar} className="px-3 py-1 bg-gray-300 rounded">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
