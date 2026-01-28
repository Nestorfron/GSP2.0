// utils/turnoHelpers.js
export function getTurnoProps(turno) {
  if (!turno)
    return {
      clase: "text-xs text-gray-700 dark:text-gray-300 bg-transparent",
      contenido: "-",
    };

  const t = turno.toLowerCase();

  if (t === "l.med" || t === "medica")
    return { clase: "text-xs text-black font-bold bg-yellow-300", contenido: "L.Med" };

  if (t === "licencia" || t === "l" || t === "reglamentaria")
    return { clase: "text-xs text-white bg-green-600", contenido: "L" };

  if (t === "l.ext" || t === "extraordinaria")
    return { clase: "text-xs text-white bg-green-600", contenido: "L.Ext" };

  if (["custodia", "curso", "ch"].includes(t))
    return { clase: "text-xs text-white bg-blue-600", contenido: turno };

  if (t === "guardia" || t === "t")
    return { clase: "text-xs text-black", contenido: "T" };

  if (t === "descanso" || t === "d")
    return { clase: "text-xs text-white bg-black", contenido: "D" };

  if (["1ro", "2do", "3er"].includes(turno))
    return { clase: "text-xs text-white bg-blue-600", contenido: turno };

  if (t === "t-1")
    return { clase: "text-xs text-violet-900 bg-violet-300 font-semibold", contenido: turno };

  if (t === "t-2")
    return { clase: "text-xs text-white bg-violet-700 font-semibold", contenido: turno };

  // fallback
  return {
    clase: "text-xs text-gray-700 dark:text-gray-300 bg-transparent",
    contenido: turno,
  };
}

  