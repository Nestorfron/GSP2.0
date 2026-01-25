import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Shirt,
  Shield,
  Package,
  PlusCircle,
  Pencil,
  Trash,
} from "lucide-react";
import IconButton from "../components/IconButton";
import ModalAgregarPrenda from "../components/ModalAgregarPrenda";
import { deleteData } from "../utils/api";

/* Utils */
const iconoPorPrenda = (nombre) => {
  const n = nombre?.toLowerCase();
  if (n.includes("chaleco")) return Shield;
  if (n.includes("camisa")) return Shirt;
  return Package;
};

const PrendasUsuario = () => {
  const { usuario, token } = useAppContext();

  const [prendas, setPrendas] = useState(usuario?.prendas ?? []);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [prendaEditar, setPrendaEditar] = useState(null);

  if (!usuario) return null;

  const sinPrendas = prendas.length === 0;

  const handleDelete = async (id) => {
    try {
      await deleteData(`/prendas/${id}`, token);
      setPrendas((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      alert("No se pudo eliminar la prenda.");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded shadow p-2 w-full border border-blue-100 dark:border-slate-800 mt-2">

      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
          Mis talles de uniforme
        </h3>

        {!sinPrendas && (
          <IconButton
            icon={PlusCircle}
            tooltip="Agregar prenda"
            onClick={() => {
              setPrendaEditar(null);
              setMostrarModal(true);
            }}
            size="sm"
          />
        )}
      </div>

      {/* SIN PRENDAS */}
      {sinPrendas && (
        <div className="text-center py-6 text-gray-600 dark:text-gray-300">
          <p className="text-sm mb-4">
            No hay talles de prendas registrados.
          </p>

          <IconButton
            icon={PlusCircle}
            tooltip="Agregar primera prenda"
            onClick={() => setMostrarModal(true)}
            size="sm"
            className="mx-auto"
          />
        </div>
      )}

      {/* TABLA */}
      {!sinPrendas && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            

            <tbody className="divide-y">
              {prendas.map((p) => {
                const Icon = iconoPorPrenda(p.nombre);

                return (
                  <tr key={p.id}>
                    <td className="px-1 py-2 flex gap-2 items-center">
                      <Icon size={16} className="text-blue-600" />
                      {p.nombre}
                    </td>

                    <td className="px-2 py-2">{p.talle || "-"}</td>

                    <td className="px-2 py-2 flex justify-center">
                      <IconButton
                        icon={Pencil}
                        tooltip="Editar"
                        size="xs"
                        onClick={() => {
                          setPrendaEditar(p);
                          setMostrarModal(true);
                        }}
                      />
                      <IconButton
                        icon={Trash}
                        tooltip="Eliminar"
                        size="xs"
                        className="ms-3 text-red-600"
                        onClick={() => handleDelete(p.id)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {mostrarModal && (
        <ModalAgregarPrenda
          usuario={usuario}
          prenda={prendaEditar}
          onCerrar={() => setMostrarModal(false)}
          onPrendaGuardada={(prendaGuardada) => {
            setPrendas((prev) =>
              prendaEditar
                ? prev.map((p) =>
                    p.id === prendaGuardada.id ? prendaGuardada : p
                  )
                : [...prev, prendaGuardada]
            );
          }}
        />
      )}
    </div>
  );
};

export default PrendasUsuario;
