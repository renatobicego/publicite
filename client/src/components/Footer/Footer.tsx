import { Button, Link } from "@nextui-org/react";
import { FaInstagram, FaShare, FaXTwitter } from "react-icons/fa6";
import Navigation from "./Navigation";
import Legals from "./Legals";
import Support from "./Support";
import ShareApp from "./ShareApp";

const Footer = ({ id }: { id?: string | null }) => {
  return (
    <footer
      className={`bg-text-color layout-padding py-10 text-white flex flex-col items-start rounded-20 lg:rounded-3xl`}
    >
      <section
        className="flex items-start 
        max-md:flex-col gap-5 md:gap-10 max-lg:flex-wrap"
      >
        <div className="flex flex-col items-start mr-20 max-lg:w-full gap-4">
          <h4 className="text-4xl">Publicité</h4>
          <nav>
            <ul className="flex gap-2">
              <li>
                <ShareApp />
              </li>
              {/* <li>
              <Button
                aria-label="Twitter"
                isIconOnly
                as={Link}
                href={""}
                size="sm"
                variant="light"
              >
                <FaXTwitter className="text-white size-4" />
              </Button>
            </li> */}
              {/* <li>
              <Button
                aria-label="Instagram"
                isIconOnly
                as={Link}
                href={"https://www.instagram.com/soonpublicite"}
                size="sm"
                variant="light"
              >
                <FaInstagram className="text-white size-5" />
              </Button>
            </li> */}
            </ul>
          </nav>
        </div>
        <nav>
          <Navigation id={id} />
        </nav>
        <nav>
          <Legals />
        </nav>
        <nav>
          <Support />
        </nav>
      </section>
      {/* add copyright info */}
      <div className="w-full h-[1px] bg-white/10 my-6" />
      <div className="w-full text-center text-sm text-white/50">
        © {new Date().getFullYear()} SoonPublicité. Todos los derechos
        reservados.
      </div>
    </footer>
  );
};

export default Footer;
