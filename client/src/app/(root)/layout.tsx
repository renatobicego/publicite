import { auth, currentUser } from "@clerk/nextjs/server";
import HelpButton from "../../components/buttons/HelpButton";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import { BackgroundProvider } from "./providers/backgroundProvider";
import BackgroundStyle from "./providers/BackgroundStyle.";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "../api/uploadthing/core";
import { SocketProvider } from "../socketProvider";
import { getConfigData } from "./(configuracion)/Profile/actions";
import { UserDataProvider } from "./providers/userDataProvider";
export default async function NavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const token = await auth().getToken();
  const configData = await getConfigData(user);

  return (
    <SocketProvider
      userId={user?.publicMetadata.mongoId as string}
      token={token as string}
    >
      <UserDataProvider
        username={user?.username}
        clerkId={user?.id}
        userType={user?.publicMetadata.userType}
        userId={user?.publicMetadata.mongoId}
      >
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <Header configData={configData} isSignedIn={!!user} />
        <BackgroundProvider username={user?.username}>
          <BackgroundStyle />
          {children}
          <HelpButton />
        </BackgroundProvider>
        <Footer username={user?.username} />
      </UserDataProvider>
    </SocketProvider>
  );
}
