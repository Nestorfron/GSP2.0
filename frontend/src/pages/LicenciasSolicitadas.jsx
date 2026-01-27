import React, { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import BottomNavbar from "../components/BottomNavbar";
import {
  CalendarDays,
  ClipboardCheck,
  Umbrella,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { putData, deleteData } from "../utils/api";
import dayjs from "dayjs";
import "dayjs/locale/es";
import IconButton from "../components/IconButton";
import { estaTokenExpirado } from "../utils/tokenUtils";

dayjs.locale("es");

export default function LicenciasSolicitadas() {
  const navigate = useNavigate();
  const {
    usuario,
    token,
    licenciasPendientes,
    dependencias,
    guardias,
    recargarDatos,
  } = useAppContext();

  useEffect(() => {
    if (!token || estaTokenExpirado(token) || usuario.rol_jerarquico !== "JEFE_DEPENDENCIA") {
      navigate("/login");
    }
  }, [token, navigate]);

  const miDependencia = dependencias.find((dep) =>
    dep.usuarios?.some(
      (u) => u.id === usuario.id && u.rol_jerarquico === "JEFE_DEPENDENCIA"
    )
  );

  if (!miDependencia) {
    return (
      <div className="p-6 text-center text-red-500">
        No tienes dependencia asignada.
      </div>
    );
  }

  const solicitudes = licenciasPendientes.filter((l) =>
    miDependencia.usuarios.some((u) => u.id === l.usuario_id)
  );

  const abreviarNombre = (nombreCompleto) => {
    if (!nombreCompleto) return "";
    const partes = nombreCompleto.trim().split(" ");
    if (partes.length === 1) return partes[0];

    const inicial = partes[0][0];
    const apellido = partes.find((p) => p === p.toUpperCase());
    return inicial && apellido
      ? `${inicial}. ${apellido}`
      : `${inicial}. ${partes[1] || ""}`;
  };

  const datoFuncionario = (id) => {
    const usuario = miDependencia.usuarios.find((u) => u.id === id);
    return "G" + usuario.grado + " " + abreviarNombre(usuario.nombre);
  };

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

  const eliminarGuardiasPorDias = async (lic) => {
    const inicioUTC = dayjs(lic.fecha_inicio).utc().startOf("day");
    const finUTC = dayjs(lic.fecha_fin).utc().startOf("day");

    const dias = [];
    let diaActual = inicioUTC.clone();

    while (diaActual.isSameOrBefore(finUTC, "day")) {
      dias.push(diaActual.clone());
      diaActual = diaActual.add(1, "day");
    }

    for (const dia of dias) {
      const guardia = guardias.find(
        (g) =>
          g.usuario_id === lic.usuario_id &&
          g.tipo !== "licencia" &&
          g.tipo !== "licencia_medica" &&
          dayjs(g.fecha_inicio).utc().startOf("day").isSame(dia, "day")
      );

      if (guardia) {
        await deleteData(`guardias/${guardia.id}`, token);
      }
    }
  };

  const aprobarLicencia = async (lic) => {
    // 🔥 BORRA GUARDIAS SOLO AL APROBAR
    await eliminarGuardiasPorDias(lic);

    await putData(
      `/licencias/${lic.id}`,
      {
        usuario_id: lic.usuario_id,
        fecha_inicio: lic.fecha_inicio,
        fecha_fin: lic.fecha_fin,
        tipo: lic.tipo,
        motivo: lic.motivo,
        estado: "aprobado",
      },
      token
    );

    recargarDatos();
  };

  const rechazarLicencia = async (lic) => {
    await putData(
      `/licencias/${lic.id}`,
      {
        usuario_id: lic.usuario_id,
        fecha_inicio: lic.fecha_inicio,
        fecha_fin: lic.fecha_fin,
        tipo: lic.tipo,
        motivo: lic.motivo,
        estado: "rechazado",
      },
      token
    );
    recargarDatos();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900">
      <main className="flex-1 px-5 py-7 space-y-6 flex-grow dark:bg-slate-900  p-6 w-full lg:w-3/4 xl:max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-400">
            Solicitudes de Licencia
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Funcionarios: {miDependencia.nombre}
          </p>
        </div>

        {solicitudes.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-4">
            No hay solicitudes pendientes.
          </div>
        ) : (
          <div className="space-y-4">
            {solicitudes.map((licencia) => (
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

                  <p className="text-sm font-medium">
                    {datoFuncionario(licencia.usuario_id)}
                  </p>

                  <p className="text-sm mt-1">
                    Desde:{" "}
                    <span className="font-medium">
                      {dayjs(licencia.fecha_inicio)
                        .utc()
                        .format("DD MMM YYYY")}
                    </span>
                  </p>

                  <p className="text-sm">
                    Hasta:{" "}
                    <span className="font-medium">
                      {dayjs(licencia.fecha_fin).utc().format("DD MMM YYYY")}
                    </span>
                  </p>

                  {licencia.motivo && (
                    <p className="text-sm mt-1 italic">“{licencia.motivo}”</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <IconButton
                    icon={CheckCircle}
                    tooltip="Aprobar"
                    size="sm"
                    className="text-green-600"
                    onClick={() => aprobarLicencia(licencia)}
                  />
                  <IconButton
                    icon={XCircle}
                    tooltip="Rechazar"
                    size="sm"
                    className="text-red-600"
                    onClick={() => rechazarLicencia(licencia)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNavbar />
    </div>
  );
}
