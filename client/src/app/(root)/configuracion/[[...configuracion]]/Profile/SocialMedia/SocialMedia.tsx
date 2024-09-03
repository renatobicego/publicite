import {
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoWhatsapp,
} from "react-icons/io";
import DataBox, { DataItem, EditButton } from "../../DataBox";
import { FaLink, FaXTwitter } from "react-icons/fa6";
import AnimatedBox from "../../AnimatedBox";
import { useState } from "react";
import SocialMediaForm from "./SocialMediaForm";

const SocialMedia = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);

  return (
    <AnimatedBox isVisible={isFormVisible} className="flex-1" key="social-media">
      {isFormVisible ? (
        <SocialMediaForm key={"formSocialMedia"} setIsFormVisible={setIsFormVisible} />
      ) : (
        <div className="flex flex-col gap-4 my-2.5">
          <DataBox labelText="Telefóno / Whatsapp">
            <DataItem
              Icon={<IoLogoWhatsapp className="size-5 text-green-600" />}
            >
              +54 9 11 1234 5678
            </DataItem>
            <EditButton text="Editar" onPress={() => setIsFormVisible(true)} />
          </DataBox>
          <DataBox labelText="Instagram" className="-mt-2.5">
            <DataItem
              Icon={
                <IoLogoInstagram className="size-5 instagram-gradient text-white rounded-md overflow-hidden" />
              }
            >
              renatobicego
            </DataItem>
          </DataBox>
          <DataBox labelText="Facebook">
            <DataItem
              Icon={<IoLogoFacebook className="size-5 text-blue-600" />}
            >
              Renato Bicego
            </DataItem>
          </DataBox>
          <DataBox labelText="X/Twitter">
            <DataItem Icon={<FaXTwitter className="size-4 text-slate-900" />}>
              renatobicego
            </DataItem>
          </DataBox>
          <DataBox labelText="Sitio Web">
            <DataItem Icon={<FaLink className="size-4 text-text-color" />}>
              renatobicego.com
            </DataItem>
          </DataBox>
        </div>
      )}
    </AnimatedBox>
  );
};

export default SocialMedia;
