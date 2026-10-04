import Link from "next/link";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { getMyProductionTicketPurchases } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import ErrorCard from "@/components/ErrorCard";
import { PRODUCTIONS } from "@/utils/data/urls";
import {
  purchaseStatusColor,
  purchaseStatusLabel,
} from "../productionTicketStatus";

/** "Mis tickets": historial de compras del usuario (TKT-08). */
export default async function MyProductionTicketsPage() {
  const result = await getMyProductionTicketPurchases();

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8">
      <h2>Mis tickets</h2>

      {isProductionActionError(result) ? (
        <ErrorCard message={result.error} />
      ) : result.purchases.length === 0 ? (
        <p className="text-sm text-default-500">
          Todavía no compraste ningún ticket.
        </p>
      ) : (
        <div className="w-full flex flex-col gap-3">
          {result.purchases.map((purchase) => (
            <Card key={purchase._id} shadow="sm">
              <CardBody className="flex flex-row items-center justify-between gap-4 flex-wrap">
                <div className="flex flex-col">
                  <Link
                    href={`${PRODUCTIONS}/${purchase.production}`}
                    className="font-medium hover:text-primary"
                  >
                    {purchase.productionTitle}
                  </Link>
                  <span className="text-xs text-default-500">
                    {purchase.targetName || "Todo el blog"} ·{" "}
                    {purchase.isPaid
                      ? `${purchase.currency} ${purchase.amount}`
                      : "Gratuito"}
                  </span>
                  {purchase.expiresAt && (
                    <span className="text-xs text-default-400">
                      Vence:{" "}
                      {new Date(purchase.expiresAt).toLocaleDateString("es-AR")}
                    </span>
                  )}
                  {purchase.reviewRequired && !purchase.reviewedAt && (
                    <span className="text-xs text-warning">
                      Reseña pendiente
                    </span>
                  )}
                </div>
                <Chip
                  color={purchaseStatusColor[purchase.status]}
                  variant="flat"
                  size="sm"
                >
                  {purchaseStatusLabel[purchase.status]}
                </Chip>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
