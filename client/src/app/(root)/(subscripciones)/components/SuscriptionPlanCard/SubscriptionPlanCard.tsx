import { SubscriptionPlan } from "@/types/subscriptions";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Button,
  Link,
} from "@nextui-org/react";
import FeaturesList from "./FeaturesList";
import PlanDetails from "./PlanDetails";
import PopularChip from "./PopularChip";
import SubscribedFooter from "./SubscribedFooter";
import SubscriptionButton from "./SubscriptionButton";
import { CREATE } from "@/app/utils/data/urls";

const SubscriptionPlanCard = ({
  subscriptionPlan,
  isPopular,
  isUserSubscribed,
}: {
  subscriptionPlan: SubscriptionPlan;
  isPopular?: boolean;
  isUserSubscribed?: boolean;
}) => {
  return (
    <Card
      className={`relative overflow-visible w-full pt-6 pb-10 lg:pt-8 lg:pb-12 px-4 lg:px-6 flex flex-col gap-4 justify-between ${
        isPopular ? "bg-primary text-white" : ""
      } hover:scale-[1.02] transition-all duration-300 md:max-lg:w-[48%] ${
        isUserSubscribed ? "mb-6" : ""
      }`}
      classNames={{ header: "p-0", body: "p-0", footer: "p-0" }}
    >
      <CardHeader className="flex flex-col gap-2 items-start flex-auto justify-between">
        {isPopular && <PopularChip />}
        <PlanDetails subscriptionPlan={subscriptionPlan} />
        {subscriptionPlan.freePlan ? (
          <Button
            variant="bordered"
            color="primary"
            radius="full"
            as={Link}
            href={CREATE}
            className="px-4 py-[10px] text-sm hover:text-text-color hover:border-text-color"
          >
            Comienza a Publicar
          </Button>
        ) : (
          <SubscriptionButton
            isPopular={!!isPopular}
            isUserSubscribed={!!isUserSubscribed}
            mpPreapprovalPlanId={subscriptionPlan.mpPreapprovalPlanId}
          />
        )}
      </CardHeader>
      <CardBody className="flex flex-col gap-2 justify-end flex-0 flex-none">
        <Divider className={isPopular ? "bg-white" : "bg-primary"} />
        <h6>Servicios Incluidos</h6>
        <FeaturesList
          features={subscriptionPlan.features}
          isPopular={!!isPopular}
        />
      </CardBody>
      {isUserSubscribed && <SubscribedFooter />}
    </Card>
  );
};

export default SubscriptionPlanCard;
