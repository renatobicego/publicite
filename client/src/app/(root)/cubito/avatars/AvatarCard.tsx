"use client";

import { Button, Card, CardBody, Tooltip } from "@nextui-org/react";
import { FaPen, FaTrash } from "react-icons/fa6";

import ConfirmModal from "@/components/modals/ConfirmModal";
import { Avatar } from "@/types/avatarTypes";
import AvatarImage from "./AvatarImage";

interface AvatarCardProps {
  avatar: Avatar;
  onEdit: (avatar: Avatar) => void;
  onDelete: (avatar: Avatar) => void;
}

export default function AvatarCard({
  avatar,
  onEdit,
  onDelete,
}: AvatarCardProps) {
  return (
    <Card className="w-full">
      <CardBody className="flex flex-row items-start gap-4">
        <AvatarImage seed={avatar.seed || avatar._id} size={48} alt={avatar.name} />

        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{avatar.name}</p>
          <p className="text-xs text-default-500 line-clamp-3">
            {avatar.context}
          </p>
        </div>

        <div className="flex gap-1">
          <Tooltip placement="bottom" content="Editar">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              radius="full"
              aria-label={`Editar ${avatar.name}`}
              onPress={() => onEdit(avatar)}
            >
              <FaPen size={13} />
            </Button>
          </Tooltip>

          <ConfirmModal
            ButtonAction={
              <Button
                isIconOnly
                size="sm"
                variant="light"
                radius="full"
                color="danger"
                aria-label={`Eliminar ${avatar.name}`}
              >
                <FaTrash size={13} />
              </Button>
            }
            message={`¿Eliminar el avatar "${avatar.name}"?`}
            sideText="Las conversaciones anteriores no se modifican."
            tooltipMessage="Eliminar"
            confirmText="Eliminar"
            onConfirm={() => onDelete(avatar)}
          />
        </div>
      </CardBody>
    </Card>
  );
}
