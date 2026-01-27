import React, { useEffect, useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import BottomNavbar from "../components/BottomNavbar";
import {
  CalendarDays,
  ClipboardCheck,
  Umbrella,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { estaTokenExpirado } from "../utils/tokenUtils";
import dayjs from "dayjs";
import "dayjs/locale/es";
import IconButton from "../components/IconButton";
import { deleteData } from "../utils/api";

dayjs.locale("es");

export default function Licencias() {
  const navigate = useNavigate();
  const { usuario, token, licencias, licenciasPendientes, licenciasRechazadas, recargarDatos } = useAppContext();

  const [year, setYear] = useState(dayjs().year());

  useEffect(() => {
    if (!token || estaTokenExpirado(token)) {
      navigate("/login");
    }
  }, [token, navigate]);

  const licenciasUsuario = licencias.filter((l) => l.usuario_id === usuario.id);
  const licenciasPendientesUsuario = licenciasPendientes.filter(
    (l) => l.usuario_id === usuario.id
  );
  const licenciasRechazadasUsuario = licenciasRechazadas.filter(
    (l) => l.usuario_id === usuario.id
  );

  const añosDisponibles = [
    ...new Set(
      licenciasUsuario
        .map((l) => dayjs(l.fecha_inicio).year())
        .concat(
          licenciasPendientesUsuario.map((l) => dayjs(l.fecha_inicio).year())
        )
        .concat(
          licenciasRechazadasUsuario.map((l) => dayjs(l.fecha_inicio).year())
        )
    ),
  ].sort((a, b) => b - a);

  const licenciasFiltradas = [
    ...licenciasUsuario,
    ...licenciasPendientesUsuario,
    ...licenciasRechazadasUsuario,
  ].filter((l) => dayjs(l.fecha_inicio).year() === year);

  // TOTALES POR TIPO
  const totalReglamentaria = useMemo(() => {
    return licenciasFiltradas
      .filter(
        (l) =>
          (l.tipo === "reglamentaria" || l.tipo === null) &&
          ["activo", "aprobado", "aprobada"].includes(l.estado)
      )
      .reduce(
        (acc, l) =>
          acc + (dayjs(l.fecha_fin).diff(dayjs(l.fecha_inicio), "day") + 1),
        0
      );
  }, [licenciasFiltradas]);

  const totalMedica = useMemo(() => {
    return licenciasFiltradas
      .filter(
        (l) =>
          l.tipo === "medica" &&
          ["activo", "aprobado", "aprobada"].includes(l.estado)
      )
      .reduce(
        (acc, l) =>
          acc + (dayjs(l.fecha_fin).diff(dayjs(l.fecha_inicio), "day") + 1),
        0
      );
  }, [licenciasFiltradas]);

  const totalExtra = useMemo(() => {
    return licenciasFiltradas
      .filter(
        (l) =>
          l.tipo === "extraordinaria" &&
          ["activo", "aprobado", "aprobada"].includes(l.estado)
      )
      .reduce(
        (acc, l) =>
          acc + (dayjs(l.fecha_fin).diff(dayjs(l.fecha_inicio), "day") + 1),
        0
      );
  }, [licenciasFiltradas]);

  const licenciasOrdenadas = [...licenciasFiltradas].sort((a, b) => {
    if (a.estado === "pendiente" && b.estado !== "pendiente") return -1;
    if (b.estado === "pendiente" && a.estado !== "pendiente") return 1;
    return new Date(b.fecha_inicio) - new Date(a.fecha_inicio);
  });

  const getIcon = (tipo) => {
    if (tipo === "medica") return <ClipboardCheck size={18} />;
    if (tipo === "extraordinaria") return <CalendarDays size={18} />;
    return <Umbrella size={18} />;
  };

  const getColorClasses = (tipo) => {
    if (tipo === "medica") {
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800";
    }
    if (tipo === "extraordinaria") {
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-800";
    }
    return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-300 dark:border-green-800";
  };

  const handleDelete = async (id) => {
    await deleteData(`/licencias/${id}`, token);
    recargarDatos();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      <main className="flex-1 px-5 py-7 space-y-6 bg-white dark:bg-slate-900 p-6 w-full lg:w-1/2 xl:max-w-3xl mx-auto">
        {/* Título */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-400">
            Mis Licencias
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Reglamentarias, médicas y extraordinarias
          </p>
        </div>

        {/* Selector de año */}
        {añosDisponibles.length > 0 && (
          <div className="flex justify-between">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-blue-700 dark:text-blue-300 font-medium shadow-sm"
            >
              {añosDisponibles.map((año) => (
                <option key={año} value={año}>
                  {año}
                </option>
              ))}
            </select>
            <IconButton
              icon={PlusCircle}
              tooltip="Solicitar licencia"
              onClick={() => navigate(`/crear-licencia/${year}`)}
              size="sm"
            />
          </div>
        )}

        {/* Lista */}
        <div className="space-y-4">
          {licenciasFiltradas.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
              No tienes licencias registradas en {year}.
              <IconButton
              className="mx-auto my-6 "
              icon={PlusCircle}
              tooltip="Solicitar licencia"
              onClick={() => navigate(`/crear-licencia/${year}`)}
              size="sm"
            />
            </div>
          )}

          {licenciasOrdenadas.map((licencia) => (
            <div
              key={licencia.id}
              className={`p-4 border rounded-2xl shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow ${getColorClasses(
                licencia.tipo
              )}`}
            >
              <div className="mt-1">{getIcon(licencia.tipo)}</div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold capitalize">
                  {licencia.tipo === "reglamentaria" || licencia.tipo === null
                    ? "Reglamentaria"
                    : licencia.tipo}
                </h2>

                <p className="text-sm mt-1">
                  Desde:{" "}
                  <span className="font-medium">
                    {dayjs(licencia.fecha_inicio).utc().format("DD MMM YYYY")}
                  </span>
                </p>

                <p className="text-sm">
                  Hasta:{" "}
                  <span className="font-medium">
                    {dayjs(licencia.fecha_fin).utc().format("DD MMM YYYY")}
                  </span>
                </p>

                <p className="font-bold">
                  {licencia.tipo === "medica"
                    ? "Diagnóstico: " + licencia.motivo
                    : ""}
                </p>

                <p className="text-sm">
                  {licencia.tipo === "extraordinaria"
                    ? "Observaciones: " + licencia.motivo
                    : ""}
                </p>

                {/* Estado visible SIEMPRE */}
                <span
                  className={
                    licencia.estado === "pendiente"
                      ? "text-yellow-600 font-bold"
                      : ["activo", "aprobado", "aprobada"].includes(
                          licencia.estado
                        )
                      ? "text-green-600 font-bold"
                      : licencia.estado === "rechazado"
                      ? "text-red-600 font-bold"
                      : ""
                  }
                >
                  Estado:{" "}
                  {licencia.estado === "pendiente"
                    ? "Pendiente"
                    : ["activo", "aprobado", "aprobada"].includes(
                        licencia.estado
                      )
                    ? "Aprobado"
                    : licencia.estado === "rechazado"
                    ? "Rechazado"
                    : "Inactivo"}
                </span>
              </div>

              {/* BOTÓN BORRAR SOLO SI ESTÁ PENDIENTE */}
              {licencia.estado === "pendiente" && (
                <IconButton
                    className="m-auto"
                  icon={Trash2}
                  tooltip="Cancelar solicitud"
                  size="sm"
                  onClick={() => handleDelete(licencia.id)}
                />
              )}
            </div>
          ))}
        </div>

        {/* Totales por tipo */}
        {totalReglamentaria + totalMedica + totalExtra > 0 && (
          <div className="mt-6 space-y-2 text-center">
            {totalReglamentaria > 0 && (
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                Reglamentarias:{" "}
                <span className="font-bold">{totalReglamentaria}</span> días
              </p>
            )}

            {totalMedica > 0 && (
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                Médicas: <span className="font-bold">{totalMedica}</span> días
              </p>
            )}

            {totalExtra > 0 && (
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Extraordinarias: <span className="font-bold">{totalExtra}</span>{" "}
                días
              </p>
            )}
          </div>
        )}
      </main>

      <BottomNavbar />
    </div>
  );
}
