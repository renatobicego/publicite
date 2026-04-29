import { useState } from "react";
import DataBox, { DataItem, EditButton } from "../../DataBox";
import AnimatedBox from "../../AnimatedBox";
import DescriptionForm from "./DescriptionForm";
import { Contact } from "@/types/userTypes";
import { visibilityItems } from "@/utils/data/selectData";

const Description = ({
  description,
  isBusiness,
  contact,
}: {
  description?: string;
  isBusiness?: boolean;
  contact?: Contact;
}) => {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const displayDescription = contact?.description?.text ?? description;

  return (
    <AnimatedBox
      isVisible={isFormVisible}
      className="flex-1"
      keyValue="descrip"
    >
      {isFormVisible ? (
        <DescriptionForm
          key={"formDescription"}
          setIsFormVisible={setIsFormVisible}
          description={displayDescription}
          descriptionVisibility={contact?.description?.visibility}
          profesion={contact?.profesion?.label}
          profesionVisibility={contact?.profesion?.visibility}
          isBusiness={isBusiness}
          contactId={contact?._id}
        />
      ) : (
        <div className="flex flex-col gap-4 my-2.5">
          <DataBox labelText="Descripción">
            <DataItem className="max-md:order-last">{displayDescription}</DataItem>
            {contact?.description?.visibility && (
              <DataItem className="text-xs text-default-400 italic">
                {visibilityItems.find((v) => v.value === contact.description?.visibility)?.label}
              </DataItem>
            )}
            <EditButton text="Editar" onPress={() => setIsFormVisible(true)} />
          </DataBox>
          <DataBox labelText="Profesión" className="-mt-2.5">
            <DataItem>{contact?.profesion?.label ?? "-"}</DataItem>
            {contact?.profesion?.visibility && (
              <DataItem className="text-xs text-default-400 italic">
                {visibilityItems.find((v) => v.value === contact.profesion?.visibility)?.label}
              </DataItem>
            )}
          </DataBox>
        </div>
      )}
    </AnimatedBox>
  );
};

export default Description;
