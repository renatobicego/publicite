"use client";
import SecondaryButton from "../SecondaryButton";
import { useState } from "react";
import { putMemberGroup } from "@/services/groupsService";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useRouter } from "next/navigation";

const AcceptGroupInvitation = ({
  groupId,
  setIsRequestSent,
}: {
  groupId: string;
  setIsRequestSent: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  //router to refresh
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleAccept = async () => {
    setIsSubmitting(true);
    const res = await putMemberGroup(groupId);
    if ("error" in res) {
      toastifyError(res.error as string);
      return;
    }
    setIsRequestSent(true);
    toastifySuccess(res.message as string);
    setIsSubmitting(false);
  };
  return (
    <SecondaryButton
      isDisabled={isSubmitting}
      isLoading={isSubmitting}
      onPress={handleAccept}
    >
      Aceptar Invitación
    </SecondaryButton>
  );
};

export default AcceptGroupInvitation;
