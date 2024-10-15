import { currentUser } from "@clerk/nextjs/server";
import HelpButton from "../../components/buttons/HelpButton";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import { BackgroundProvider } from "./backgroundProvider";
import BackgroundStyle from "./BackgroundStyle.";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
// import { ourFileRouter } from "@/app/api/uploadthing/core"
export default async function NavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  return (
    <>
      {/* <NextSSRPlugin
        routerConfig={extractRouterConfig(ourFileRouter)}
      /> */}
      <Header />
      <BackgroundProvider username={user?.username}>
        <BackgroundStyle />
        {children}
        <HelpButton />
      </BackgroundProvider>
      <Footer />
    </>
  );
}
