"use client";
import AcceptGroupInvitation from "@/components/buttons/SendRequest/AcceptGroupInvitation";
import SendRequest from "@/components/buttons/SendRequest/SendRequest";
import React, { useState } from "react";
import RulesPopover from "./RulesPopover";

const GroupActionButton = ({
  isMember,
  hasGroupRequest,
  hasJoinRequest,
  rules,
  groupId,
}: {
  isMember: boolean;
  hasGroupRequest: boolean;
  hasJoinRequest: boolean;
  rules: string;
  groupId: string;
}) => {
  const actionButtonToReturn = () => {
    switch (true) {
      case isMember:
        return <RulesPopover rules={rules} />;
      case hasGroupRequest:
        return (
          <AcceptGroupInvitation
            groupId={groupId}
            setIsRequestSent={() => window.location.reload()}
          />
        );
      case hasJoinRequest:
        return (
          <p className="text-sm lg:text-small text-light-text">
            Solicitud Enviada
          </p>
        );
      default:
        return (
          <SendRequest
            variant="solid"
            removeMargin={false}
            isGroup
            idToSendRequest={groupId}
            setIsRequestSent={() => window.location.reload()}
          />
        );
    }
  };
  return actionButtonToReturn();
};

export default GroupActionButton;
