import useConfigData from "@/utils/hooks/useConfigData";
import { UserButton } from "@clerk/nextjs";
import { BiSolidUserDetail } from "react-icons/bi";
import { useMemo } from "react";
import { FaEyeSlash, FaSliders } from "react-icons/fa6";
import { IoBusiness } from "react-icons/io5";
import { MdPayments } from "react-icons/md";
import { BackgroundProvider } from "../backgroundProvider";
import Business from "./Business/Business";
import Preferences from "./Preferences/Preferences";
import Privacy from "./Privacy/Privacy";
import Profile from "./Profile/Profile";
import Subscriptions from "./Subscriptions/Subscriptions";

const UserButtonModalItems = ({
  user,
}: {
  user: any;
}) => {
  const userType = user?.publicMetadata?.userType;
  const configData = useConfigData(user);

  const pageToReturn = useMemo(() => {
    switch (userType) {
      case "Person":
        return (
          <UserButton.UserProfilePage
            label="Perfil"
            labelIcon={<BiSolidUserDetail className="size-4" />}
            url="perfil"
            key="Profile"
          >
            <Profile />
          </UserButton.UserProfilePage>
        );
      case "Business":
        return (
          <UserButton.UserProfilePage
            label="Empresa"
            url="empresa"
            labelIcon={<IoBusiness className="size-4" />}
            key="Business"
          >
            <Business />
          </UserButton.UserProfilePage>
        );
      default:
        return null;
    }
  }, [userType]);
  return (
    <>
      {pageToReturn}
      <UserButton.UserProfilePage
        label="Suscripción"
        labelIcon={<MdPayments className="size-4" />}
        url="suscripcion"
      >
        <Subscriptions
          accountType={configData?.accountType}
          postsPacks={configData?.postsPacks}
        />
      </UserButton.UserProfilePage>
      <UserButton.UserProfilePage label="security" />
      <UserButton.UserProfilePage
        label="Privacidad"
        labelIcon={<FaEyeSlash className="size-4" />}
        url="privacidad"
      >
        <Privacy />
      </UserButton.UserProfilePage>
      {/* <UserButton.UserProfilePage
          label="Notificaciones"
          labelIcon={<FaBell className="size-4" />}
          url="notificaciones"
        >
          <Notifications />
        </UserButton.UserProfilePage> */}
      <UserButton.UserProfilePage
        label="Preferencias"
        labelIcon={<FaSliders className="size-4" />}
        url="preferencias"
      >
        <BackgroundProvider>
          <Preferences
            userPreferences={configData?.userPreferences}
            board={configData?.board}
          />
        </BackgroundProvider>
      </UserButton.UserProfilePage>
    </>
  );
};

export default UserButtonModalItems;
