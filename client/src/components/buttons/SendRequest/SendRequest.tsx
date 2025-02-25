import { UserRelations } from "@/types/userTypes";
import SendRequestGroup from "./SendRequestGroup";
import SendUserRequest from "./SendUserRequest";

const SendRequest = ({
  isGroup,
  variant = "light",
  removeMargin = true,
  idToSendRequest,
  previousUserRelation,
  setIsRequestSent,
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
  setIsRequestSent: () => void;
}) => {
  return (
    <>
      {isGroup ? (
        <SendRequestGroup
          removeMargin={removeMargin}
          variant={variant}
          groupId={idToSendRequest}
          setIsRequestSent={setIsRequestSent}
        />
      ) : (
        <SendUserRequest
          variant={variant}
          removeMargin={removeMargin}
          idToSendRequest={idToSendRequest}
          previousUserRelation={previousUserRelation}
          setIsRequestSent={setIsRequestSent}
        />
      )}
    </>
  );
};

export default SendRequest;
