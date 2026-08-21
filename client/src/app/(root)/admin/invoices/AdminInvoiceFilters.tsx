"use client";

import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import { FaXmark } from "react-icons/fa6";

import { AdminInvoiceFilters, PAYMENT_STATUS_LABELS } from "@/types/adminTypes";

interface AdminInvoiceFiltersProps {
  filters: AdminInvoiceFilters;
  onChange: (filters: AdminInvoiceFilters) => void;
  isLoading?: boolean;
}

const FACTURA_OPTIONS = [
  { key: "con", label: "Con factura" },
  { key: "sin", label: "Sin factura" },
];

export default function AdminInvoiceFiltersBar({
  filters,
  onChange,
  isLoading,
}: AdminInvoiceFiltersProps) {
  const set = (changes: Partial<AdminInvoiceFilters>) =>
    onChange({ ...filters, ...changes });

  const hasFilters =
    !!filters.userSearch ||
    !!filters.paymentStatus ||
    !!filters.dateFrom ||
    !!filters.dateTo ||
    typeof filters.hasFactura === "boolean";

  return (
    <div className="flex flex-wrap items-end gap-3 mb-4">
      <Input
        size="sm"
        variant="bordered"
        label="Usuario"
        labelPlacement="outside"
        placeholder="Nombre, usuario o email"
        className="max-w-[15rem]"
        value={filters.userSearch ?? ""}
        onValueChange={(value) => set({ userSearch: value })}
        isDisabled={isLoading}
      />

      <Select
        size="sm"
        variant="bordered"
        label="Estado"
        labelPlacement="outside"
        placeholder="Todos"
        className="max-w-[11rem]"
        selectedKeys={filters.paymentStatus ? [filters.paymentStatus] : []}
        onChange={(e) => set({ paymentStatus: e.target.value || undefined })}
        isDisabled={isLoading}
      >
        {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </Select>

      <Input
        size="sm"
        type="date"
        variant="bordered"
        label="Desde"
        labelPlacement="outside"
        className="max-w-[10rem]"
        value={filters.dateFrom ?? ""}
        onValueChange={(value) => set({ dateFrom: value || undefined })}
        isDisabled={isLoading}
      />

      <Input
        size="sm"
        type="date"
        variant="bordered"
        label="Hasta"
        labelPlacement="outside"
        className="max-w-[10rem]"
        value={filters.dateTo ?? ""}
        onValueChange={(value) => set({ dateTo: value || undefined })}
        isDisabled={isLoading}
      />

      <Select
        size="sm"
        variant="bordered"
        label="Factura"
        labelPlacement="outside"
        placeholder="Todas"
        className="max-w-[10rem]"
        selectedKeys={
          typeof filters.hasFactura === "boolean"
            ? [filters.hasFactura ? "con" : "sin"]
            : []
        }
        onChange={(e) =>
          set({
            hasFactura: e.target.value ? e.target.value === "con" : undefined,
          })
        }
        isDisabled={isLoading}
      >
        {FACTURA_OPTIONS.map((option) => (
          <SelectItem key={option.key} value={option.key}>
            {option.label}
          </SelectItem>
        ))}
      </Select>

      {hasFilters && (
        <Button
          size="sm"
          variant="light"
          radius="full"
          startContent={<FaXmark />}
          onPress={() => onChange({})}
          isDisabled={isLoading}
        >
          Limpiar
        </Button>
      )}
    </div>
  );
}
