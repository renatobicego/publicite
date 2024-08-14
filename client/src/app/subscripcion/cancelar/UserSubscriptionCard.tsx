"use client";
import { Button } from "@nextui-org/react";
import React from "react";
import { editSubscription } from "../services";

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
    </div>
  );
};

export default UserSubscriptionCard;
