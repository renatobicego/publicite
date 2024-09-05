"use client";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";

const BreadcrumbsAdmin = ({
  items,
}: {
  items: {
    label: string;
    href: string;
  }[];
}) => {
  return (
    <Breadcrumbs>
      {items.map((item) => (
        <BreadcrumbItem href={item.href} key={item.label}>
          {item.label}
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  );
};

export default BreadcrumbsAdmin;
