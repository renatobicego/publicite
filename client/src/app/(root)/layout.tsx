import { auth, currentUser } from "@clerk/nextjs/server";
import HelpButton from "../../components/buttons/HelpButton/HelpButton";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import { BackgroundProvider } from "./providers/backgroundProvider";
import BackgroundStyle from "./providers/BackgroundStyle.";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "../api/uploadthing/core";
import { SocketProvider } from "../socketProvider";
import { UserDataProvider } from "./providers/userDataProvider";
import { LocationProvider } from "./providers/LocationProvider";
export default async function NavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  return (
    <SocketProvider userId={user?.publicMetadata.mongoId as string}>
      <UserDataProvider
        username={user?.username}
        clerkId={user?.id}
        userType={user?.publicMetadata.userType}
        userId={user?.publicMetadata.mongoId}
      >
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <Header isSignedIn={!!user} />
        <BackgroundProvider username={user?.username}>
          <LocationProvider>
            <BackgroundStyle />
            {children}
            <HelpButton />
          </LocationProvider>
        </BackgroundProvider>
        <Footer username={user?.username} />
      </UserDataProvider>
    </SocketProvider>
  );
}
