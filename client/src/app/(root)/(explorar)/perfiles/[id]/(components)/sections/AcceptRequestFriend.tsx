"use client";

import { useSocket } from "@/app/socketProvider";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import {
  acceptChangeContactRequest,
  acceptNewContactRequest,
} from "@/components/notifications/users/actions";

const AcceptRequestFriend = ({
  isAcceptRequestFriend,
  userIdTo,
}: {
  isAcceptRequestFriend: {
    notification_id: string;
    type:
      | "notification_user_new_friend_request"
      | "notification_user_new_relation_change";
    value: boolean;
  };
  userIdTo: string;
}) => {
  const { socket } = useSocket();
  const textToShow =
    isAcceptRequestFriend.type === "notification_user_new_relation_change"
      ? "Aceptar Cambio de Relación"
      : "Aceptar Solicitud";

  const acceptRequest = () => {
    if (
      isAcceptRequestFriend.type === "notification_user_new_relation_change"
    ) {
      acceptChangeContactRequest(
        socket,
        userIdTo,
        "contacts",
        isAcceptRequestFriend.notification_id
      );
    } else if (
      isAcceptRequestFriend.type === "notification_user_new_friend_request"
    ) {
      acceptNewContactRequest(
        socket,
        userIdTo,
        "contacts",
        isAcceptRequestFriend.notification_id
      );
    }
  };
  return (
    <PrimaryButton
      onPress={acceptRequest}
      isDisabled
      className="hover:bg-none"
      variant="bordered"
    >
      {textToShow}
    </PrimaryButton>
  );
};

export default AcceptRequestFriend;
