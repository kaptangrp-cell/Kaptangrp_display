import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { productsQuery } from "@/hooks/use-products";
import { ProductShowcase } from "@/components/product-showcase";
import { CustomerForm } from "@/components/customer-form";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery());
  },
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(productsQuery());
  const { t } = useI18n();
  if (!data.length) {
    return (
      <>
        <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground pt-20">
          {t("no_products")}
        </div>
        <CustomerForm />
      </>
    );
  }
  return (
    <>
      <ProductShowcase products={data} />
      <CustomerForm />
    </>
  );
}
