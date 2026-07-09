import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { resolveImage, type Product } from "@/lib/products";

const ROTATE_MS = 5000;

export function ProductShowcase({ products }: { products: Product[] }) {
  const { lang, t } = useI18n();
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const startRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = performance.now();
    setProgress(0);
  }, [idx]);

  useEffect(() => {
    if (products.length <= 1 || paused) return;
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const p = Math.min(1, elapsed / ROTATE_MS);
      setProgress(p);
      if (p >= 1) {
        setIdx((i) => (i + 1) % products.length);
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [idx, paused, products.length]);

  if (!products.length) return null;
  const p = products[idx];
  const title = lang === "de" ? p.title_de : p.title_en;
  const desc = lang === "de" ? p.description_de : p.description_en;
  const material = (lang === "de" ? p.material_de : p.material_en) ?? "—";
  const color = (lang === "de" ? p.color_de : p.color_en) ?? "—";
  const notes = lang === "de" ? p.notes_de : p.notes_en;

  const go = (delta: number) => setIdx((i) => (i + delta + products.length) % products.length);

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="mx-auto max-w-7xl px-6 pt-28 pb-16"
    >
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-secondary">
          <img
            key={p.id}
            src={resolveImage(p.image_url)}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover animate-in fade-in duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
        </div>

        <div key={p.id} className="animate-in fade-in slide-in-from-right-4 duration-700">
          <p className="text-xs tracking-[0.4em] text-gold font-medium">{p.category}</p>
          <h1 className="mt-4 font-serif text-5xl sm:text-6xl leading-[1.05] text-foreground">
            {title}
          </h1>
          <p className="mt-6 text-muted-foreground text-base sm:text-lg max-w-xl leading-relaxed">
            {desc}
          </p>

          <div className="mt-8 flex items-baseline gap-4">
            <span className="font-serif text-3xl text-gold">
              €{Number(p.price).toLocaleString(lang === "de" ? "de-DE" : "en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-xs tracking-widest uppercase ${p.in_stock ? "text-gold" : "text-muted-foreground"}`}>
              {p.in_stock ? t("in_stock") : t("out_of_stock")}
            </span>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 border-y border-border/60 py-6 text-sm">
            <MetaRow label={t("material")} value={material} />
            <MetaRow label={t("size")} value={p.size ?? "—"} />
            <MetaRow label={t("color")} value={color} />
            <MetaRow label={t("quantity")} value={String(p.quantity)} />
          </dl>

          {notes ? (
            <div className="mt-6">
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">{t("notes")}</p>
              <p className="mt-2 text-sm text-foreground/80">{notes}</p>
            </div>
          ) : null}

          <div className="mt-10 flex items-center gap-3">
            <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 font-medium tracking-wide">
              {t("explore")}
            </Button>
            <Button size="lg" variant="ghost" className="tracking-wide" onClick={() => go(-1)}>
              {t("back")}
            </Button>
          </div>
        </div>
      </div>

      {products.length > 1 && (
        <div className="mt-12 flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => go(-1)} aria-label={t("previous")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 flex items-center gap-3">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className="group relative h-[2px] flex-1 bg-border overflow-hidden"
                aria-label={`Product ${i + 1}`}
              >
                <span
                  className="absolute inset-y-0 left-0 bg-gold transition-[width] ease-linear"
                  style={{ width: i < idx ? "100%" : i === idx ? `${progress * 100}%` : "0%" }}
                />
              </button>
            ))}
          </div>
          <Button variant="ghost" size="icon" onClick={() => go(1)} aria-label={t("next")}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </section>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-foreground/90">{value}</dd>
    </div>
  );
}