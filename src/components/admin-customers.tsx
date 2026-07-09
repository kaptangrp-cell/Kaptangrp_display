import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  interested_in: string | null;
  notes: string | null;
  created_at: string;
};

export function AdminCustomers() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["customers"],
    queryFn: async (): Promise<Customer[]> => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, email, phone, interested_in, notes, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Customer[];
    },
  });

  const remove = async (id: string) => {
    if (!confirm(t("confirm_delete"))) return;
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["customers"] });
  };

  const rows = q.data ?? [];
  return (
    <div className="mt-8">
      <h2 className="font-serif text-2xl">{t("customers_title")}</h2>
      {rows.length === 0 ? (
        <p className="text-muted-foreground mt-6">{t("no_customers")}</p>
      ) : (
        <div className="mt-6 grid gap-3">
          {rows.map((c) => (
            <div key={c.id} className="glass rounded-xl p-4 flex flex-wrap items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-serif text-lg">{c.name}</p>
                <p className="text-sm text-muted-foreground break-all">
                  {c.email}{c.phone ? ` · ${c.phone}` : ""}
                </p>
                {c.interested_in && (
                  <p className="text-xs mt-1 tracking-wide">
                    <span className="text-gold">{t("interested_in")}:</span> {c.interested_in}
                  </p>
                )}
                {c.notes && <p className="text-sm mt-2 text-muted-foreground">{c.notes}</p>}
                <p className="text-[10px] mt-2 text-muted-foreground tracking-widest">
                  {new Date(c.created_at).toLocaleString()}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(c.id)} aria-label="delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}