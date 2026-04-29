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
import {
  extractDomain,
  formatFacebookUrl,
  formatInstagamUrl,
  formatTwitterUrl,
} from "@/utils/functions/formatUrls";
import { visibilityItems } from "@/utils/data/selectData";

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
            <DataItem Icon={<IoLogoWhatsapp className="size-5 text-green-600" />}>
              {contact?.phone}
            </DataItem>
            {contact?.phoneVisibility && (
              <DataItem className="text-xs text-default-400 italic">
                {visibilityItems.find((v) => v.value === contact.phoneVisibility)?.label}
              </DataItem>
            )}
            <EditButton text="Editar" onPress={() => setIsFormVisible(true)} />
          </DataBox>

          <DataBox labelText="Instagram" className="-mt-2.5">
            <DataItem
              Icon={
                <IoLogoInstagram className="size-5 instagram-gradient text-white rounded-md overflow-hidden" />
              }
            >
              {contact?.instagram ? formatInstagamUrl(contact.instagram) : "-"}
            </DataItem>
            {contact?.instagramVisibility && (
              <DataItem className="text-xs text-default-400 italic">
                {visibilityItems.find((v) => v.value === contact.instagramVisibility)?.label}
              </DataItem>
            )}
          </DataBox>

          <DataBox labelText="Facebook">
            <DataItem Icon={<IoLogoFacebook className="size-5 text-blue-600" />}>
              {contact?.facebook ? formatFacebookUrl(contact.facebook) : "-"}
            </DataItem>
            {contact?.facebookVisibility && (
              <DataItem className="text-xs text-default-400 italic">
                {visibilityItems.find((v) => v.value === contact.facebookVisibility)?.label}
              </DataItem>
            )}
          </DataBox>

          <DataBox labelText="X/Twitter">
            <DataItem Icon={<FaXTwitter className="size-4 text-slate-900" />}>
              {contact?.x ? formatTwitterUrl(contact.x) : "-"}
            </DataItem>
            {contact?.xVisibility && (
              <DataItem className="text-xs text-default-400 italic">
                {visibilityItems.find((v) => v.value === contact.xVisibility)?.label}
              </DataItem>
            )}
          </DataBox>

          <DataBox labelText="Sitio Web">
            <DataItem Icon={<FaLink className="size-4 text-text-color" />}>
              {contact?.website ? extractDomain(contact.website) : "-"}
            </DataItem>
            {contact?.websiteVisibility && (
              <DataItem className="text-xs text-default-400 italic">
                {visibilityItems.find((v) => v.value === contact.websiteVisibility)?.label}
              </DataItem>
            )}
          </DataBox>

          <DataBox labelText="Curriculum">
            <DataItem>
              {contact?.curriculum?.ref ? "CV cargado" : "-"}
            </DataItem>
            {contact?.curriculum?.visibility && (
              <DataItem className="text-xs text-default-400 italic">
                {visibilityItems.find((v) => v.value === contact.curriculum?.visibility)?.label}
              </DataItem>
            )}
          </DataBox>

          {contact?.links && contact.links.length > 0 && (
            <DataBox labelText="Links adicionales">
              <div className="flex flex-col gap-1 flex-1">
                {contact.links.map((link, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <FaLink className="size-3 text-text-color shrink-0" />
                    <span className="flex-1 truncate">{link.label || extractDomain(link.url)}</span>
                    <span className="text-xs text-default-400 italic">
                      {visibilityItems.find((v) => v.value === link.visibility)?.label}
                    </span>
                  </div>
                ))}
              </div>
            </DataBox>
          )}
        </div>
      )}
    </AnimatedBox>
  );
};

export default SocialMedia;
