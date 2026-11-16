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
import {
  FaArrowLeft,
  FaArrowRight,
  FaBan,
  FaBullhorn,
  FaCreditCard,
  FaInfinity,
  FaLock,
} from "react-icons/fa6";

import FriendCubesHero from "@/components/friendPlan/FriendCubesHero";
import { useWizard, WizardSlide, WizardSteps } from "@/components/wizard/Wizard";
import { createFriendGroup } from "@/services/friendGroupServices";
import {
  FRIEND_PLAN_WELCOME,
  FriendPlanOptions,
  money,
} from "@/types/friendGroupTypes";
import { FRIEND_PLAN } from "@/utils/data/urls";
import { toastifyError } from "@/utils/functions/toastify";

const STEPS = [
  { step: 1, label: "Cómo funciona" },
  { step: 2, label: "Cuánto pagan" },
];

/*
Presentación de Hacete Amigo como asistente de dos pasos, sin scroll:
1) la animación de los Cubitos con el mensaje de bienvenida;
2) cuánto paga cada uno (tabla con la configuración real del server para el
   plan elegido), las condiciones y el botón para armar el grupo.
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
  const { step, direction, go } = useWizard(1);
  const [planId, setPlanId] = useState(options.plans[0]?.mpPreapprovalPlanId ?? "");
  const [busy, setBusy] = useState(false);
  // En celular las condiciones van plegadas para que el paso entre sin scroll.
  const [showConditions, setShowConditions] = useState(false);
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

  if (options.plans.length === 0 || !plan) {
    return (
      <Card shadow="sm">
        <CardBody>
          <p className="text-sm">En este momento no hay planes para Hacete Amigo.</p>
        </CardBody>
      </Card>
    );
  }

  const invitations =
    invitationsCount > 0 ? (
      <Link href={FRIEND_PLAN} size="sm">
        Tenés {invitationsCount} {invitationsCount === 1 ? "invitación" : "invitaciones"} a
        grupos
      </Link>
    ) : (
      <span />
    );

  return (
    <div className="flex flex-col gap-3 w-full">
      <WizardSteps steps={STEPS} current={step} onSelect={go} />

      <WizardSlide step={step} direction={direction}>
          {step === 1 ? (
            <Card shadow="sm">
              <CardBody className="flex flex-col gap-3 p-3 sm:p-4">
                <FriendCubesHero
                  planAmount={plan.planAmount}
                  tiers={plan.tiers}
                  maxMembers={options.maxMembers}
                />
                <p className="text-base md:text-lg font-medium text-center px-2">
                  {FRIEND_PLAN_WELCOME}
                </p>
                <div className="flex flex-col-reverse items-start gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  {invitations}
                  <Button
                    color="primary"
                    radius="full"
                    className="w-full sm:w-auto"
                    endContent={<FaArrowRight />}
                    onPress={() => go(2)}
                  >
                    Siguiente
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card shadow="sm">
              <CardBody className="flex flex-col gap-3 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
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
                </div>
                <p className="text-sm">
                  {plan.planReason} solo: <strong>{money(plan.planAmount)}</strong> por mes.
                  <span className="hidden sm:inline"> Con amigos, cada uno paga menos:</span>
                </p>

                <Table aria-label="Precio según la cantidad de miembros" removeWrapper isCompact>
                  <TableHeader>
                    <TableColumn>Miembros</TableColumn>
                    <TableColumn>Descuento</TableColumn>
                    <TableColumn>Cada uno por mes</TableColumn>
                    <TableColumn className="hidden sm:table-cell">Débito del grupo</TableColumn>
                  </TableHeader>
                  <TableBody items={plan.tiers}>
                    {(tier) => (
                      <TableRow key={tier.members}>
                        <TableCell>
                          {tier.members}
                          {tier === plan.tiers[plan.tiers.length - 1] && options.maxMembers === 0
                            ? " o más"
                            : ""}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-primary">{tier.discountPercent} %</span>
                        </TableCell>
                        <TableCell>
                          <strong>{money(tier.pricePerMember)}</strong>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {money(tier.totalAmount)}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <button
                  type="button"
                  className="sm:hidden self-start text-sm text-primary font-medium"
                  aria-expanded={showConditions}
                  onClick={() => setShowConditions((value) => !value)}
                >
                  {showConditions ? "Ocultar condiciones" : "Ver condiciones"}
                </button>
                <ul
                  className={`${showConditions ? "grid" : "hidden"} sm:grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-xs sm:text-sm text-default-600`}
                >
                  <Condition icon={<FaCreditCard />}>
                    Uno paga por todos con débito automático.
                  </Condition>
                  <Condition icon={<FaInfinity />}>El descuento es para siempre.</Condition>
                  <Condition icon={<FaBullhorn />}>
                    Al menos {options.minMembers}, cada uno con un anuncio o una producción.
                  </Condition>
                  <Condition icon={<FaBan />}>
                    Para quien no tiene plan pago (si tenés uno, cancelalo antes).
                  </Condition>
                  <Condition icon={<FaLock />}>
                    Pagado, el grupo queda fijo: si alguien se baja, se cancela para todos.
                  </Condition>
                </ul>

                <div className="flex flex-col-reverse items-start gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    variant="light"
                    radius="full"
                    startContent={<FaArrowLeft />}
                    onPress={() => go(1)}
                  >
                    Atrás
                  </Button>
                  {hasGroup ? (
                    <Button
                      as={Link}
                      href={FRIEND_PLAN}
                      color="primary"
                      radius="full"
                      className="w-full sm:w-auto"
                    >
                      Ir a mi grupo
                    </Button>
                  ) : (
                    <Button
                      color="primary"
                      radius="full"
                      className="w-full sm:w-auto"
                      isLoading={busy}
                      onPress={create}
                    >
                      <span className="sm:hidden">Armar mi grupo</span>
                      <span className="hidden sm:inline">Armar mi grupo con {plan.planReason}</span>
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
      </WizardSlide>
    </div>
  );
}

function Condition({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-primary mt-0.5 shrink-0">{icon}</span>
      <span>{children}</span>
    </li>
  );
}
