"use client";
import { editSubscription } from "@/app/services/subscriptionServices";
import { Button, Link } from "@nextui-org/react";
import React from "react";

const UserSubscriptionCard = ({ subscription }: { subscription: any }) => {
  const handleChangeStatus = async (
    id: string,
    status: "authorized" | "paused" | "cancelled"
  ) => {
    await editSubscription(id, {
      status,
    });
  };

  return (
    <div>
      <p>{subscription.reason}</p>
      <p>{subscription.status}</p>
      <Button onClick={() => handleChangeStatus(subscription.id, "authorized")}>
        Activar
      </Button>
      <Button onClick={() => handleChangeStatus(subscription.id, "paused")}>
        Pausar
      </Button>
      <Button onClick={() => handleChangeStatus(subscription.id, "cancelled")}>
        Cancelar
      </Button>
      <Button as={Link} href={`/subscripcion/editar/${subscription.id}`}>
        Editar
      </Button>
    </div>
  );
};

export default UserSubscriptionCard;
