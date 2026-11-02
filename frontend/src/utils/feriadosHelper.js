export async function obtenerFeriados(anio) {
  const response = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${anio}/UY`
  );

  if (!response.ok) {
    throw new Error("No se pudieron obtener los feriados");
  }

  return await response.json();
}