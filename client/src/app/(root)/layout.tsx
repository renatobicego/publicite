
import HelpButton from "../components/buttons/HelpButton";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import { BackgroundProvider } from "./backgroundProvider";
import BackgroundStyle from "./BackgroundStyle.";

export default function NavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
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
