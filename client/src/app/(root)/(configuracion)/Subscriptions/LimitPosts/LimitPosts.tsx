import { Subscription } from "@/types/subscriptions";
import DataBox, { CardDataItem, DataItem } from "../../DataBox";
import { Button, Link } from "@nextui-org/react";
import useUserPostLimit from "@/utils/hooks/useUserPostLimit";
import { useActiveSubscriptions } from "@/app/(root)/providers/userDataProvider";
import { PACKS } from "@/utils/data/urls";

const LimitPosts = () => {
  const { numberOfPosts, limit } = useUserPostLimit();
  const { accountType, postsPacks } = useActiveSubscriptions();

  return (
    <DataBox
      key={"dataLimitPosts"}
      className=" max-md:my-2.5 !items-start"
      labelText="Límite de Publicaciones Activas"
      labelClassname="md:w-1/4 md:my-2.5 max-md:flex-none max-md:max-w-[65%] max-md:min-w-[40px]"
    >
      <div className="flex flex-col gap-2 flex-1 my-2.5">
        <DataItem className="font-normal">
          Publicaciones de {"Agenda"} activas:{" "}
          <em className="font-semibold">
            {numberOfPosts.agenda} / {limit.agenda} Disponibles
          </em>
        </DataItem>
        <DataItem className="font-normal">
          Publicaciones {"Libres"} activas:{" "}
          <em className="font-semibold">
            {numberOfPosts.libre} / {limit.libre} Disponibles
          </em>
        </DataItem>
        <CardDataItem
          title={`${accountType?.subscriptionPlan.postsAgendaCount} publicaciones de Agenda.
           ${accountType?.subscriptionPlan.postsLibresCount} publicaciones Libres.`}
          subtitle={accountType?.subscriptionPlan.reason || "Gratuita"}
        />
        {postsPacks?.map((subscription: Subscription) => (
          <CardDataItem
            key={subscription.subscriptionPlan.reason}
            title={`${subscription.subscriptionPlan.postsAgendaCount} publicaciones de Agenda. ${subscription.subscriptionPlan.postsLibresCount} publicaciones Libres.`}
            subtitle={subscription.subscriptionPlan.reason}
            boldLabel={`Disponible hasta ${subscription.endDate}`}
          />
        ))}
      </div>
      <Button
        color="secondary"
        variant="light"
        radius="full"
        className={`font-normal`}
        as={Link}
        href={PACKS}
      >
        Aumentar Límite
      </Button>
    </DataBox>
  );
};

export default LimitPosts;
