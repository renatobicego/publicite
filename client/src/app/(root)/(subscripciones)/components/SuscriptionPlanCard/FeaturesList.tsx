import { FaCheck } from "react-icons/fa6";

const FeaturesList = ({
  features,
  isPopular,
}: {
  features: string[];
  isPopular: boolean;
}) => (
  <ul className="flex flex-col gap-1">
    {features.map((feature) => (
      <li key={feature} className="flex gap-1 items-center text-sm">
        <FaCheck
          className={`${
            isPopular ? "text-primary bg-white" : "text-white bg-primary"
          } p-0.5 rounded-full size-4`}
        />
        {feature}
      </li>
    ))}
  </ul>
);

export default FeaturesList;
