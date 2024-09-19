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
import { Contact } from "@/types/userTypes";
import { extractDomain, formatFacebookUrl, formatInstagamUrl, formatTwitterUrl } from "@/app/utils/functions/formatUrls";

const SocialMedia = ({ contact }: { contact?: Contact }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);

  return (
    <AnimatedBox
      isVisible={isFormVisible}
      className="flex-1"
      keyValue="social-media"
    >
      {isFormVisible ? (
        <SocialMediaForm
          key={"formSocialMedia"}
          setIsFormVisible={setIsFormVisible}
          contact={contact}
        />
      ) : (
        <div className="flex flex-col gap-4 my-2.5">
          <DataBox labelText="Telefóno / Whatsapp">
            <DataItem
              Icon={<IoLogoWhatsapp className="size-5 text-green-600" />}
            >
              {contact?.phone}
            </DataItem>
            <EditButton text="Editar" onPress={() => setIsFormVisible(true)} />
          </DataBox>
          <DataBox labelText="Instagram" className="-mt-2.5">
            <DataItem
              Icon={
                <IoLogoInstagram className="size-5 instagram-gradient text-white rounded-md overflow-hidden" />
              }
            >
              {contact?.instagram
                ? formatInstagamUrl(contact?.instagram)
                : "-"}
            </DataItem>
          </DataBox>
          <DataBox labelText="Facebook">
            <DataItem
              Icon={<IoLogoFacebook className="size-5 text-blue-600" />}
            >
              {contact?.facebook
                ? formatFacebookUrl(contact?.facebook)
                : "-"}
            </DataItem>
          </DataBox>
          <DataBox labelText="X/Twitter">
            <DataItem Icon={<FaXTwitter className="size-4 text-slate-900" />}>
            {contact?.x
                ? formatTwitterUrl(contact?.x)
                : "-"}
            </DataItem>
          </DataBox>
          <DataBox labelText="Sitio Web">
            <DataItem Icon={<FaLink className="size-4 text-text-color" />}>
            {contact?.website
                ? extractDomain(contact?.website)
                : "-"}
            </DataItem>
          </DataBox>
        </div>
      )}
    </AnimatedBox>
  );
};

export default SocialMedia;
