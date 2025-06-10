import BackButton from "@/components/buttons/BackButton";
import { Divider, Image, Link } from "@nextui-org/react";

const Details = ({ subscriptionPlan }: { subscriptionPlan: any }) => {
  return (
    <div
      className="flex-1 flex flex-col justify-start items-start gap-4
    max-md:px-8 md:max-lg:px-12 mt-12 lg:ml-[10%] 2xl:ml-[12%] lg:mt-16 2xl:mt-24 "
    >
      <BackButton />
      <div className="flex items-center">
        <Image
          src="/logo.png"
          width={30}
          as={Link}
          href="/"
          height={15}
          alt="Logo"
          className="object-contain"
        />
        <p className="text-sm">Publicité</p>
      </div>
      <h1 className="text-xl md:text-2xl xl:text-3xl font-medium text-light-text">
        Cambiar Método de Pago - {subscriptionPlan.reason}
      </h1>
      <div className="flex gap-4 lg:pr-16">
        <Image
          src="/logo.png"
          width={100}
          height={50}
          alt="Logo"
          className="object-contain"
        />
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">
            Plan de Suscripción {subscriptionPlan.reason}
          </h2>

          <p className="text-sm text-gray-600 mb-2">
            Valor referenciado en el valor del dólar. Cancela o pausa cuando
            quieras. No reembolsable.
          </p>
          <Divider />
          <p className="text-sm text-gray-600 mb-2">
            Cambio de método de pago. Probablemente se haga un cobro de un monto
            menor ($15 ARS) para comprobar la tarjeta, el cual será reembolsado.
            Ante cualquier problema o duda, por favor contactar a soporte.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Details;
