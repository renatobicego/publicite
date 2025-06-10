import BWButton from "@/components/buttons/BWButton";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import { SubscriptionPlan } from "@/types/subscriptions";
import { Button, Card, CardBody, Chip } from "@nextui-org/react";

const PackCard = ({
  subscriptionPlan,
  isPopular,
}: {
  subscriptionPlan: SubscriptionPlan;
  isPopular?: boolean;
}) => {
  return (
    <Card
      className={`w-full pt-6 pb-10 lg:pt-8 lg:pb-12 px-4 lg:px-6 flex flex-col gap-4 justify-between ${
        isPopular ? "bg-secondary text-white" : ""
      } hover:scale-[1.02] transition-all duration-300 md:max-lg:w-[48%]`}
      classNames={{ header: "p-0", body: "p-0", footer: "p-0" }}
    >
      <CardBody className="flex flex-col gap-2 items-start flex-auto justify-between">
        <div className="flex flex-col flex-grow gap-1">
          {isPopular && (
            <Chip
              className="absolute bottom-0 right-0 text-white border-white"
              size="sm"
              variant="bordered"
            >
              Popular
            </Chip>
          )}
          <h3>{subscriptionPlan.reason}</h3>
          {subscriptionPlan.isFree ? (
            <p className="text-sm">{subscriptionPlan.description}</p>
          ) : (
            <>
              <h6 className="text-lg xl:text-xl">${subscriptionPlan.price} </h6>
              <p className="text-xs">{subscriptionPlan.description}</p>
            </>
          )}
        </div>
        <div className="mt-auto">
          {isPopular ? (
            <BWButton blackOrWhite="white">Aumenta el Límite</BWButton>
          ) : (
            <SecondaryButton>Aumenta el Límite</SecondaryButton>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default PackCard;
