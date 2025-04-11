"use client";

import { useSocket } from "@/app/socketProvider";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import {
  acceptChangeContactRequest,
  acceptNewContactRequest,
} from "@/components/notifications/users/actions";
import { useRouter } from "next/navigation";

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
    userRelationId: string;
    toRelationShipChange: UserRelation;
    newRelation: UserRelation;
  };
  userIdTo: string;
}) => {
  const { socket } = useSocket();
  const router = useRouter();
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
        isAcceptRequestFriend.toRelationShipChange,
        isAcceptRequestFriend.notification_id,
        isAcceptRequestFriend.userRelationId
      );
    } else if (
      isAcceptRequestFriend.type === "notification_user_new_friend_request"
    ) {
      acceptNewContactRequest(
        socket,
        userIdTo,
        isAcceptRequestFriend.newRelation,
        isAcceptRequestFriend.notification_id
      );
    }
    router.refresh();
  };
  return (
    <PrimaryButton
      onPress={acceptRequest}
      className="hover:bg-none"
      variant="bordered"
    >
      {textToShow}
    </PrimaryButton>
  );
};

export default AcceptRequestFriend;
