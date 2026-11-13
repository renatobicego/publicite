"use client";

import {
  Button,
  Card,
  CardBody,
  Link,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaUserGroup } from "react-icons/fa6";

import { createFriendGroup } from "@/services/friendGroupServices";
import {
  FRIEND_PLAN_WELCOME,
  FriendPlanOptions,
  money,
} from "@/types/friendGroupTypes";
import { FRIEND_PLAN } from "@/utils/data/urls";
import { toastifyError } from "@/utils/functions/toastify";

/*
Presentación de Hacete Amigo: el mensaje de bienvenida, la tabla de descuentos
calculada con la configuración real del server para cada plan y el botón para
armar el grupo.
*/
export default function FriendPlanLanding({
  options,
  hasGroup,
  invitationsCount,
}: {
  options: FriendPlanOptions;
  hasGroup: boolean;
  invitationsCount: number;
}) {
  const router = useRouter();
  const [planId, setPlanId] = useState(options.plans[0]?.mpPreapprovalPlanId ?? "");
  const [busy, setBusy] = useState(false);
  const plan = options.plans.find((option) => option.mpPreapprovalPlanId === planId);

  const create = async () => {
    if (!plan) return;
    setBusy(true);
    const response = await createFriendGroup(plan.mpPreapprovalPlanId);
    setBusy(false);
    if ("error" in response) {
      toastifyError(response.error);
      return;
    }
    router.push(FRIEND_PLAN);
  };

  const lastTier = plan?.tiers[plan.tiers.length - 1];

  return (
    <div className="flex flex-col gap-6 w-full">
      <Card shadow="sm" className="bg-primary/5">
        <CardBody className="flex flex-row gap-4 items-center">
          <FaUserGroup className="text-primary size-10 shrink-0" />
          <p className="text-base md:text-lg font-medium">{FRIEND_PLAN_WELCOME}</p>
        </CardBody>
      </Card>

      <ul className="list-disc pl-5 text-sm flex flex-col gap-1">
        <li>Uno del grupo paga por todos, todos los meses, con débito automático.</li>
        <li>El descuento es para siempre y depende de cuántos son.</li>
        <li>
          Para pagar tienen que ser al menos {options.minMembers}, y cada uno tiene
          que haber publicado un anuncio o una producción.
        </li>
        <li>Es para quien no tiene un plan pago: si tenés uno, primero cancelalo.</li>
        <li>
          Una vez pagado, el grupo queda fijo: si alguien se baja, se cancela el
          plan para todos.
        </li>
      </ul>

      {options.plans.length === 0 ? (
        <p className="text-sm">En este momento no hay planes para Hacete Amigo.</p>
      ) : (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">¿Cuánto paga cada uno?</h2>
          {options.plans.length > 1 && (
            <Tabs
              aria-label="Plan"
              selectedKey={planId}
              onSelectionChange={(key) => setPlanId(String(key))}
              radius="full"
              size="sm"
            >
              {options.plans.map((option) => (
                <Tab key={option.mpPreapprovalPlanId} title={option.planReason} />
              ))}
            </Tabs>
          )}
          {plan && (
            <>
              <p className="text-sm">
                {plan.planReason} solo: <strong>{money(plan.planAmount)}</strong> por
                mes.
              </p>
              <Table aria-label="Precio según la cantidad de miembros" removeWrapper>
                <TableHeader>
                  <TableColumn>Miembros</TableColumn>
                  <TableColumn>Descuento</TableColumn>
                  <TableColumn>Cada uno por mes</TableColumn>
                  <TableColumn>Débito mensual del grupo</TableColumn>
                </TableHeader>
                <TableBody items={plan.tiers}>
                  {(tier) => (
                    <TableRow key={tier.members}>
                      <TableCell>
                        {tier.members}
                        {tier === lastTier && options.maxMembers === 0 ? " o más" : ""}
                      </TableCell>
                      <TableCell>{tier.discountPercent} %</TableCell>
                      <TableCell>{money(tier.pricePerMember)}</TableCell>
                      <TableCell>{money(tier.totalAmount)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </section>
      )}

      {hasGroup ? (
        <Button as={Link} href={FRIEND_PLAN} color="primary" radius="full" className="self-start">
          Ir a mi grupo
        </Button>
      ) : (
        <div className="flex flex-wrap gap-3 items-center">
          <Button
            color="primary"
            radius="full"
            isDisabled={!plan}
            isLoading={busy}
            onPress={create}
          >
            Armar mi grupo{plan ? ` con ${plan.planReason}` : ""}
          </Button>
          {invitationsCount > 0 && (
            <Link href={FRIEND_PLAN} size="sm">
              Tenés {invitationsCount}{" "}
              {invitationsCount === 1 ? "invitación" : "invitaciones"} a grupos
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
