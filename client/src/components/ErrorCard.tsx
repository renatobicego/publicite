"use client";

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@nextui-org/react";
import { useRouter } from "next-nprogress-bar";
import BackButton from "./buttons/BackButton";
import PrimaryButton from "./buttons/PrimaryButton";

const ErrorCard = ({ message }: { message?: string }) => {
  const router = useRouter();
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center main-style gap-4 md:gap-6 lg:gap-8 self-center">
      <Card className="p-4 max-w-full">
        <CardHeader>
          <BackButton />
        </CardHeader>
        <CardBody>
          <h4>Hubo un error inesperado</h4>
          <p className="text-sm">{message}</p>
        </CardBody>
        <CardFooter>
          <PrimaryButton onPress={() => router.refresh()}>
            Intentar nuevamente
          </PrimaryButton>
        </CardFooter>
      </Card>
    </main>
  );
};

export default ErrorCard;
