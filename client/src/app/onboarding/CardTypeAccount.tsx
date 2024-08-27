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
      className="p-4"
      shadow="none"
      radius="none"
    >
      <CardHeader className="bg-white shadow-md rounded-xl">
        {type === "person" ? (
          <FaUser className="size-16 text-primary mx-auto" />
        ) : (
          <IoBusiness className="size-16 text-primary mx-auto" />
        )}
      </CardHeader>
      <CardBody>
        <h5>{label}</h5>
      </CardBody>
    </Card>
  );
};

export default CardTypeAccount;
