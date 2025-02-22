"use client";

import BoardCard from "@/components/Board/Board";
import CreateBoard from "@/components/Board/CreateBoard/CreateBoard";
import { Board } from "@/types/board";
import { GetUser } from "@/types/userTypes";
import { useState } from "react";

const BoardLocalData = ({
  board,
  user,
  isMyProfile,
}: {
  board: Board;
  user: GetUser;
  isMyProfile: boolean;
}) => {
  const [localBoardData, setLocalBoardData] = useState(board);
  return (
    <>
      {localBoardData || !isMyProfile ? (
        <BoardCard
          board={localBoardData}
          isMyBoard={isMyProfile}
          isProfile
          name={
            "bussinessName" in user && user.bussinessName
              ? (user.bussinessName as string)
              : user.name
          }
        />
      ) : (
        <CreateBoard user={user} setLocalBoardData={setLocalBoardData} />
      )}
    </>
  );
};

export default BoardLocalData;
