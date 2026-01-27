import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { estaTokenExpirado } from "../utils/tokenUtils";
import BottomNavbar from "../components/BottomNavbar";
import { deleteData } from "../utils/api";
import {
  Shirt,
  Shield,
  Package,
  Trash,
  PlusCircle,
  Pencil,
} from "lucide-react";
import IconButton from "../components/IconButton";
import ModalAgregarPrenda from "../components/ModalAgregarPrenda";

/* ---------------- Utils ---------------- */

const iconoPorPrenda = (nombre) => {
  const n = nombre?.toLowerCase();
  if (n.includes("chaleco")) return Shield;
  if (n.includes("camisa")) return Shirt;
  return Package;
};

/* ---------------- Componente ---------------- */

const PrendasFuncionario = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, recargarDatos } = useAppContext();

  // 🔐 Fuente de verdad: estado local (NO location.state)
  const [usuario, setUsuario] = useState(() => location.state?.usuario);
  const [prendas, setPrendas] = useState(
    () => location.state?.usuario?.prendas ?? []
  );
  const [mostrarModal, setMostrarModal] = useState(false);
  const [prendaEditar, setPrendaEditar] = useState(null);

  /* -------- Seguridad -------- */
  useEffect(() => {
    if (!token || estaTokenExpirado(token)) {
      navigate("/login");
      return;
    }

    if (!usuario) {
      navigate(-1);
    }
  }, [token, usuario, navigate]);

  if (!usuario) return null;

  /* -------- Acciones -------- */

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar esta prenda?")) return;

    try {
      await deleteData(`/prendas/${id}`, token);
      setPrendas((prev) => prev.filter((p) => p.id !== id));
      recargarDatos();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const sinPrendas = prendas.length === 0;

  /* ---------------- Render ---------------- */

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900">
      <main className="flex-1 px-6 py-8 space-y-6  p-4  dark:bg-slate-900  p-6 w-full lg:w-3/4 xl:max-w-4xl mx-auto">

        {/* Encabezado */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-400">
            Talles de uniforme – {usuario.nombre}
          </h1>
        </div>

        {/* Botón agregar prenda */}
        <IconButton
          className="ms-auto"s
          icon={PlusCircle}
          tooltip="Agregar prenda"
          onClick={() => setMostrarModal(true)}
          size="sm"
        />

        {/* Sin prendas */}
        {sinPrendas && (
          <div className="text-center text-gray-600 dark:text-gray-300">
            Este funcionario no posee prendas registradas.
          </div>
        )}

        {/* Tabla */}
        {!sinPrendas && (
          <div className="overflow-x-auto rounded-2xl shadow border border-blue-100 dark:border-slate-700">
            <table className="min-w-full bg-white dark:bg-slate-800">
              <thead className="bg-blue-100 dark:bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Prenda
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Talle
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Vencimiento
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    ...
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-blue-50 dark:divide-slate-700">
                {prendas.filter(Boolean).map((p) => {
                  const Icon = iconoPorPrenda(p.nombre);

                  return (
                    <tr
                      key={p.id}
                      className="text-center hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <td className="px-4 py-3 flex items-center gap-2">
                        <Icon
                          size={18}
                          className="text-blue-600 dark:text-blue-400"
                        />
                        <span className="font-medium">{p.nombre}</span>
                      </td>

                      <td className="px-4 py-3">{p.talle || "-"}</td>

                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {p.vencimiento || "No"}
                      </td>

                      <td className="flex px-4 py-3 text-center">
                      <IconButton
                        className="mx-auto"
                        icon={Pencil}
                        tooltip="Editar"
                        size="xs"
                        onClick={() => {
                          setPrendaEditar(p);
                          setMostrarModal(true);
                        }}
                      />
                        <IconButton
                          className="mx-auto"
                          icon={Trash}
                          tooltip="Eliminar prenda"
                          onClick={() => handleEliminar(p.id)}
                          size="sm"
                        />
                        
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal agregar prenda */}
      {mostrarModal && (
        <ModalAgregarPrenda
          usuario={usuario}
          token={token}
          prenda={prendaEditar}
          onCerrar={() => setMostrarModal(false)}
          onPrendaAgregada={(nuevaPrenda) => {
            setPrendas((prev) => [...prev, nuevaPrenda]);
            setMostrarModal(false);
          }}
        />
      )}

      <BottomNavbar />
    </div>
  );
};

export default PrendasFuncionario;
