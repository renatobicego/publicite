"use client";
import SecondaryButton from "../SecondaryButton";
import { useState } from "react";
import { putMemberGroup } from "@/services/groupsService";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useRouter } from "next/navigation";

const AcceptGroupInvitation = ({ groupId }: { groupId: string }) => {
  //router to refresh
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleAccept = async () => {
    setIsSubmitting(true);
    const res = await putMemberGroup(groupId);
    if ("error" in res) {
      toastifyError(res.error as string);
      return;
    }
    toastifySuccess(res.message as string);
    router.refresh();
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
