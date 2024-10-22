"use client";
import { useMemo } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { BiSolidUserDetail } from "react-icons/bi";
import { FaEyeSlash,  FaSliders, FaUser } from "react-icons/fa6";
import Profile from "./Profile/Profile";
import Subscriptions from "./Subscriptions/Subscriptions";
import { MdPayments } from "react-icons/md";
import Privacy from "./Privacy/Privacy";
import Preferences from "./Preferences/Preferences";
import { PROFILE } from "@/utils/data/urls";
import Business from "./Business/Business";
import { IoBusiness } from "react-icons/io5";
import useConfigData from "@/utils/hooks/useConfigData";
import { BackgroundProvider } from "../backgroundProvider";

const UserButtonModal = () => {
  const { user } = useUser();
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
    <UserButton
      appearance={{
        elements: {
          rootBox: "size-8",
          avatarBox: "h-full w-full border-[0.8px]",
        },
      }}
      
    >
      <UserButton.MenuItems>
        <UserButton.Link
          label="Mi Perfil"
          labelIcon={<FaUser />}
          href={`${PROFILE}/${user?.username}`}
        />
        <UserButton.Action label="manageAccount" />
      </UserButton.MenuItems>
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
    </UserButton>
  );
};

export default UserButtonModal;
