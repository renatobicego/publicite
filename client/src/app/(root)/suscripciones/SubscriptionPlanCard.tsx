import PrimaryButton from "@/app/components/buttons/PrimaryButton";
import { SubscriptionPlan } from "@/types/subscriptions";
import { Button, Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
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
      className={`w-full pt-8 pb-12 px-6 flex flex-col gap-4 ${
        isPopular ? "bg-primary text-white" : ""
      }`}
      classNames={{ header: "p-0", body: "p-0", footer: "p-0" }}
    >
      <CardHeader className="flex flex-col gap-2 items-start">
        <h3>{subscriptionPlan.reason}</h3>
        {subscriptionPlan.freePlan ? (
          <p>{subscriptionPlan.description}</p>
        ) : (
          <div className="flex flex-col">
            <h6 className="text-xl">
              ${subscriptionPlan.price}{" "}
              <span className="font-medium">por mes</span>
            </h6>
            <p className="text-sm">Cancela o pausa cuando quieras</p>
          </div>
        )}
        {subscriptionPlan.freePlan ? (
          <Button
            variant="bordered"
            color="primary"
            radius="full"
            className="mt-6 px-4 py-[10px] text-sm"
          >
            Comienza a Publicar
          </Button>
        ) : isPopular ? (
          <Button color="default" className="bg-white text-text-color hover:text-white">Suscribirme</Button>
        ) : (
          <PrimaryButton>Suscribirme</PrimaryButton>
        )}
      </CardHeader>
      <Divider className="bg-primary " />
      <CardBody className="flex flex-col gap-2">
        <h6>Servicios Incluidos</h6>
        <ul className="flex flex-col gap-1">
          {subscriptionPlan.features.map((feature) => (
            <li key={feature} className="flex gap-1 items-center ">
              <FaCheck className="text-white bg-primary p-1 rounded-full size-5" />{" "}
              {feature}
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};

export default SubscriptionPlanCard;
