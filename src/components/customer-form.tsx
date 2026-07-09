import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  interested_in: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  consent: z.literal(true),
});

export function CustomerForm() {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", interested_in: "", notes: "", consent: true,
  });
  const [loading, setLoading] = useState(false);

  const upd = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("customers").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      interested_in: parsed.data.interested_in || null,
      notes: parsed.data.notes || null,
      consent: true,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("contact_success"));
    setForm({ name: "", email: "", phone: "", interested_in: "", notes: "", consent: true });
  };

  return (
    <section id="contact" className="mx-auto max-w-3xl px-6 py-24">
      <div className="text-center">
        <p className="text-xs tracking-[0.4em] text-gold">KAPTAN</p>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl">{t("stay_in_touch")}</h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">{t("stay_in_touch_desc")}</p>
      </div>
      <form onSubmit={submit} className="glass rounded-2xl p-6 md:p-10 mt-10 space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="c-name">{t("full_name")}</Label>
            <Input id="c-name" required maxLength={120} value={form.name} onChange={(e) => upd("name", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="c-email">{t("email")}</Label>
            <Input id="c-email" type="email" required maxLength={255} value={form.email} onChange={(e) => upd("email", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="c-phone">{t("phone")}</Label>
            <Input id="c-phone" type="tel" maxLength={40} value={form.phone} onChange={(e) => upd("phone", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="c-interest">{t("interested_in")}</Label>
            <Input id="c-interest" maxLength={120} placeholder={t("interested_placeholder")} value={form.interested_in} onChange={(e) => upd("interested_in", e.target.value)} />
          </div>
        </div>
        <div>
          <Label htmlFor="c-notes">{t("message_optional")}</Label>
          <Textarea id="c-notes" maxLength={1000} rows={3} value={form.notes} onChange={(e) => upd("notes", e.target.value)} />
        </div>
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="mt-1 accent-[color:var(--gold,#d4af37)]"
            checked={form.consent}
            onChange={(e) => upd("consent", e.target.checked)}
            required
          />
          <span>{t("consent_label")}</span>
        </label>
        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="bg-gold text-gold-foreground hover:bg-gold/90">
            {t("submit_contact")}
          </Button>
        </div>
      </form>
    </section>
  );
}