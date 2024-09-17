import { Divider, Spinner } from "@nextui-org/react";
import SearchTerms from "./SearchTerms";
import Background from "./Background";
import BoardPersonalization from "./BoardPersonalization";
import { useEffect, useState } from "react";
import { UserPreferences } from "@/types/userTypes";
import { useUser } from "@clerk/nextjs";
import { getUserPreferences } from "@/app/services/userServices";
import { toastifyError } from "@/app/utils/toastify";

const Preferences = () => {
  const [userPreferences, setUserPreferences] = useState<UserPreferences>();
  const {user} = useUser()
  useEffect(() => {
    const fetchPreferences = async () => {
      const preferences = await getUserPreferences(user?.username as string);
      if(preferences.error) {
        toastifyError(preferences.error);
        return
      }
      setUserPreferences(preferences);
    };
    fetchPreferences();
  }, [user?.username]);
  if(!userPreferences) return <Spinner color="warning" />
  return (
    <section className="flex flex-col gap-4 items-start w-full">
      <h2 className="profile-title">Preferencias y Personalización</h2>
      <Divider />
      <SearchTerms />
      <Divider />
      <Background userPreferences={userPreferences}/>
      <Divider />
      <BoardPersonalization />
    </section>
  );
};

export default Preferences;
