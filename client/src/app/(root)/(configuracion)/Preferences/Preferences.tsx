import { Divider, Spinner } from "@nextui-org/react";
import SearchTerms from "./SearchTerms";
import Background from "./Background";
import BoardPersonalization from "./BoardPersonalization";
import { memo } from "react";
import { ConfigData } from "../Profile/actions";

const Preferences = ({
  configData
}: {
  configData?: ConfigData;
  }) => {
  if(!configData) return <Spinner color="warning"/>
  return (
    <section className="flex flex-col gap-4 items-start w-full">
      <h2 className="profile-title">Preferencias y Personalización</h2>
      <Divider />
      <SearchTerms userPreferences={configData.userPreferences} />
      <Divider />
      <Background userPreferences={configData.userPreferences} />
      <Divider />
      {configData.board && <BoardPersonalization board={configData.board} />}
    </section>
  );
};

export default memo(Preferences);
