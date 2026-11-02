
import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

const COLORES = [
  {
    seleccionado: "bg-blue-600 text-white",
    borde: "border-blue-600",
    texto: "text-blue-700",
  },
  {
    seleccionado: "bg-green-600 text-white",
    borde: "border-green-600",
    texto: "text-green-700",
  },
  {
    seleccionado: "bg-purple-600 text-white",
    borde: "border-purple-600",
    texto: "text-purple-700",
  },
  {
    seleccionado: "bg-orange-500 text-white",
    borde: "border-orange-500",
    texto: "text-orange-700",
  },
  {
    seleccionado: "bg-cyan-600 text-white",
    borde: "border-cyan-600",
    texto: "text-cyan-700",
  },
  {
    seleccionado: "bg-pink-600 text-white",
    borde: "border-pink-600",
    texto: "text-pink-700",
  },
];

export default function SelectorPeriodosLicencia({
  year = 2027,
  onChange,
  initialSelected = [],
}) {
  const [seleccionados, setSeleccionados] = useState(initialSelected);

  // ----------------------------------
  // GENERAR LOS 6 PERÍODOS
  // ----------------------------------

  const periodos = useMemo(() => {
    const inicioBase = dayjs(`${year}-01-03`);

    return Array.from({ length: 6 }, (_, i) => {
      const inicio = inicioBase.add(i * 10, "day");
      const fin = inicio.add(9, "day");

      return {
        id: i + 1,
        fecha_inicio: inicio.format("YYYY-MM-DD"),
        fecha_fin: fin.format("YYYY-MM-DD"),
        dias: 10,
      };
    });
  }, [year]);

  // ----------------------------------
  // GENERAR CALENDARIO
  // ----------------------------------

  const dias = useMemo(() => {
    const inicio = dayjs(periodos[0].fecha_inicio);
    const fin = dayjs(periodos[5].fecha_fin);

    return Array.from(
      { length: fin.diff(inicio, "day") + 1 },
      (_, i) => inicio.add(i, "day")
    );
  }, [periodos]);

  // Agrupar encabezados por mes
  const meses = useMemo(() => {
    const grupos = [];

    dias.forEach((dia) => {
      const mes = dia.format("MMMM");

      const ultimo = grupos[grupos.length - 1];

      if (ultimo && ultimo.nombre === mes) {
        ultimo.cantidad++;
      } else {
        grupos.push({
          nombre: mes,
          cantidad: 1,
        });
      }
    });

    return grupos;
  }, [dias]);

  // ----------------------------------
  // SELECCIONAR / DESMARCAR PERÍODO
  // ----------------------------------

  const togglePeriodo = (id) => {
    const nuevos = seleccionados.includes(id)
      ? seleccionados.filter((p) => p !== id)
      : [...seleccionados, id].sort((a, b) => a - b);

    setSeleccionados(nuevos);

    const resultado = periodos.filter((p) =>
      nuevos.includes(p.id)
    );

    onChange?.(resultado);
  };

  // ----------------------------------
  // SELECCIONAR TODOS / LIMPIAR
  // ----------------------------------

  const seleccionarTodos = () => {
    const nuevos = periodos.map((p) => p.id);

    setSeleccionados(nuevos);
    onChange?.(periodos);
  };

  const limpiarSeleccion = () => {
    setSeleccionados([]);
    onChange?.([]);
  };

  // ----------------------------------
  // FORMATO DE FECHAS
  // ----------------------------------

  const formatoFecha = (fecha) =>
    dayjs(fecha).format("DD/MM/YYYY");

  const totalDias = periodos
    .filter((p) => seleccionados.includes(p.id))
    .reduce((total, p) => total + p.dias, 0);

  // ----------------------------------
  // RENDER
  // ----------------------------------

  return (
    <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-700">

      {/* ENCABEZADO */}

      <div className="p-4 flex flex-wrap justify-between items-center gap-3">

        <div>
          <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-400">
            Períodos de licencia
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enero - Marzo {year}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={seleccionarTodos}
            className="px-3 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            Seleccionar todos
          </button>

          <button
            type="button"
            onClick={limpiarSeleccion}
            className="px-3 py-2 rounded-lg text-sm bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200 transition"
          >
            Limpiar
          </button>

        </div>
      </div>

      {/* RESUMEN */}

      <div className="px-4 pb-3 flex flex-wrap gap-4 text-sm">

        <div className="text-gray-600 dark:text-gray-300">
          Períodos seleccionados:{" "}
          <strong className="text-blue-700 dark:text-blue-400">
            {seleccionados.length} / 6
          </strong>
        </div>

        <div className="text-gray-600 dark:text-gray-300">
          Días seleccionados:{" "}
          <strong className="text-blue-700 dark:text-blue-400">
            {totalDias}
          </strong>
        </div>

      </div>

      {/* CALENDARIO */}

      <div className="overflow-x-auto border-t border-gray-200 dark:border-slate-700">

        <table className="border-collapse text-center text-xs min-w-max w-full table-fixed">

          <thead>

            {/* FILA DE MESES */}

            <tr className="bg-gray-200 dark:bg-slate-900">

              <th
                rowSpan={2}
                className="sticky left-0 z-30 bg-white dark:bg-slate-800 border px-3 py-2 min-w-[155px] text-left text-blue-800 dark:text-blue-400"
              >
                Período
              </th>

              {meses.map((mes, index) => (
                <th
                  key={index}
                  colSpan={mes.cantidad}
                  className="border px-2 py-2 uppercase text-gray-700 dark:text-gray-200"
                >
                  {mes.nombre}
                </th>
              ))}

            </tr>

            {/* FILA DE DÍAS */}

            <tr className="bg-gray-100 dark:bg-slate-700">

              {dias.map((dia) => (
                <th
                  key={dia.format("YYYY-MM-DD")}
                  className="border px-2 py-2 min-w-[42px] text-gray-700 dark:text-gray-200"
                >
                  {dia.format("DD/MM")}
                  <br />
                  {dia.format("ddd")}
                </th>
              ))}

            </tr>

          </thead>

          <tbody>

            {periodos.map((periodo, index) => {

              const activo = seleccionados.includes(periodo.id);
              const color = COLORES[index];

              return (

                <tr
                  key={periodo.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/50"
                >

                  {/* INFORMACIÓN DEL PERÍODO */}

                  <td className="sticky left-0 z-20 bg-white dark:bg-slate-800 border px-2 py-2 text-left">

                    <button
                      type="button"
                      onClick={() => togglePeriodo(periodo.id)}
                      className="w-full text-left"
                    >

                      <div className={`font-semibold ${color.texto}`}>
                        {activo ? "☑" : "☐"} Período {periodo.id}
                      </div>

                      <div className="text-gray-500 dark:text-gray-400 text-[10px] mt-1">
                        {formatoFecha(periodo.fecha_inicio)}
                        <br />
                        al {formatoFecha(periodo.fecha_fin)}
                      </div>

                    </button>

                  </td>

                  {/* DÍAS DEL PERÍODO */}

                  {dias.map((dia) => {

                    const dentro =
                      !dia.isBefore(
                        dayjs(periodo.fecha_inicio),
                        "day"
                      ) &&
                      !dia.isAfter(
                        dayjs(periodo.fecha_fin),
                        "day"
                      );

                    return (

                      <td
                        key={dia.format("YYYY-MM-DD")}
                        className={`border p-0 h-10 ${
                          dentro
                            ? activo
                              ? color.seleccionado
                              : "bg-gray-200 dark:bg-slate-600"
                            : "bg-white dark:bg-slate-800"
                        }`}
                      >

                        {dentro && (
                          <button
                            type="button"
                            onClick={() => togglePeriodo(periodo.id)}
                            aria-label={`Seleccionar período ${periodo.id}`}
                            aria-pressed={activo}
                            className="w-full h-full flex items-center justify-center hover:opacity-75 transition"
                          >
                            {activo ? "L" : "·"}
                          </button>
                        )}

                      </td>

                    );

                  })}

                </tr>

              );

            })}

          </tbody>

        </table>

      </div>

      {/* LEYENDA */}

      <div className="p-4 border-t border-gray-200 dark:border-slate-700">

        <div className="flex flex-wrap gap-3">

          {periodos.map((p, index) => {

            const activo = seleccionados.includes(p.id);
            const color = COLORES[index];

            return (

              <button
                type="button"
                key={p.id}
                onClick={() => togglePeriodo(p.id)}
                className={`flex items-center gap-2 text-xs px-2 py-1 rounded border transition ${
                  activo
                    ? `${color.seleccionado} ${color.borde}`
                    : "border-gray-300 dark:border-slate-600 text-gray-500"
                }`}
              >

                <span className="font-semibold">
                  P{p.id}
                </span>

                {activo ? "Seleccionado" : "Sin seleccionar"}

              </button>

            );

          })}

        </div>

      </div>

      {/* RESUMEN FINAL */}

      <div className="p-4 bg-blue-50 dark:bg-slate-900 rounded-b-lg">

        <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-300 mb-2">
          Detalle de selección
        </h3>

        {seleccionados.length === 0 ? (

          <p className="text-sm text-gray-500 dark:text-gray-400">
            No hay períodos seleccionados.
          </p>

        ) : (

          <div className="flex flex-wrap gap-2">

            {periodos
              .filter((p) => seleccionados.includes(p.id))
              .map((p) => (

                <div
                  key={p.id}
                  className="text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded p-2"
                >

                  <strong>Período {p.id}</strong>

                  <div className="text-gray-500 dark:text-gray-400 mt-1">
                    {formatoFecha(p.fecha_inicio)}
                    {" - "}
                    {formatoFecha(p.fecha_fin)}
                  </div>

                </div>

              ))}

          </div>

        )}

      </div>

    </div>
  );
}
