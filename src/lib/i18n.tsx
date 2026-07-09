import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "de";

const dict = {
  en: {
    nav_collection: "Collection",
    nav_admin: "Admin",
    theme_toggle: "Toggle theme",
    lang_toggle: "Language",
    explore: "Explore Collection",
    back: "Back",
    next: "Next",
    previous: "Previous",
    material: "Material",
    size: "Size",
    color: "Color",
    quantity: "Quantity",
    notes: "Notes",
    in_stock: "In Stock",
    out_of_stock: "Out of Stock",
    // Auth
    admin_login: "Admin Access",
    admin_login_desc: "Sign in to manage the KAPTAN collection.",
    email: "Email",
    password: "Password",
    sign_in: "Sign In",
    sign_up: "Create Account",
    or: "or",
    sign_out: "Sign out",
    // Admin
    admin_dashboard: "Product Management",
    add_product: "Add product",
    edit: "Edit",
    delete: "Delete",
    confirm_delete: "Delete this product? This cannot be undone.",
    save: "Save",
    cancel: "Cancel",
    image_url: "Image URL",
    category: "Category",
    price: "Price (EUR)",
    title_en: "Title (English)",
    title_de: "Title (German)",
    description_en: "Description (English)",
    description_de: "Description (German)",
    material_en: "Material (English)",
    material_de: "Material (German)",
    color_en: "Color (English)",
    color_de: "Color (German)",
    notes_en: "Notes (English)",
    notes_de: "Notes (German)",
    sort_order: "Sort order",
    no_products: "No products yet — the showcase will be empty.",
    loading: "Loading collection…",
    // Customer form
    stay_in_touch: "Stay in Touch",
    stay_in_touch_desc: "Share your details to receive news about new arrivals and exclusive offers from KAPTAN.",
    full_name: "Full name",
    phone: "Phone",
    interested_in: "Interested in",
    interested_placeholder: "e.g. Bags, Accessories, Limited editions",
    message_optional: "Message (optional)",
    consent_label: "I agree to receive updates about new products and offers.",
    submit_contact: "Send my details",
    contact_success: "Thank you — we will be in touch.",
    // Admin tabs
    tab_products: "Products",
    tab_customers: "Customers",
    customers_title: "Customer Contacts",
    no_customers: "No customer submissions yet.",
  },
  de: {
    nav_collection: "Kollektion",
    nav_admin: "Admin",
    theme_toggle: "Theme wechseln",
    lang_toggle: "Sprache",
    explore: "Kollektion entdecken",
    back: "Zurück",
    next: "Weiter",
    previous: "Zurück",
    material: "Material",
    size: "Größe",
    color: "Farbe",
    quantity: "Menge",
    notes: "Hinweise",
    in_stock: "Verfügbar",
    out_of_stock: "Ausverkauft",
    admin_login: "Admin-Zugang",
    admin_login_desc: "Melden Sie sich an, um die KAPTAN-Kollektion zu verwalten.",
    email: "E-Mail",
    password: "Passwort",
    sign_in: "Anmelden",
    sign_up: "Konto erstellen",
    or: "oder",
    sign_out: "Abmelden",
    admin_dashboard: "Produktverwaltung",
    add_product: "Produkt hinzufügen",
    edit: "Bearbeiten",
    delete: "Löschen",
    confirm_delete: "Dieses Produkt löschen? Nicht rückgängig zu machen.",
    save: "Speichern",
    cancel: "Abbrechen",
    image_url: "Bild-URL",
    category: "Kategorie",
    price: "Preis (EUR)",
    title_en: "Titel (Englisch)",
    title_de: "Titel (Deutsch)",
    description_en: "Beschreibung (Englisch)",
    description_de: "Beschreibung (Deutsch)",
    material_en: "Material (Englisch)",
    material_de: "Material (Deutsch)",
    color_en: "Farbe (Englisch)",
    color_de: "Farbe (Deutsch)",
    notes_en: "Hinweise (Englisch)",
    notes_de: "Hinweise (Deutsch)",
    sort_order: "Sortierung",
    no_products: "Noch keine Produkte — die Präsentation ist leer.",
    loading: "Kollektion wird geladen…",
    stay_in_touch: "Bleiben Sie in Kontakt",
    stay_in_touch_desc: "Teilen Sie uns Ihre Daten mit, um Neuigkeiten zu neuen Kollektionen und exklusiven Angeboten von KAPTAN zu erhalten.",
    full_name: "Vollständiger Name",
    phone: "Telefon",
    interested_in: "Interessiert an",
    interested_placeholder: "z. B. Taschen, Accessoires, Limited Editions",
    message_optional: "Nachricht (optional)",
    consent_label: "Ich möchte Informationen zu neuen Produkten und Angeboten erhalten.",
    submit_contact: "Daten senden",
    contact_success: "Vielen Dank — wir melden uns bei Ihnen.",
    tab_products: "Produkte",
    tab_customers: "Kunden",
    customers_title: "Kundenkontakte",
    no_customers: "Noch keine Kundeneinträge.",
  },
} as const;

export type DictKey = keyof typeof dict.en;

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: DictKey) => string;
}

const LangCtx = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem("kaptan-lang") as Lang | null) : null;
    if (stored === "en" || stored === "de") setLangState(stored);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("kaptan-lang", l);
  };
  const t = (k: DictKey) => dict[lang][k] ?? dict.en[k];
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useI18n outside LanguageProvider");
  return ctx;
}