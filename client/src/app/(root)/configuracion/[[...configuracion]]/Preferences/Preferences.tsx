import { Divider, Spinner } from "@nextui-org/react";
import SearchTerms from "./SearchTerms";
import Background from "./Background";
import BoardPersonalization from "./BoardPersonalization";
import { memo, useEffect, useState } from "react";
import { UserPreferences } from "@/types/userTypes";
import { getUserPreferences } from "@/services/userServices";
import { toastifyError } from "@/utils/functions/toastify";
import { Board } from "@/types/board";
import { getBoardByUsername } from "@/services/boardServices";

const Preferences = ({username} : {username: string}) => {
  const [userPreferences, setUserPreferences] = useState<UserPreferences>();
  const [board, setBoard] = useState<Board>();
  useEffect(() => {
    const fetchPreferences = async () => {
      const preferences = await getUserPreferences(username as string);
      const userBoard = await getBoardByUsername(username as string);
      if (preferences.error || userBoard.error) {
        toastifyError(preferences.error || userBoard.error);
        return;
      }
      setBoard({
        ...userBoard.board,
        user: {
          name: userBoard.name,
          username: userBoard.username,
          profilePhotoUrl: userBoard.profilePhotoUrl,
        },
      });
      setUserPreferences(preferences);
    };
    fetchPreferences();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  console.log("rendering Preferences");
  if (!userPreferences) return <Spinner color="warning" />;
  return (
    <section className="flex flex-col gap-4 items-start w-full">
      <h2 className="profile-title">Preferencias y Personalización</h2>
      <Divider />
      <SearchTerms userPreferences={userPreferences} />
      <Divider />
      <Background userPreferences={userPreferences} />
      <Divider />
      {board && <BoardPersonalization board={board}/>}
    </section>
  );
};

export default memo(Preferences);
