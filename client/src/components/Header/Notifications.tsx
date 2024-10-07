import {
  Button,
  Badge,
  PopoverTrigger,
  Popover,
  PopoverContent,
  useDisclosure,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { FaBell } from "react-icons/fa6";
import NewContactPost from "../notifications/posts/NewContactPost";
import { mockedPosts, mockedUsers } from "@/utils/data/mockedData";
import NewContactRequest from "../notifications/NewContactRequest";
import GroupInvitation from "../notifications/groups/GroupNotification";
import PostShared from "../notifications/posts/PostShared";
import MagazineInvitation from "../notifications/MagazineInvitation";
import PaymentSuccess from "../notifications/suscriptions/PaymentSuccess";
import { useEffect, useState } from "react";

const Notifications = () => {
  const [screenSize, setScreenSize] = useState(0);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setScreenSize(window.innerWidth);
    }

    const handleResize = () => {
      setScreenSize(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <>
      {screenSize < 1024 ? <MobileNotifications /> : <DesktopNotifications />}
    </>
  );
};

export default Notifications;

const DesktopNotifications = () => {
  return (
    <Popover
      className="max-h-[80vh] overflow-y-auto max-lg:hidden"
      shouldBlockScroll
      placement="bottom-end"
    >
      <PopoverTrigger>
        <Button radius="full" variant="light" isIconOnly>
          <Badge content="" size="sm" color="primary">
            <FaBell className="size-6" />
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <NotificationsContent />
      </PopoverContent>
    </Popover>
  );
};

const MobileNotifications = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button
        onPress={onOpen}
        radius="full"
        variant="light"
        isIconOnly
        className="lg:hidden"
      >
        <Badge content="" size="sm" color="primary">
          <FaBell className="size-6" />
        </Badge>
      </Button>
      <Modal placement="center" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalBody>
            <NotificationsContent />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

const NotificationsContent = () => {
  return (
    <div className="p-2 flex flex-col gap-2">
      <div className="font-bold">Notificaciones</div>
      <NewContactPost
        notification={{
          _id: "1",
          date: "2022-01-01",
          message: "¡Has recibido una petición de contacto!",
          post: mockedPosts[0],
        }}
      />
      <NewContactRequest
        notification={{
          _id: "2",
          date: "2022-01-01",
          typeRelation: "contact",
          user: {
            _id: "qeq",
            profilePhotoUrl: "avatar.png",
            username: "username",
          },
        }}
      />
      <GroupInvitation
        notification={{
          _id: "3",
          date: "2022-01-01",
          group: { _id: "1", name: "Computadoras", profilePhotoUrl: "" },
          userInviting: { username: "username" },
          type: "groupInvitation",
        }}
      />
      <PostShared
        notification={{
          _id: "4",
          date: "2022-01-01",
          post: mockedPosts[0],
          userSharing: mockedUsers[0],
        }}
      />
      <MagazineInvitation
        notification={{
          _id: "5",
          date: "2024-01-01",
          magazine: { _id: "1", name: "Computadoras" },
          userInviting: { username: "username" },
        }}
      />
      <PaymentSuccess
        notification={{
          _id: "6",
          date: "2024-01-01",
          subscriptionPlan: {
            reason: "Suscripción mensual",
          },
        }}
      />
    </div>
  );
};
