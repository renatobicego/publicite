"use client";
import SecondaryButton from "../SecondaryButton";
import { useState } from "react";
import { putMemberGroup } from "@/services/groupsService";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useRouter } from "next-nprogress-bar";

const AcceptGroupInvitation = ({ groupId }: { groupId: string }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const handleAccept = async () => {
    setIsSubmitting(true);
    const res = await putMemberGroup(groupId);
    if ("error" in res) {
      toastifyError(res.error as string);
      return;
    }

    toastifySuccess(res.message as string);
    setIsSubmitting(false);
    router.refresh();
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
