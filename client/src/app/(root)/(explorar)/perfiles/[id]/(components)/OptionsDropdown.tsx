"use client";
import ShareButton from "@/components/buttons/ShareButton";
import { GetUser } from "@/types/userTypes";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { useRef, useState } from "react";
import EditCartelModal from "./EditCartelModal";
import { FaShareAlt } from "react-icons/fa";
import { FaChevronDown, FaPen } from "react-icons/fa6";

const OptionsDropdown = ({
  user,
  isMyProfile = false,
}: {
  user: GetUser;
  isMyProfile?: boolean;
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const userShareRef = useRef<() => void>(() => { });
  const handleShareOpenModal = () => {
    if (userShareRef.current) {
      userShareRef.current(); // Trigger custom open function to open the modal
    }
  };
  return (
    <>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button
            radius="full"
            size="sm"
            isIconOnly
            aria-label="opciones de perfil"
            variant="light"
          >
            <FaChevronDown />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="opciones de perfil">
          <DropdownItem
            startContent={<FaShareAlt />}
            color="secondary"
            key="new"
            className="rounded-full px-4"
            onPress={handleShareOpenModal}
          >
            Compartir
          </DropdownItem>
          {isMyProfile ? (
            <DropdownItem
              startContent={<FaPen />}
              key="edit"
              className="rounded-full px-4"
              onPress={() => setIsEditOpen(true)}
            >
              Editar cartel
            </DropdownItem>
          ) : null}
        </DropdownMenu>
      </Dropdown>
      <ShareButton
        shareType="user"
        ButtonAction={<></>}
        data={{
          _id: user._id,
          description: user.username,
          type: "user",
          imageUrl: user.profilePhotoUrl,
        }}
        customOpen={(openModal) => (userShareRef.current = openModal)}
      />
      {isMyProfile && (
        <EditCartelModal
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
          username={user.username}
          userType={user.userType}
        />
      )}
    </>
  );
};

export default OptionsDropdown;
