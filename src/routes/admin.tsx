import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { productsQuery } from "@/hooks/use-products";
import { resolveImage, type Product } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminCustomers } from "@/components/admin-customers";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "KAPTAN — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type Draft = Partial<Product>;

const empty: Draft = {
  image_url: "",
  category: "BAGS",
  price: 0,
  in_stock: true,
  quantity: 1,
  size: "",
  title_en: "",
  title_de: "",
  description_en: "",
  description_de: "",
  material_en: "",
  material_de: "",
  color_en: "",
  color_de: "",
  notes_en: "",
  notes_de: "",
  sort_order: 0,
};

function AdminPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const qc = useQueryClient();

  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState<Draft | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        navigate({ to: "/auth", replace: true });
        return;
      }

      const userId = sessionData.session.user.id;

      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });

      if (error) {
        console.error(error);
        toast.error(error.message);
        setIsAdmin(false);
      } else {
        setIsAdmin(data === true);
      }

      setChecked(true);
    }

    checkAdmin();
  }, [navigate]);

  const q = useQuery({ ...productsQuery(), enabled: checked && isAdmin });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (!checked) {
    return <div className="pt-32 text-center text-muted-foreground">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="pt-32 text-center space-y-3">
        <p className="text-muted-foreground">Insufficient privileges.</p>
        <Button variant="ghost" onClick={signOut}>
          Sign out
        </Button>
      </div>
    );
  }

  const save = async (d: Draft) => {
    const payload = {
      image_url: d.image_url || "/src/assets/product-messenger.jpg",
      category: d.category || "BAGS",
      price: Number(d.price) || 0,
      in_stock: !!d.in_stock,
      quantity: Number(d.quantity) || 0,
      size: d.size || null,
      title_en: d.title_en || "",
      title_de: d.title_de || "",
      description_en: d.description_en || "",
      description_de: d.description_de || "",
      material_en: d.material_en || null,
      material_de: d.material_de || null,
      color_en: d.color_en || null,
      color_de: d.color_de || null,
      notes_en: d.notes_en || null,
      notes_de: d.notes_de || null,
      sort_order: Number(d.sort_order) || 0,
    };

    const { error } = d.id
      ? await supabase.from("products").update(payload).eq("id", d.id)
      : await supabase.from("products").insert(payload);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(d.id ? "Updated" : "Created");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const remove = async (id: string) => {
    if (!confirm(t("confirm_delete"))) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs tracking-[0.4em] text-gold">KAPTAN</p>
          <h1 className="font-serif text-4xl mt-2">{t("admin_dashboard")}</h1>
        </div>

        <Button variant="ghost" onClick={signOut}>
          Sign out
        </Button>
      </div>

      <Tabs defaultValue="products" className="mt-10">
        <TabsList>
          <TabsTrigger value="products">{t("tab_products")}</TabsTrigger>
          <TabsTrigger value="customers">{t("tab_customers")}</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => setEditing({ ...empty })}
              className="bg-gold text-gold-foreground hover:bg-gold/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("add_product")}
            </Button>
          </div>

          <div className="mt-6 grid gap-3">
            {(q.data ?? []).map((p) => (
              <div key={p.id} className="glass rounded-xl p-4 flex items-center gap-4">
                <img
                  src={resolveImage(p.image_url)}
                  alt={p.title_en}
                  className="h-16 w-16 object-cover rounded-lg bg-secondary"
                />

                <div className="flex-1 min-w-0">
                  <p className="text-[10px] tracking-[0.3em] text-muted-foreground">{p.category}</p>
                  <p className="font-serif text-lg truncate">
                    {p.title_en} · {p.title_de}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    €{p.price} · qty {p.quantity}
                  </p>
                </div>

                <Button variant="ghost" size="icon" onClick={() => setEditing(p)}>
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="icon" onClick={() => remove(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="customers">
          <AdminCustomers />
        </TabsContent>
      </Tabs>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editing?.id ? t("edit") : t("add_product")}
            </DialogTitle>
          </DialogHeader>

          {editing && <ProductForm draft={editing} onChange={setEditing} />}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              {t("cancel")}
            </Button>
            <Button onClick={() => save(editing!)} className="bg-gold text-gold-foreground hover:bg-gold/90">
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductForm({ draft, onChange }: { draft: Draft; onChange: (d: Draft) => void }) {
  const { t } = useI18n();

  const upd = (patch: Draft) => onChange({ ...draft, ...patch });

  return (
    <div className="space-y-4 py-2">
      <TextField label={t("image_url")} value={draft.image_url} onChange={(v) => upd({ image_url: v })} />

      <div className="grid grid-cols-2 gap-3">
        <TextField label={t("category")} value={draft.category} onChange={(v) => upd({ category: v })} />
        <TextField label={t("size")} value={draft.size ?? ""} onChange={(v) => upd({ size: v })} />

        <div>
          <Label>{t("price")}</Label>
          <Input type="number" step="0.01" value={draft.price ?? 0} onChange={(e) => upd({ price: Number(e.target.value) })} />
        </div>

        <div>
          <Label>{t("quantity")}</Label>
          <Input type="number" value={draft.quantity ?? 0} onChange={(e) => upd({ quantity: Number(e.target.value) })} />
        </div>

        <div>
          <Label>{t("sort_order")}</Label>
          <Input type="number" value={draft.sort_order ?? 0} onChange={(e) => upd({ sort_order: Number(e.target.value) })} />
        </div>

        <div className="flex items-end gap-2">
          <input id="in_stock" type="checkbox" checked={!!draft.in_stock} onChange={(e) => upd({ in_stock: e.target.checked })} />
          <Label htmlFor="in_stock">{t("in_stock")}</Label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField label={t("title_en")} value={draft.title_en} onChange={(v) => upd({ title_en: v })} />
        <TextField label={t("title_de")} value={draft.title_de} onChange={(v) => upd({ title_de: v })} />
        <TextField label={t("color_en")} value={draft.color_en ?? ""} onChange={(v) => upd({ color_en: v })} />
        <TextField label={t("color_de")} value={draft.color_de ?? ""} onChange={(v) => upd({ color_de: v })} />
        <TextField label={t("material_en")} value={draft.material_en ?? ""} onChange={(v) => upd({ material_en: v })} />
        <TextField label={t("material_de")} value={draft.material_de ?? ""} onChange={(v) => upd({ material_de: v })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextArea label={t("description_en")} value={draft.description_en} onChange={(v) => upd({ description_en: v })} />
        <TextArea label={t("description_de")} value={draft.description_de} onChange={(v) => upd({ description_de: v })} />
        <TextArea label={t("notes_en")} value={draft.notes_en ?? ""} onChange={(v) => upd({ notes_en: v })} />
        <TextArea label={t("notes_de")} value={draft.notes_de ?? ""} onChange={(v) => upd({ notes_de: v })} />
      </div>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function TextArea({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={3} />
    </div>
  );
}