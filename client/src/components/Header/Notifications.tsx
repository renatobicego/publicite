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
import {
  mockedGroupInvitation,
  mockedMagazineInvitation,
  mockedNewContactPost,
  mockedNewContactRelation,
  mockedPaymentSuccess,
  mockedPostShared,
  mockedReviewPost,
} from "@/utils/data/mockedNotifications";
import ReviewRequest from "../notifications/posts/ReviewRequest";

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
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover
      className=" max-lg:hidden"
      shouldBlockScroll
      placement="bottom-end"
      triggerType="menu"
      containerPadding={10}
      backdrop="transparent"
      classNames={{
        base: "max-h-[60vh] overflow-y-auto shadow-lg rounded-xl",
        content: "mt-2",
      }}
      isOpen={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
    >
      <PopoverTrigger>
        <Button radius="full" variant="light" isIconOnly>
          <Badge content="" size="sm" color="primary">
            <FaBell className="size-6" />
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        {isOpen ? <NotificationsContent /> : <></>}
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
      <Modal
        classNames={{ body: "max-h-[80vh] overflow-y-auto px-0", header: "px-0" }}
        placement="center"
        className="max-md:px-4"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          <ModalHeader>
            <h5>Notificaciones</h5>
          </ModalHeader>
          <ModalBody>{isOpen && <NotificationsContent />}</ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

const NotificationsContent = () => {
  return (
    <div className="max-md:mb-4 md:p-2 flex flex-col gap-2">
      <NewContactPost notification={mockedNewContactPost} />
      <NewContactRequest notification={mockedNewContactRelation} />
      <GroupInvitation notification={mockedGroupInvitation} />
      <PostShared notification={mockedPostShared} />
      <MagazineInvitation notification={mockedMagazineInvitation} />
      <PaymentSuccess notification={mockedPaymentSuccess} />
      <ReviewRequest notification={mockedReviewPost} />
    </div>
  );
};
