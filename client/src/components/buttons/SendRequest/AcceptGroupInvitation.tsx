"use client";
import { acceptGroupInvitation } from "@/components/notifications/groups/actions";
import SecondaryButton from "../SecondaryButton";
import { useRouter } from "next-nprogress-bar";
import { useState } from "react";

const AcceptGroupInvitation = ({ groupId }: { groupId: string }) => {
  //router to refresh
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleAccept = async () => {
    setIsSubmitting(true);
    await acceptGroupInvitation(groupId);
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
