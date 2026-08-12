import {
  Baby,
  Banknote,
  Beer,
  BookOpen,
  Bus,
  Camera,
  Candy,
  Car,
  Coffee,
  CreditCard,
  Droplets,
  Dumbbell,
  Film,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  Heart,
  HeartPulse,
  House,
  Image,
  Landmark,
  Music,
  PawPrint,
  PiggyBank,
  Pizza,
  Plane,
  Plug,
  ReceiptText,
  Repeat,
  Scissors,
  Shirt,
  ShoppingCart,
  Star,
  Stethoscope,
  Tag,
  Ticket,
  TrendingUp,
  User,
  Utensils,
  Wallet,
  WashingMachine,
  Wifi,
  Wrench,
} from "lucide-react";

/*
  El backend guarda el icono como string estilo Font Awesome ("fa-solid
  fa-house") y quince archivos todavía leen ese campo. Así que las claves se
  mantienen: lo que cambia es quién las dibuja. Este módulo es la única capa
  que traduce clave guardada -> componente de lucide, para que no haya que
  migrar datos ni tocar el resto de las pantallas.
*/

/** Grupos que se ofrecen en el selector. Máximo 7 por grupo. */
export const ICON_GROUPS = [
  {
    label: "Casa y servicios",
    icons: [
      { key: "fa-solid fa-house", label: "Hogar", Icon: House },
      {
        key: "fa-solid fa-file-invoice-dollar",
        label: "Impuestos y servicios",
        Icon: ReceiptText,
      },
      { key: "fa-solid fa-plug", label: "Luz y gas", Icon: Plug },
      { key: "fa-solid fa-droplet", label: "Agua", Icon: Droplets },
      { key: "fa-solid fa-wifi", label: "Internet y teléfono", Icon: Wifi },
      {
        key: "fa-solid fa-blender",
        label: "Electrodomésticos",
        Icon: WashingMachine,
      },
      {
        key: "fa-solid fa-screwdriver-wrench",
        label: "Arreglos",
        Icon: Wrench,
      },
    ],
  },
  {
    label: "Día a día",
    icons: [
      { key: "fa-solid fa-cart-shopping", label: "Mercado", Icon: ShoppingCart },
      { key: "fa-solid fa-utensils", label: "Comer afuera", Icon: Utensils },
      { key: "fa-solid fa-mug-hot", label: "Café", Icon: Coffee },
      { key: "fa-solid fa-candy-cane", label: "Antojos", Icon: Candy },
      { key: "fa-solid fa-pizza-slice", label: "Delivery", Icon: Pizza },
      { key: "fa-solid fa-shirt", label: "Ropa", Icon: Shirt },
      {
        key: "fa-solid fa-scissors",
        label: "Cuidado personal",
        Icon: Scissors,
      },
    ],
  },
  {
    label: "Salud y familia",
    icons: [
      { key: "fa-solid fa-stethoscope", label: "Salud", Icon: Stethoscope },
      { key: "fa-solid fa-heart-pulse", label: "Farmacia", Icon: HeartPulse },
      { key: "fa-solid fa-dumbbell", label: "Gimnasio", Icon: Dumbbell },
      { key: "fa-solid fa-baby", label: "Chicos", Icon: Baby },
      { key: "fa-solid fa-paw", label: "Mascotas", Icon: PawPrint },
      {
        key: "fa-solid fa-graduation-cap",
        label: "Educación",
        Icon: GraduationCap,
      },
      { key: "fa-solid fa-chalkboard-user", label: "Clases", Icon: BookOpen },
    ],
  },
  {
    label: "Transporte",
    icons: [
      { key: "fa-solid fa-car", label: "Auto", Icon: Car },
      { key: "fa-solid fa-gas-pump", label: "Nafta", Icon: Fuel },
      { key: "fa-solid fa-bus", label: "Transporte", Icon: Bus },
      { key: "fa-solid fa-plane", label: "Viajes", Icon: Plane },
    ],
  },
  {
    label: "Ocio",
    icons: [
      {
        key: "fa-solid fa-ticket",
        label: "Entretenimiento y ocio",
        Icon: Ticket,
      },
      { key: "fa-solid fa-film", label: "Cine y series", Icon: Film },
      { key: "fa-solid fa-gamepad", label: "Juegos", Icon: Gamepad2 },
      { key: "fa-solid fa-music", label: "Música", Icon: Music },
      { key: "fa-solid fa-beer-mug-empty", label: "Salidas", Icon: Beer },
      { key: "fa-solid fa-camera-retro", label: "Fotos", Icon: Camera },
      { key: "fa-solid fa-gift", label: "Regalos", Icon: Gift },
    ],
  },
  {
    label: "Dinero",
    icons: [
      { key: "fa-solid fa-money-bill", label: "Ingreso de dinero", Icon: Banknote },
      { key: "fa-solid fa-wallet", label: "Billetera", Icon: Wallet },
      { key: "fa-solid fa-piggy-bank", label: "Ahorro", Icon: PiggyBank },
      { key: "fa-solid fa-credit-card", label: "Tarjeta", Icon: CreditCard },
      { key: "fa-solid fa-landmark", label: "Banco", Icon: Landmark },
      { key: "fa-solid fa-repeat", label: "Suscripciones", Icon: Repeat },
      { key: "fa-solid fa-chart-line", label: "Inversiones", Icon: TrendingUp },
    ],
  },
];

/*
  Iconos que ofrecía el selector viejo y ya están guardados en categorías de
  usuarios reales. No se ofrecen más (no dicen nada sobre un gasto), pero se
  siguen dibujando para que ninguna categoría existente quede sin icono.
*/
const LEGACY_ALIASES = {
  user: User,
  image: Image,
  star: Star,
  heart: Heart,
  book: BookOpen,
  home: House,
  "shopping-cart": ShoppingCart,
};

const BY_SLUG = new Map();
for (const group of ICON_GROUPS) {
  for (const icon of group.icons) {
    BY_SLUG.set(iconSlug(icon.key), icon.Icon);
  }
}
for (const [slug, Icon] of Object.entries(LEGACY_ALIASES)) {
  if (!BY_SLUG.has(slug)) BY_SLUG.set(slug, Icon);
}

/**
 * Normaliza "fa-solid fa-mug-hot", "fas fa-mug-hot" y "mug-hot" al mismo slug.
 */
function iconSlug(iconPath) {
  if (typeof iconPath !== "string") return "";
  const last = iconPath.trim().split(/\s+/).pop() ?? "";
  return last.replace(/^fa-/, "").toLowerCase();
}

/** Devuelve el componente de lucide para una clave guardada, o null. */
export function resolveCategoryIcon(iconPath) {
  return BY_SLUG.get(iconSlug(iconPath)) ?? null;
}

/** Etiqueta legible de una clave conocida, o null. */
export function categoryIconLabel(iconPath) {
  const slug = iconSlug(iconPath);
  for (const group of ICON_GROUPS) {
    const match = group.icons.find((icon) => iconSlug(icon.key) === slug);
    if (match) return match.label;
  }
  return null;
}

/**
 * Dibuja el icono de una categoría. `Tag` es el fallback para claves que no
 * conocemos, así que una categoría vieja o rara nunca queda vacía.
 */
export function CategoryIcon({ iconPath, className, ...rest }) {
  const Icon = resolveCategoryIcon(iconPath) ?? Tag;
  return <Icon className={className} aria-hidden="true" {...rest} />;
}
