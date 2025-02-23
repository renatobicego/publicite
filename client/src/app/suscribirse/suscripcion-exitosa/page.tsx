import PrimaryButton from "@/components/buttons/PrimaryButton";
import { CREATE } from "@/utils/data/urls";
import { Card, CardBody, CardHeader, Image, Link } from "@nextui-org/react";

export default function CheckoutSuccess() {
  return (
    <div className="flex items-center justify-center w-full min-h-[80vh] bg-fondo">
      <Card shadow="lg" className="px-4">
        <CardHeader className="flex flex-col gap-2 items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={100}
            className="object-contain"
          />
          <h1 className="text-3xl font-bold text-service">
            ¡Gracias por suscribirte!
          </h1>
        </CardHeader>
        <CardBody className="gap-4 items-center">
          <p className="text-light-text text-center">
            Tu suscripción ha sido creada con éxito.
          </p>
          <PrimaryButton
            className="text-primary bg-white hover:text-white hover:border-text-color/75"
            variant="bordered"
            as={Link}
            href={CREATE}
          >
            Comienza a Publicar
          </PrimaryButton>
        </CardBody>
      </Card>
    </div>
  );
}
