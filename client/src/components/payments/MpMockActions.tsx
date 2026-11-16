"use client";

import { Button, Card, CardBody } from "@nextui-org/react";
import { useState } from "react";

import {
  MpMockFriendGroupEvent,
  mpMockFriendGroupEvent,
  mpMockRefundGift,
} from "@/services/mpMockServices";
import { isMpMock } from "@/utils/functions/mpMock";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";

/*
Botones para simular avisos de MercadoPago. Sólo aparecen en desarrollo local
con MP simulado (NEXT_PUBLIC_MP_MOCK=true); en producción no se renderizan.
*/

const GROUP_EVENTS: { event: MpMockFriendGroupEvent; label: string; when: string[] }[] = [
  { event: "charge_failed", label: "Cobro rechazado", when: ["active", "paying"] },
  { event: "charge_recovered", label: "Cobro recuperado", when: ["paymentFailed"] },
  {
    event: "payment_failed_expired",
    label: "Pasó el plazo sin cobrar",
    when: ["paymentFailed"],
  },
  {
    event: "cancelled_in_mp",
    label: "Débito cancelado en MP",
    when: ["active", "paying", "paymentFailed"],
  },
];

export function FriendGroupMockActions({
  groupId,
  status,
  onDone,
}: {
  groupId: string;
  status: string;
  onDone: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  if (!isMpMock()) return null;
  const events = GROUP_EVENTS.filter((item) => item.when.includes(status));
  if (events.length === 0) return null;

  const simulate = async (event: MpMockFriendGroupEvent) => {
    setBusy(event);
    const response = await mpMockFriendGroupEvent(groupId, event);
    setBusy(null);
    if ("error" in response) {
      toastifyError(response.error);
      return;
    }
    toastifySuccess("Aviso de MercadoPago simulado.");
    await onDone();
  };

  return (
    <MockFrame>
      <div className="flex flex-wrap gap-2">
        {events.map((item) => (
          <Button
            key={item.event}
            size="sm"
            radius="full"
            variant="bordered"
            color="warning"
            isLoading={busy === item.event}
            onPress={() => simulate(item.event)}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </MockFrame>
  );
}

export function GiftMockRefund({
  giftId,
  onDone,
}: {
  giftId: string;
  onDone: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState(false);
  if (!isMpMock()) return null;

  const refund = async () => {
    setBusy(true);
    const response = await mpMockRefundGift(giftId);
    setBusy(false);
    if ("error" in response) {
      toastifyError(response.error);
      return;
    }
    toastifySuccess("Devolución simulada.");
    await onDone();
  };

  return (
    <MockFrame>
      <Button size="sm" radius="full" variant="bordered" color="warning" isLoading={busy} onPress={refund}>
        Devolver el pago (desde MP)
      </Button>
    </MockFrame>
  );
}

function MockFrame({ children }: { children: React.ReactNode }) {
  return (
    <Card shadow="none" className="border border-dashed border-warning">
      <CardBody className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-warning-600">
          Simular aviso de MercadoPago (sólo local)
        </span>
        {children}
      </CardBody>
    </Card>
  );
}
