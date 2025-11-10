import { Link } from "@nextui-org/react";
import TermsConditions from "./TermsConditions";
import PrivacyPolicy from "./PrivacyPolicy";

const Legals = () => {
  return (
    <ul className="flex flex-col gap-1">
      <li className="text-white font-bold">Recursos Legales</li>
      <li>
        <TermsConditions />
      </li>
      <li>
        <PrivacyPolicy />
      </li>
    </ul>
  );
};

export default Legals;
