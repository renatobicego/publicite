"use client";
import { Avatar, AvatarGroup } from "@nextui-org/react";

const Users = () => {
  return (
    <AvatarGroup
      isBordered
      max={3}
      total={10}
      renderCount={() => (
        <p className="text-small text-light-text ms-2">
          +100 usuarios suscriptos ¡Sé parte!
        </p>
      )}
    >
      <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
      <Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
      <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
      <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026302d" />
    </AvatarGroup>
  );
};

export default Users;
