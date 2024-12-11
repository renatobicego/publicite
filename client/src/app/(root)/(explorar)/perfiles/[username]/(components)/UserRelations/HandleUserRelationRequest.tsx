import { useSocket } from "@/app/socketProvider";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { Button } from "@nextui-org/react";
import { useRouter } from "next-nprogress-bar";
import { FaCheck, FaX } from "react-icons/fa6";

const HandleUserRelationRequest = () => {
  const { updateSocketToken } = useSocket();
  const router = useRouter();
  const handleAcceptRequest = async () => {};
  const rejectRequest = async () => {};
  return (
    <div className="flex gap-2 items-center">
      <ConfirmModal
        ButtonAction={
          <Button
            size="sm"
            isIconOnly
            color="secondary"
            variant="flat"
            radius="full"
          >
            <FaCheck />
          </Button>
        }
        message={`¿Desea aceptar la solicitud?`}
        tooltipMessage="Aceptar"
        confirmText="Aceptar"
        onConfirm={handleAcceptRequest}
      />
      <ConfirmModal
        ButtonAction={
          <Button
            size="sm"
            isIconOnly
            color="danger"
            variant="flat"
            radius="full"
          >
            <FaX />
          </Button>
        }
        message={`¿Desea rechazar la solicitud?`}
        tooltipMessage="Rechazar"
        confirmText="Rechazar"
        onConfirm={rejectRequest}
      />
    </div>
  );
};

export default HandleUserRelationRequest;
