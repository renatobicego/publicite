import { UserRelations } from "@/types/userTypes";
import SendRequestGroup from "./SendRequestGroup";
import SendUserRequest from "./SendUserRequest";

const SendRequest = ({
  isGroup,
  variant = "light",
  removeMargin = true,
  idToSendRequest,
  previousUserRelation,
}: {
  isGroup?: boolean;
  variant?:
    | "light"
    | "solid"
    | "bordered"
    | "flat"
    | "faded"
    | "shadow"
    | "ghost";
  removeMargin?: boolean;
  idToSendRequest: string;
  previousUserRelation?: UserRelations; // for editing previous type of relation
}) => {
  return (
    <>
      {isGroup ? (
        <SendRequestGroup
          removeMargin={removeMargin}
          variant={variant}
          groupId={idToSendRequest}
        />
      ) : (
        <SendUserRequest
          variant={variant}
          removeMargin={removeMargin}
          idToSendRequest={idToSendRequest}
          previousUserRelation={previousUserRelation}
        />
      )}
    </>
  );
};

export default SendRequest;
