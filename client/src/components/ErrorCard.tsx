"use client";

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@nextui-org/react";
import BackButton from "./buttons/BackButton";
import PrimaryButton from "./buttons/PrimaryButton";

const ErrorCard = ({
  message,
  error,
}: {
  message?: string;
  error?: string;
}) => {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center main-style gap-4 md:gap-6 lg:gap-8 self-center">
      <Card className="p-4 max-w-full">
        <CardHeader>
          <BackButton />
        </CardHeader>
        <CardBody>
          <h4>Hubo un error inesperado</h4>
          <p className="text-sm">{message}</p>
          {error && (
            <p className="text-sm text-danger">
              {error.toLowerCase() === "connection closed"
                ? "Hubo un error de conexión"
                : error}
            </p>
          )}
        </CardBody>
        <CardFooter>
          <PrimaryButton onPress={() => window.location.reload()}>
            Intentar nuevamente
          </PrimaryButton>
        </CardFooter>
      </Card>
    </main>
  );
};

export default ErrorCard;
