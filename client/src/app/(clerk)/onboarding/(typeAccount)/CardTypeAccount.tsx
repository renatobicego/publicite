import { Card, CardBody, CardHeader, Link } from "@nextui-org/react";
import React from "react";
import { FaUser } from "react-icons/fa6";
import { IoBusiness } from "react-icons/io5";
import { RiAdvertisementFill } from "react-icons/ri";

const CardTypeAccount = ({
  type,
  label,
}: {
  type: "person" | "company" | "agent";
  label: string;
}) => {
  const href =
    type === "person"
      ? "/onboarding/persona"
      : type === "agent"
        ? "/onboarding/agente"
        : "/onboarding/empresa";
  return (
    <Card
      as={Link}
      href={href}
      className="p-4 md:p-12 hover:bg-text-color hover:text-white hover:opacity-100"
      shadow="sm"
    >
      <CardBody className="flex flex-col gap-2">
        {type === "person" ? (
          <FaUser className="size-14 md:size-16 text-primary mx-auto" />
        ) : type === "agent" ? (
          <RiAdvertisementFill className="size-14 md:size-16 text-primary mx-auto" />
        ) : (
          <IoBusiness className="size-14 md:size-16 text-primary mx-auto" />
        )}
        <h4>{label}</h4>
      </CardBody>
    </Card>
  );
};

export default CardTypeAccount;
