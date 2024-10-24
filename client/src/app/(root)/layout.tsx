import { currentUser } from "@clerk/nextjs/server";
import HelpButton from "../../components/buttons/HelpButton";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import { BackgroundProvider } from "./backgroundProvider";
import BackgroundStyle from "./BackgroundStyle.";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "../api/uploadthing/core";
import { SocketProvider } from "../socketProvider";
import { ConfigData, getConfigData } from "./(configuracion)/Profile/actions";
import { UserType } from "@/types/userTypes";
import ErrorCard from "@/components/ErrorCard";
export default async function NavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const configData = await getConfigData(user);

  if (configData && "error" in configData && configData.error) {
    return <ErrorCard error={configData.error} />;
  }
  return (
    <SocketProvider userId={user?.publicMetadata.mongoId as string}>
      <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
      <Header
        username={user?.username as string}
        userType={user?.publicMetadata.userType as UserType}
        configData={configData as ConfigData}
        isSignedIn={!!user}
      />
      <BackgroundProvider username={user?.username}>
        <BackgroundStyle />
        {children}
        <HelpButton />
      </BackgroundProvider>
      <Footer username={user?.username} />
    </SocketProvider>
  );
}
