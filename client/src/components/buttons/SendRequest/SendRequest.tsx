import SendRequestGroup from "./SendRequestGroup";
import SendUserRequest from "./SendUserRequest";

const SendRequest = ({
  isGroup,
  variant = "light",
  removeMargin = true,
  idToSendRequest,
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
        />
      )}
    </>
  );
};

export default SendRequest;
