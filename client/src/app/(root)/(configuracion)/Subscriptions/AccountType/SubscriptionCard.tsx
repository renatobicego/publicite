import { SubscriptionPlan } from "@/types/subscriptions";
import {
  Button,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Radio,
  RadioProps,
} from "@nextui-org/react";
import { FaChevronDown } from "react-icons/fa6";

export const CustomRadio = (props: RadioProps) => {
  const { children, ...otherProps } = props;

  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn(
          "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
          "flex-row-reverse cursor-pointer max-w-full rounded-xl gap-4 p-4 border-2 border-transparent",
          "data-[selected=true]:border-secondary"
        ),
        label: "text-sm",
        description: "text-xs",
        labelWrapper: "w-full",
      }}
    >
      {children}
    </Radio>
  );
};

const SubscriptionCard = ({
  subscriptionPlan,
  freePlan,
}: {
  subscriptionPlan: SubscriptionPlan;
  freePlan?: boolean;
}) => {
  return (
    <CustomRadio color="secondary" value={subscriptionPlan._id}>
      <div className="flex flex-col gap-1 items-start w-full">
        <div className="w-full flex justify-between items-center gap-4">
          <h4 className="text-sm font-semibold">{subscriptionPlan.reason}</h4>
          {freePlan ? (
            <p className="text-sm font-semibold">Gratis</p>
          ) : (
            <p className="text-sm font-semibold">
              ${subscriptionPlan.price} por mes
            </p>
          )}
        </div>
        <p className="text-xs">{subscriptionPlan.description}</p>
        <Popover showArrow placement="bottom">
          <PopoverTrigger>
            <Button
              size="sm"
              variant="light"
              endContent={<FaChevronDown />}
              radius="full"
              className="-ml-2.5"
            >
              Ver Beneficios
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-4 flex flex-col gap-1 pr-8">
            {subscriptionPlan.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </PopoverContent>
        </Popover>
      </div>
    </CustomRadio>
  );
};

export default SubscriptionCard;
