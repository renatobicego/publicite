import BWButton from "@/components/buttons/BWButton";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { CREATE, SUSCRIBE } from "@/utils/data/urls";
import { Link } from "@nextui-org/react";

const SubscriptionButton = ({
  isPopular,
  isUserSubscribed,
  mpPreapprovalPlanId,
}: {
  isPopular: boolean;
  isUserSubscribed: boolean;
  mpPreapprovalPlanId: string;
}) => {
  const href = isUserSubscribed ? CREATE : `${SUSCRIBE}/${mpPreapprovalPlanId}`;

  return isPopular ? (
    <BWButton blackOrWhite="white" as={Link} href={href}>
      {isUserSubscribed ? "Comienza a Publicar" : "Suscribite Ahora"}
    </BWButton>
  ) : (
    <PrimaryButton as={Link} href={href}>
      {isUserSubscribed ? "Comienza a Publicar" : "Suscribite Ahora"}
    </PrimaryButton>
  );
};

export default SubscriptionButton;
