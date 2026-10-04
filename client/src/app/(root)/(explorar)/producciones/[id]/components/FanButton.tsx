"use client";
import { useState } from "react";
import { Button } from "@nextui-org/react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toastifyError } from "@/utils/functions/toastify";
import {
  becomeProductionFan,
  stopBeingProductionFan,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";

interface Props {
  productionId: string;
  isFan: boolean;
  fansCount: number;
  onChanged: () => void;
}

/** Botón de fan (FAN-01). El dueño no puede ser fan (el backend lo valida). */
const FanButton = ({ productionId, isFan, fansCount, onChanged }: Props) => {
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      const res = isFan
        ? await stopBeingProductionFan(productionId)
        : await becomeProductionFan(productionId);
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant={isFan ? "solid" : "bordered"}
      color="danger"
      startContent={isFan ? <FaHeart /> : <FaRegHeart />}
      onPress={toggle}
      isDisabled={busy}
    >
      {isFan ? "Sos fan" : "Hacerme fan"} ({fansCount})
    </Button>
  );
};

export default FanButton;
