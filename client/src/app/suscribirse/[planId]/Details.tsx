import BackButton from "@/components/buttons/BackButton";
import { Divider, Image, Link } from "@nextui-org/react";
import { frequencyLabelFromMP } from "@/utils/functions/billingFrequency";

const Details = ({
  subscriptionPlan,
  isChangingPlan,
}: {
  subscriptionPlan: any;
  isChangingPlan?: boolean;
}) => {
  // El plan viene de MercadoPago: la frecuencia real del cobro está en
  // auto_recurring (el anual dice «cada 1 years»). Se muestra en dos renglones
  // al lado del precio: «por» / «año», «cada» / «3 meses».
  const periodo = frequencyLabelFromMP(subscriptionPlan.auto_recurring);
  const corte = periodo.indexOf(" ");
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
        Suscribirte a {subscriptionPlan.reason}{" "}
        {isChangingPlan && "- Cambio de Plan"}
      </h1>
      {isChangingPlan && (
        <p>
          Cambia el plan de suscripción a <em>{subscriptionPlan.reason}</em>. Se
          cancelará la suscripción actual. En caso de haber un error en la
          cancelación de la suscripción, <strong>contactar a soporte</strong>.
        </p>
      )}
      <div className="flex gap-1 items-center">
        <span className="text-4xl font-semibold text-text-color">
          ${subscriptionPlan.auto_recurring.transaction_amount}
        </span>
        {periodo && (
          <div className="flex flex-col">
            <p className="text-sm">{periodo.slice(0, corte)}</p>
            <p className="text-sm">{periodo.slice(corte + 1)}</p>
          </div>
        )}
      </div>
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
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">
              ${subscriptionPlan.auto_recurring.transaction_amount}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Impuestos</span>
            <span className="text-gray-900">$0</span>
          </div>
          <Divider />

          <div className="flex justify-between mt-2 text-lg font-semibold">
            <span>Total a pagar hoy</span>
            <span>${subscriptionPlan.auto_recurring.transaction_amount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
