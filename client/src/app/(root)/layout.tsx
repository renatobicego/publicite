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
import { getConfigData } from "./(configuracion)/Profile/actions";
import { MagazineProvider } from "./magazinesProvider";
export default async function NavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const configData = await getConfigData(user);

  return (
    <SocketProvider userId={user?.publicMetadata.mongoId as string}>
      <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
      <Header
        username={user?.username}
        userType={user?.publicMetadata.userType}
        configData={configData}
        isSignedIn={!!user}
      />
      <BackgroundProvider username={user?.username}>
        <MagazineProvider username={user?.username}>
          <BackgroundStyle />
          {children}
          <HelpButton />
        </MagazineProvider>
      </BackgroundProvider>
      <Footer username={user?.username} />
    </SocketProvider>
  );
}
