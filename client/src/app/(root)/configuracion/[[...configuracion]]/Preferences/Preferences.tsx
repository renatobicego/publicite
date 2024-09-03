import { Divider } from "@nextui-org/react";
import SearchTerms from "./SearchTerms";
import Background from "./Background";
import BoardPersonalization from "./BoardPersonalization";

const Preferences = () => {
  return (
    <section className="flex flex-col gap-4 items-start w-full">
      <h2 className="profile-title">Preferencias y Personalización</h2>
      <Divider />
      <SearchTerms />
      <Divider />
      <Background />
      <Divider />
      <BoardPersonalization />
    </section>
  );
};

export default Preferences;
