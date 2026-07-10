import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Home,
  LogOut,
  Pencil,
  Plus,
  Store,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { productsQuery } from "@/hooks/use-products";
import { resolveImage, type Product } from "@/lib/products";
import { useI18n } from "@/lib/i18n";

import { AdminCustomers } from "@/components/admin-customers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      {
        title: "KAPTAN — Product Management",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: AdminPage,
});

type Draft = Partial<Product>;

const emptyProduct: Draft = {
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
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkAdminAccess() {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (!active) return;

      if (sessionError || !sessionData.session) {
        navigate({
          to: "/auth",
          replace: true,
        });
        return;
      }

      const { data, error } = await supabase.rpc("has_role", {
        _user_id: sessionData.session.user.id,
        _role: "admin",
      });

      if (!active) return;

      if (error) {
        console.error("Admin role check failed:", error);
        toast.error(error.message);
        setIsAdmin(false);
      } else {
        setIsAdmin(data === true);
      }

      setAuthChecked(true);
    }

    checkAdminAccess();

    return () => {
      active = false;
    };
  }, [navigate]);

  const productsQueryResult = useQuery({
    ...productsQuery(),
    enabled: authChecked && isAdmin,
  });

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(error.message);
      return;
    }

    navigate({
      to: "/auth",
      replace: true,
    });
  };

  const saveProduct = async (draft: Draft) => {
    if (!draft.image_url) {
      toast.error("Please upload a product image.");
      return;
    }

    if (!draft.title_en?.trim()) {
      toast.error("English product title is required.");
      return;
    }

    if (!draft.title_de?.trim()) {
      toast.error("German product title is required.");
      return;
    }

    if (!draft.description_en?.trim()) {
      toast.error("English description is required.");
      return;
    }

    if (!draft.description_de?.trim()) {
      toast.error("German description is required.");
      return;
    }

    setSaving(true);

    const payload = {
      image_url: draft.image_url,
      category: draft.category?.trim() || "BAGS",
      price: Number(draft.price) || 0,
      in_stock: Boolean(draft.in_stock),
      quantity: Number(draft.quantity) || 0,
      size: draft.size?.trim() || null,
      title_en: draft.title_en.trim(),
      title_de: draft.title_de.trim(),
      description_en: draft.description_en.trim(),
      description_de: draft.description_de.trim(),
      material_en: draft.material_en?.trim() || null,
      material_de: draft.material_de?.trim() || null,
      color_en: draft.color_en?.trim() || null,
      color_de: draft.color_de?.trim() || null,
      notes_en: draft.notes_en?.trim() || null,
      notes_de: draft.notes_de?.trim() || null,
      sort_order: Number(draft.sort_order) || 0,
      updated_at: new Date().toISOString(),
    };

    try {
      const result = draft.id
        ? await supabase
            .from("products")
            .update(payload)
            .eq("id", draft.id)
        : await supabase.from("products").insert(payload);

      if (result.error) {
        throw result.error;
      }

      toast.success(draft.id ? "Product updated" : "Product created");
      setEditing(null);

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save product.",
      );
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Delete "${product.title_en}" permanently?`,
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Product deleted");

    await queryClient.invalidateQueries({
      queryKey: ["products"],
    });
  };

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 pt-24">
        <p className="text-sm text-muted-foreground">
          Checking administrator access...
        </p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 pt-24">
        <div className="glass w-full max-w-md rounded-2xl p-8 text-center">
          <h1 className="font-serif text-3xl">Access denied</h1>

          <p className="mt-3 text-muted-foreground">
            Your account does not have administrator privileges.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="outline">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Go to homepage
              </Link>
            </Button>

            <Button variant="ghost" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const products = productsQueryResult.data ?? [];

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 pb-20 pt-28">
      <section className="mb-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to homepage
        </Link>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs tracking-[0.45em] text-gold">KAPTAN</p>

            <h1 className="mt-2 font-serif text-4xl sm:text-5xl">
              Product Management
            </h1>

            <p className="mt-3 max-w-xl text-sm text-muted-foreground">
              Manage products, upload images and review customer enquiries.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/">
                <Store className="mr-2 h-4 w-4" />
                View website
              </Link>
            </Button>

            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </section>

      <Tabs defaultValue="products">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="products">
              Products
            </TabsTrigger>

            <TabsTrigger value="customers">
              Customers
            </TabsTrigger>
          </TabsList>

          <Button
            onClick={() => setEditing({ ...emptyProduct })}
            className="bg-gold text-gold-foreground hover:bg-gold/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add product
          </Button>
        </div>

        <TabsContent value="products" className="mt-8">
          {productsQueryResult.isLoading ? (
            <div className="glass rounded-xl p-8 text-center text-muted-foreground">
              Loading products...
            </div>
          ) : productsQueryResult.isError ? (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-destructive">
                Unable to load products.
              </p>

              <Button
                variant="outline"
                className="mt-4"
                onClick={() => productsQueryResult.refetch()}
              >
                Try again
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="glass rounded-xl p-10 text-center">
              <h2 className="font-serif text-2xl">No products yet</h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Add your first leather product or Himalayan salt lamp.
              </p>

              <Button
                className="mt-6 bg-gold text-gold-foreground hover:bg-gold/90"
                onClick={() => setEditing({ ...emptyProduct })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add first product
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="glass flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-center"
                >
                  <img
                    src={resolveImage(product.image_url)}
                    alt={product.title_en}
                    className="h-24 w-full rounded-lg bg-secondary object-cover sm:h-16 sm:w-16"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] tracking-[0.3em] text-muted-foreground">
                      {product.category}
                    </p>

                    <h2 className="mt-1 truncate font-serif text-lg">
                      {product.title_en}
                      <span className="text-muted-foreground">
                        {" "}
                        · {product.title_de}
                      </span>
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                      €{Number(product.price).toFixed(2)}
                      {" · "}
                      Quantity {product.quantity}
                      {" · "}
                      {product.in_stock ? "In stock" : "Out of stock"}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${product.title_en}`}
                      onClick={() => setEditing(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${product.title_en}`}
                      onClick={() => removeProduct(product)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="customers">
          <AdminCustomers />
        </TabsContent>
      </Tabs>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open && !saving) {
            setEditing(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editing?.id ? "Edit product" : "Add product"}
            </DialogTitle>
          </DialogHeader>

          {editing ? (
            <ProductForm
              draft={editing}
              onChange={setEditing}
              disabled={saving}
            />
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={saving || !editing}
              onClick={() => {
                if (editing) {
                  saveProduct(editing);
                }
              }}
              className="bg-gold text-gold-foreground hover:bg-gold/90"
            >
              {saving ? "Saving..." : "Save product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function ProductForm({
  draft,
  onChange,
  disabled,
}: {
  draft: Draft;
  onChange: (draft: Draft) => void;
  disabled: boolean;
}) {
  const [uploading, setUploading] = useState(false);

  const updateDraft = (patch: Draft) => {
    onChange({
      ...draft,
      ...patch,
    });
  };

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    const maximumSize = 10 * 1024 * 1024;

    if (file.size > maximumSize) {
      toast.error("The image must be smaller than 10 MB.");
      return;
    }

    setUploading(true);

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "jpg";
      const fileName = `${crypto.randomUUID()}.${safeExtension}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      updateDraft({
        image_url: data.publicUrl,
      });

      toast.success("Image uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Image upload failed.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5 py-2">
      <div>
        <Label>Product image</Label>

        {draft.image_url ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-border bg-secondary">
            <img
              src={resolveImage(draft.image_url)}
              alt="Product preview"
              className="h-56 w-full object-contain"
            />
          </div>
        ) : null}

        <label
          className={`mt-3 flex min-h-32 items-center justify-center rounded-xl border border-dashed border-border p-6 text-center transition-colors ${
            uploading || disabled
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer hover:bg-secondary/40"
          }`}
        >
          <div>
            <Upload className="mx-auto h-6 w-6 text-gold" />

            <p className="mt-2 text-sm font-medium">
              {uploading
                ? "Uploading image..."
                : draft.image_url
                  ? "Upload a replacement image"
                  : "Click to upload image"}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG or WEBP. Maximum 10 MB.
            </p>
          </div>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={uploading || disabled}
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                uploadImage(file);
              }

              event.target.value = "";
            }}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Category"
          value={draft.category}
          disabled={disabled}
          onChange={(value) =>
            updateDraft({
              category: value,
            })
          }
        />

        <TextField
          label="Size"
          value={draft.size ?? ""}
          disabled={disabled}
          onChange={(value) =>
            updateDraft({
              size: value,
            })
          }
        />

        <NumberField
          label="Price (EUR)"
          value={draft.price ?? 0}
          step="0.01"
          disabled={disabled}
          onChange={(value) =>
            updateDraft({
              price: value,
            })
          }
        />

        <NumberField
          label="Quantity"
          value={draft.quantity ?? 0}
          step="1"
          disabled={disabled}
          onChange={(value) =>
            updateDraft({
              quantity: value,
            })
          }
        />

        <NumberField
          label="Sort order"
          value={draft.sort_order ?? 0}
          step="1"
          disabled={disabled}
          onChange={(value) =>
            updateDraft({
              sort_order: value,
            })
          }
        />

        <div className="flex items-end">
          <label className="flex min-h-10 items-center gap-3 text-sm">
            <input
              id="in-stock"
              type="checkbox"
              checked={Boolean(draft.in_stock)}
              disabled={disabled}
              onChange={(event) =>
                updateDraft({
                  in_stock: event.target.checked,
                })
              }
            />

            <span>In stock</span>
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Title (English)"
          value={draft.title_en}
          disabled={disabled}
          onChange={(value) =>
            updateDraft({
              title_en: value,
            })
          }
        />

        <TextField
          label="Title (German)"
          value={draft.title_de}
          disabled={disabled}
          onChange={(value) =>
            updateDraft({
              title_de: value,
            })
          }
        />

        <TextField
          label="Color (English)"
          value={draft.color_en ?? ""}
          disabled={disabled}
          onChange={(value) =>
            updateDraft({
              color_en: value,
            })
          }
        />

        <TextField
          label="Color (German)"
          value={draft.color_de ?? ""}
          disabled={disabled}
          onChange={(value) =>
            updateDraft({
              color_de: value,
            })
          }
        />

        <TextField
          label="Material (English)"
          value={draft.material_en ?? ""}
          disabled={disabled}
          onChange={(value) =>
            updateDraft({
              material_en: value,
            })
          }
        />

        <TextField
          label="Material (German)"
          value={draft.material_de ?? ""}
          disabled={disabled}
          onChange={(value) =>
            updateDraft({
              material_de: value,
            })
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextAreaField
          label="Description (English)"
          value={draft.description_en}
          disabled={disabled}
          onChange={(value) =>
            updateDraft({
              description_en: value,
            })
          }
        />

        <TextAreaField
          label="Description (German)"
          value={draft.description_de}
          disabled={disabled}
          onChange={(value) =>
            updateDraft({
              description_de: value,
            })
          }
        />

        <TextAreaField
          label="Notes (English)"
          value={draft.notes_en ?? ""}
          disabled={disabled}
          onChange={(value) =>
            updateDraft({
              notes_en: value,
            })
          }
        />

        <TextAreaField
          label="Notes (German)"
          value={draft.notes_de ?? ""}
          disabled={disabled}
          onChange={(value) =>
            updateDraft({
              notes_de: value,
            })
          }
        />
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>

      <Input
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  step,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  step: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>

      <Input
        type="number"
        min="0"
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>

      <Textarea
        rows={4}
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}