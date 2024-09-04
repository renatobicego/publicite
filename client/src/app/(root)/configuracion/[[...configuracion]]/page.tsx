"use client";

import { UserProfile } from "@clerk/nextjs";
import { BiSolidUserDetail } from "react-icons/bi";
import { FaBell, FaEyeSlash, FaShield, FaSliders } from "react-icons/fa6";
import Profile from "./Profile/Profile";
import Subscriptions from "./Subscriptions/Subscriptions";
import { MdPayments } from "react-icons/md";
import Privacy from "./Privacy/Privacy";
import Notifications from "./Notifications/Notifications";
import Preferences from "./Preferences/Preferences";
import { CONFIGURATION } from "@/app/utils/urls";


const UserProfilePage = () => (
  <main className="flex flex-col items-center min-h-screen main-style">
    <UserProfile
      path={`${CONFIGURATION}`}
      routing="path"
      appearance={{
        elements: {
          profileSectionTitleText: "font-normal",
          navbarButton: "font-normal",
          navbar: "bg-fondo max-lg:max-w-48",
        },
      }}
    >
      {/* You can pass the content as a component */}

      <UserProfile.Page
        label="Perfil"
        labelIcon={<BiSolidUserDetail className="size-4"/>}
        url="perfil"
      >
        <Profile />
      </UserProfile.Page>
      <UserProfile.Page
        label="Subscripción"
        labelIcon={<MdPayments className="size-4"/>}
        url="subscripcion"
      >
        <Subscriptions />
      </UserProfile.Page>
      <UserProfile.Page label="security" />
      <UserProfile.Page
        label="Privacidad"
        labelIcon={<FaEyeSlash className="size-4"/>}
        url="privacidad"
      >
        <Privacy />
      </UserProfile.Page>
      <UserProfile.Page
        label="Notificaciones"
        labelIcon={<FaBell className="size-4"/>}
        url="notificaciones"
      >
        <Notifications />
      </UserProfile.Page>
      <UserProfile.Page
        label="Preferencias"
        labelIcon={<FaSliders className="size-4"/>}
        url="preferencias"
      >
        <Preferences />
      </UserProfile.Page>
    </UserProfile>
  </main>
);

export default UserProfilePage;
