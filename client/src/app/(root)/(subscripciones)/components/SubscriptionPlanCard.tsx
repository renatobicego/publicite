import BWButton from "@/app/components/buttons/BWButton";
import PrimaryButton from "@/app/components/buttons/PrimaryButton";
import { SubscriptionPlan } from "@/types/subscriptions";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
} from "@nextui-org/react";
import { FaCheck } from "react-icons/fa6";

const SubscriptionPlanCard = ({
  subscriptionPlan,
  isPopular,
}: {
  subscriptionPlan: SubscriptionPlan;
  isPopular?: boolean;
}) => {
  return (
    <Card
      className={`w-full pt-6 pb-10 lg:pt-8 lg:pb-12 px-4 lg:px-6 flex flex-col gap-4 justify-between ${
        isPopular ? "bg-primary text-white" : ""
      } hover:scale-[1.02] transition-all duration-300 
      md:max-lg:w-[48%]`}
      classNames={{ header: "p-0", body: "p-0", footer: "p-0" }}
    >
      <CardHeader className="flex flex-col gap-2 items-start flex-auto justify-between">
        <div className="flex flex-col flex-grow gap-1">
          {isPopular && (
            <Chip
              className="absolute bottom-4 right-6 text-white border-white"
              size="sm"
              variant="bordered"
            >
              Popular
            </Chip>
          )}
          <h3>{subscriptionPlan.reason}</h3>
          {subscriptionPlan.freePlan ? (
            <p className="text-sm">{subscriptionPlan.description}</p>
          ) : (
            <>
              <h6 className="text-lg xl:text-xl">
                ${subscriptionPlan.price}{" "}
                <span className="font-medium">por mes*</span>
              </h6>
              <p className="text-xs">
                *Cancela o pausa cuando quiera. Precio referenciado en el valor
                del dólar
              </p>
            </>
          )}
        </div>
        <div className="mt-auto">
          {subscriptionPlan.freePlan ? (
            <Button
              variant="bordered"
              color="primary"
              radius="full"
              className="px-4 py-[10px] text-sm hover:text-text-color hover:border-text-color"
            >
              Comienza a Publicar
            </Button>
          ) : isPopular ? (
            <BWButton blackOrWhite="white">Suscribite Ahora</BWButton>
          ) : (
            <PrimaryButton>Suscribite Ahora</PrimaryButton>
          )}
        </div>
      </CardHeader>
      <CardBody className="flex flex-col gap-2 justify-end flex-0 flex-none">
        <Divider className={isPopular ? "bg-white" : "bg-primary"} />
        <h6>Servicios Incluidos</h6>
        <ul className="flex flex-col gap-1">
          {subscriptionPlan.features.map((feature) => (
            <li key={feature} className="flex gap-1 items-center text-sm">
              <FaCheck
                className={`${
                  isPopular ? "text-primary bg-white" : "text-white bg-primary"
                } p-0.5 rounded-full size-4`}
              />{" "}
              {feature}
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};

export default SubscriptionPlanCard;
