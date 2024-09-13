import { ourFileRouter } from "../api/uploadthing/core";
import HelpButton from "../components/buttons/HelpButton";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import { BackgroundProvider } from "./backgroundProvider";
import BackgroundStyle from "./BackgroundStyle.";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
export default function NavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NextSSRPlugin
        /**
         * The `extractRouterConfig` will extract **only** the route configs
         * from the router to prevent additional information from being
         * leaked to the client. The data passed to the client is the same
         * as if you were to fetch `/api/uploadthing` directly.
         */
        routerConfig={extractRouterConfig(ourFileRouter)}
      />
      <Header />
      <BackgroundProvider>
        <BackgroundStyle />
        {children}
        <HelpButton />
      </BackgroundProvider>
      <Footer />
    </>
  );
}
