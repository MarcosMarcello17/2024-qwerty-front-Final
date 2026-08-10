// Reglas de contraseña compartidas por registro, cambio y restablecimiento.
// El backend no valida estas reglas, asi que esta lista es la unica barrera real.
export const PASSWORD_RULES = [
  { key: "length", label: "Al menos 8 caracteres", test: (p) => p.length >= 8 },
  { key: "upper", label: "Una letra mayúscula", test: (p) => /[A-Z]/.test(p) },
  { key: "lower", label: "Una letra minúscula", test: (p) => /[a-z]/.test(p) },
  { key: "number", label: "Un número", test: (p) => /\d/.test(p) },
  {
    key: "special",
    label: "Un carácter especial (@$!%*?&)",
    test: (p) => /[@$!%*?&]/.test(p),
  },
  {
    key: "forbidden",
    label: "Sin comillas ni barras ( ' \" / \\ | )",
    test: (p) => !/['"\\/|]/.test(p),
  },
];

export function passwordMeetsRules(password) {
  return password.length > 0 && PASSWORD_RULES.every((rule) => rule.test(password));
}
