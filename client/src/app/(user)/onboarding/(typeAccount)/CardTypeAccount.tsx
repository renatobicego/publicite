import { Card, CardBody, CardHeader, Link } from "@nextui-org/react";
import React from "react";
import { FaUser } from "react-icons/fa6";
import { IoBusiness } from "react-icons/io5";

const CardTypeAccount = ({
  type,
  label,
}: {
  type: "person" | "company";
  label: string;
}) => {
  return (
    <Card
      as={Link}
      href={`/onboarding/${type === "person" ? "persona" : "empresa"}`}
      className="p-12 hover:bg-text-color hover:text-white hover:opacity-100"
      shadow="sm"
    >
      <CardBody className="flex flex-col gap-2">
        {type === "person" ? (
          <FaUser className="size-16 text-primary mx-auto" />
        ) : (
          <IoBusiness className="size-16 text-primary mx-auto" />
        )}
        <h4>{label}</h4>
      </CardBody>
    </Card>
  );
};

export default CardTypeAccount;
