import PrimaryButton from "@/components/buttons/PrimaryButton";
import { CREATE } from "@/utils/data/urls";
import { Card, CardBody, CardHeader, Image, Link } from "@nextui-org/react";

export default function SubscriptionUdpatedSuccess() {
  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-fondo">
      <Card shadow="lg" className="px-4">
        <CardHeader className="flex flex-col gap-2 items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={100}
            className="object-contain"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-service">
            Hemos actualizado tu suscripción exitosamente
          </h1>
        </CardHeader>
        <CardBody className="gap-4 items-center">
          <p className="text-light-text text-center">
            Tu suscripción ha sido actualizada con éxito.
          </p>
          <PrimaryButton
            className="text-primary bg-white hover:text-white hover:border-text-color/75"
            variant="bordered"
            as={Link}
            href={"/"}
          >
            Ir al Inicio
          </PrimaryButton>
        </CardBody>
      </Card>
    </div>
  );
}
