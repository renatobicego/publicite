import BWButton from "@/components/buttons/BWButton";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import { SubscriptionPlan } from "@/types/subscriptions";
import { SUSCRIBE } from "@/utils/data/urls";
import { describePack, packFrequencyLabel } from "@/utils/functions/packs";
import { Card, CardBody, Chip, Link } from "@nextui-org/react";

const PackCard = ({
  subscriptionPlan,
  isPopular,
  alreadyHasIt,
}: {
  subscriptionPlan: SubscriptionPlan;
  isPopular?: boolean;
  /** Se puede tener cada pack una sola vez al mismo tiempo. */
  alreadyHasIt?: boolean;
}) => {
  const lines = describePack(subscriptionPlan);
  const href = `${SUSCRIBE}/${subscriptionPlan.mpPreapprovalPlanId}`;
  const label = alreadyHasIt ? "Ya tenés este pack" : "Aumentá el límite";
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
          <h6 className="text-lg xl:text-xl">
            ${subscriptionPlan.price.toLocaleString("es-AR")}{" "}
            <span className="font-medium">
              {packFrequencyLabel(subscriptionPlan)}
            </span>
          </h6>
          {lines.map((line) => (
            <p key={line} className="text-sm font-semibold">
              {line}
            </p>
          ))}
          <p className="text-xs">{subscriptionPlan.description}</p>
          <p className="text-xs">
            Se suma a tu plan mientras esté activo. Lo das de baja cuando
            quieras.
          </p>
        </div>
        <div className="mt-auto">
          {alreadyHasIt ? (
            <SecondaryButton isDisabled>{label}</SecondaryButton>
          ) : isPopular ? (
            <BWButton blackOrWhite="white" as={Link} href={href}>
              {label}
            </BWButton>
          ) : (
            <SecondaryButton as={Link} href={href}>
              {label}
            </SecondaryButton>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default PackCard;
