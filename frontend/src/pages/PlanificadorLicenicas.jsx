
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
} from "lucide-react";

import Navbar from "../components/BottomNavbar";
import BackButton from "../components/BackButton";
import { useAppContext } from "../context/AppContext";
import { estaTokenExpirado } from "../utils/tokenUtils";

import SelectorPeriodosLicencia from "../components/SelectorPeriodosLicencia";

export default function SeleccionarPeriodosLicencia() {
  const navigate = useNavigate();

  const { token } = useAppContext();

  const [periodosSeleccionados, setPeriodosSeleccionados] = useState([]);
  const [mostrarResumen, setMostrarResumen] = useState(false);

  // ----------------------------------
  // CONTROL DE ACCESO
  // ----------------------------------

  useEffect(() => {
    if (!token || estaTokenExpirado(token)) {
      navigate("/login");
    }
  }, [token, navigate]);

  // ----------------------------------
  // ACTUALIZAR SELECCIÓN
  // ----------------------------------

  const handleSeleccion = (periodos) => {
    setPeriodosSeleccionados(periodos);
    setMostrarResumen(false);
  };

  // ----------------------------------
  // CONFIRMAR SELECCIÓN
  // ----------------------------------

  const handleConfirmar = () => {
    if (periodosSeleccionados.length === 0) {
      alert("Debés seleccionar al menos un período.");
      return;
    }

    console.log(
      "Períodos seleccionados:",
      periodosSeleccionados
    );

    setMostrarResumen(true);
  };

  // ----------------------------------
  // RENDER
  // ----------------------------------

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">

      <div className="flex flex-col items-center m-4 py-6 px-4 pb-24 bg-white dark:bg-slate-900 rounded-2xl shadow-lg flex-grow w-full lg:w-3/4 xl:max-w-6xl mx-auto">

        {/* ENCABEZADO */}

        <div className="flex items-center justify-center gap-2 mb-2">

          <CalendarDays
            className="text-blue-600 dark:text-blue-300"
            size={28}
          />

          <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-200">
            Selección de licencias
          </h1>

        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          Seleccioná los períodos de licencia correspondientes al año 2027.
        </p>

        {/* COMPONENTE DE SELECCIÓN */}

        <div className="w-full">

          <SelectorPeriodosLicencia
            year={2027}
            onChange={handleSeleccion}
          />

        </div>

        {/* RESUMEN DE SELECCIÓN */}

        <div className="w-full mt-5 p-4 rounded-xl border border-blue-200 dark:border-slate-700 bg-blue-50 dark:bg-slate-800">

          <div className="flex items-center gap-2 mb-3">

            <ClipboardCheck
              className="text-blue-600 dark:text-blue-400"
              size={21}
            />

            <h2 className="font-semibold text-blue-900 dark:text-blue-200">
              Resumen de selección
            </h2>

          </div>

          <div className="grid grid-cols-2 gap-3">

            <div className="bg-white dark:bg-slate-900 rounded-lg p-3">

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Períodos
              </p>

              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {periodosSeleccionados.length} / 6
              </p>

            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg p-3">

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total de días
              </p>

              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {periodosSeleccionados.reduce(
                  (total, p) => total + p.dias,
                  0
                )}
              </p>

            </div>

          </div>

        </div>

        {/* BOTÓN CONFIRMAR */}

        <button
          type="button"
          onClick={handleConfirmar}
          disabled={periodosSeleccionados.length === 0}
          className={`w-full mt-5 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all ${
            periodosSeleccionados.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >

          <CheckCircle2 size={20} />

          Confirmar selección

        </button>

        {/* RESULTADO DE CONFIRMACIÓN */}

        {mostrarResumen && (

          <div className="w-full mt-5 p-4 rounded-xl border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20">

            <div className="flex items-center gap-2 mb-3">

              <CheckCircle2
                className="text-green-600"
                size={22}
              />

              <h3 className="font-semibold text-green-800 dark:text-green-300">
                Selección confirmada
              </h3>

            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Los siguientes períodos fueron seleccionados correctamente:
            </p>

            <div className="space-y-2">

              {periodosSeleccionados.map((p) => (

                <div
                  key={p.id}
                  className="flex justify-between items-center bg-white dark:bg-slate-900 rounded-lg p-3 text-sm"
                >

                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    Período {p.id}
                  </span>

                  <span className="text-gray-500 dark:text-gray-400">
                    {p.fecha_inicio.split("-").reverse().join("/")}
                    {" - "}
                    {p.fecha_fin.split("-").reverse().join("/")}
                  </span>

                </div>

              ))}

            </div>

            <p className="text-xs text-green-700 dark:text-green-400 mt-3">
              Esta confirmación es solamente visual. Todavía no se registraron licencias en el sistema.
            </p>

          </div>

        )}

        {/* VOLVER */}

        <div className="w-full flex justify-start mt-6">
          <BackButton to={-1} tooltip="Volver" />
        </div>

      </div>

      <Navbar />

    </div>
  );
}
