import { Button, Link } from "@nextui-org/react";
import { FaInstagram, FaXTwitter } from "react-icons/fa6";
import Navigation from "./Navigation";
import Legals from "./Legals";
import Support from "./Support";

const Footer = () => {
  return (
    <footer
      className={`bg-text-color layout-padding py-10 text-white flex items-start max-md:flex-col gap-5 md:gap-10 max-lg:flex-wrap`}
    >
      <div className="flex flex-col items-start mr-20 max-lg:w-full">
        <h4 className="text-4xl">Publicité</h4>
        <nav>
          <ul className="flex gap-2">
            <li>
              <Button isIconOnly as={Link} href={""} size="sm" variant="light">
                <FaXTwitter className="text-white size-4" />
              </Button>
            </li>
            <li>
              <Button isIconOnly as={Link} href={""} size="sm" variant="light">
                <FaInstagram className="text-white size-5" />
              </Button>
            </li>
          </ul>
        </nav>
      </div>
      <nav>
        <Navigation />
      </nav>
      <nav>
        <Legals />
      </nav>
      <nav>
        <Support />
      </nav>
    </footer>
  );
};

export default Footer;
