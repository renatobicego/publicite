
import { Button, Link } from "@nextui-org/react";
import { FaInstagram, FaXTwitter } from "react-icons/fa6";
import Navigation from "./Navigation";
import Legals from "./Legals";
import Support from "./Support";

const Footer = () => {
  return (
    <footer className="bg-text-color px-[100px] py-10 text-white flex items-start gap-10">
      <div className="flex flex-col items-start mr-20">
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
