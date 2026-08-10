const currencyFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const shortDateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

export function formatARS(value) {
  return `$${currencyFormatter.format(value || 0)}`;
}

// Las fechas llegan del backend en ISO con Z. Sin timeZone: "UTC" el navegador
// las corre un dia hacia atras para husos negativos como el de Argentina.
export function formatShortDate(fecha) {
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return "";
  return shortDateFormatter.format(date);
}
