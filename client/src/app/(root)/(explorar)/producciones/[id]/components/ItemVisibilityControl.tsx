"use client";
import { useState } from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { FaEye } from "react-icons/fa";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { setProductionItemVisibility } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import {
  ProductionItemResponse,
  ProductionVisibility,
} from "@/types/productionTypes";
import { visibilityLabel, visibilityOptions } from "../../productionVisibility";

interface Props {
  item: ProductionItemResponse;
  onChanged: () => void;
}

const INHERIT_KEY = "__inherit__";

/**
 * Control de alcance de una carpeta o archivo (VIS-04). Permite elegir un
 * alcance propio o "Heredar" (VIS-03). Muestra el alcance efectivo.
 */
const ItemVisibilityControl = ({ item, onChanged }: Props) => {
  const [busy, setBusy] = useState(false);

  const currentKey = item.visibility ?? INHERIT_KEY;

  const handleSelect = async (key: string) => {
    const visibility =
      key === INHERIT_KEY ? null : (key as ProductionVisibility);
    setBusy(true);
    try {
      const res = await setProductionItemVisibility(item._id, visibility);
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess("Alcance actualizado");
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          size="sm"
          variant="flat"
          isDisabled={busy}
          startContent={<FaEye />}
          className="text-xs"
        >
          {item.visibility
            ? visibilityLabel[item.visibility]
            : `Hereda (${visibilityLabel[item.effectiveVisibility]})`}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Alcance del ítem"
        selectionMode="single"
        selectedKeys={[currentKey]}
        onAction={(key) => handleSelect(key as string)}
        items={[
          { key: INHERIT_KEY, label: "Heredar del padre" },
          ...visibilityOptions.map((option) => ({
            key: option,
            label: visibilityLabel[option],
          })),
        ]}
      >
        {(entry: { key: string; label: string }) => (
          <DropdownItem key={entry.key}>{entry.label}</DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
};

export default ItemVisibilityControl;
