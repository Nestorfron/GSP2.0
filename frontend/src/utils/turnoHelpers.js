// utils/turnoHelpers.js
export function getTurnoProps(turno) {
    if (!turno)
      return {
        clase: "text-xs text-gray-700 dark:text-gray-300 bg-transparent",
        contenido: "-",
      };
  
    const t = turno.toLowerCase();
    if (t === "L.Med" || t === "l.med")
      return { clase: "text-xs text-black font-bold bg-yellow-300", contenido: "L.Med" };
    if (t === "licencia" || turno === "L")
      return { clase: "text-xs text-white bg-green-600", contenido: "L" };
    if (t === "l.ext")
      return { clase: "text-xs text-white bg-green-600", contenido: "L.Ext" };
    if (["custodia", "curso", "ch"].includes(t))
      return { clase: "text-xs text-white bg-blue-600", contenido: turno };
    if (t === "guardia" || turno === "t")
      return { clase: "text-xs text-black bg-white", contenido: "T" };
    if (t === "descanso" || turno === "D")
      return { clase: "text-xs text-white bg-black", contenido: "D" };
    if (["1ro", "2do", "3er"].includes(turno))
      return { clase: "text-xs text-white bg-blue-600", contenido: turno };
  
    return {
      clase: "text-xs text-gray-700 dark:text-gray-300 bg-transparent",
      contenido: turno,
    };
  }
  