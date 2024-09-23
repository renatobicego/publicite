"use client";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";

const BreadcrumbsAdmin = ({
  items,
}: {
  items: {
    label: string;
    href: string;
  }[];
}) => {
  const searchParams = useSearchParams();
  const busqueda = searchParams.get("busqueda");
  return (
    <Breadcrumbs>
      {items.map((item) => (
        <BreadcrumbItem
          href={item.href}
          key={item.label}
          classNames={{ item: "max-md:text-xs" }}
        >
          {item.label}
        </BreadcrumbItem>
      ))}
      {busqueda && (
        <BreadcrumbItem classNames={{ item: "max-md:text-xs" }}>
          {busqueda}
        </BreadcrumbItem>
      )}
    </Breadcrumbs>
  );
};

export default BreadcrumbsAdmin;
