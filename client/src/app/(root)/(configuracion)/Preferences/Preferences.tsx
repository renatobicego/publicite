import { Divider, Spinner } from "@nextui-org/react";
import SearchTerms from "./SearchTerms";
import Background from "./Background";
import BoardPersonalization from "./BoardPersonalization";
import { memo } from "react";
import { UserPreferences } from "@/types/userTypes";
import { Board } from "@/types/board";

const Preferences = ({
  userPreferences,
  board,
}: {
  userPreferences?: UserPreferences;
  board?: Board;
}) => {
  if (!userPreferences) return <Spinner color="warning" />;
  return (
    <section className="flex flex-col gap-4 items-start w-full">
      <h2 className="profile-title">Preferencias y Personalización</h2>
      <Divider />
      <SearchTerms userPreferences={userPreferences} />
      <Divider />
      <Background userPreferences={userPreferences} />
      <Divider />
      {board && <BoardPersonalization board={board} />}
    </section>
  );
};

export default memo(Preferences);
