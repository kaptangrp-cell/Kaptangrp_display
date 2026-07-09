import { Link } from "@tanstack/react-router";
import { Moon, Sun, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const { lang, setLang, t } = useI18n();
  const { theme, toggle } = useTheme();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-40">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/kaptan-logo.png" alt="KAPTAN" className="h-9 w-auto" />
        </Link>

        <div className="flex items-center gap-1">
          <div className="hidden sm:flex items-center rounded-full border border-border/60 glass px-1 py-1 mr-2">
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 text-xs font-medium tracking-widest rounded-full transition ${
                lang === "en" ? "bg-gold text-gold-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="English"
            >
              EN
            </button>
            <button
              onClick={() => setLang("de")}
              className={`px-3 py-1 text-xs font-medium tracking-widest rounded-full transition ${
                lang === "de" ? "bg-gold text-gold-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Deutsch"
            >
              DE
            </button>
          </div>

          <Button variant="ghost" size="icon" onClick={toggle} aria-label={t("theme_toggle")}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {signedIn ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin">{t("nav_admin")}</Link>
              </Button>
              <Button variant="ghost" size="icon" aria-label={t("sign_out")} onClick={() => supabase.auth.signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth" className="text-xs tracking-[0.2em] uppercase">
                {t("admin_login")}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}