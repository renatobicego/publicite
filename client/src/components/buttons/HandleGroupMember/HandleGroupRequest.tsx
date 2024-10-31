import ConfirmModal from "@/components/modals/ConfirmModal";
import { User } from "@/types/userTypes";
import { Button } from "@nextui-org/react";
import { FaCheck, FaX } from "react-icons/fa6";

const HandleGroupRequest = ({
  user,
  groupId,
}: {
  user: User;
  groupId: string;
}) => {
  const handleAcceptRequest = () => {};
  const rejectRequest = () => {};
  return (
    <div className="flex gap-2 items-center">
      <ConfirmModal
        ButtonAction={
          <Button
            size="sm"
            isIconOnly
            color="primary"
            variant="flat"
            radius="full"
          >
            <FaCheck />
          </Button>
        }
        message={`¿Desea aceptar la solicitud de grupo?`}
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
        message={`¿Desea rechazar la solicitud de grupo?`}
        tooltipMessage="Rechazar"
        confirmText="Rechazar"
        onConfirm={rejectRequest}
      />
    </div>
  );
};

export default HandleGroupRequest;
