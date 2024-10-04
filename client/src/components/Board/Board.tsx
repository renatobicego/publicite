import { Board } from "@/types/board";
import EmptyBoard from "./EmptyBoard";
import BoardContent from "./BoardContent";
import { handleBoardColor } from "@/utils/functions/utils";
import MyBoard from "./MyBoard";

interface BoardProps {
  isMyBoard: boolean;
  board?: Board;
  isProfile?: boolean;
  name?: string;
  widthFull?: boolean;
}
const BoardCard = ({
  isMyBoard,
  board,
  isProfile = false,
  name,
  widthFull = false,
}: BoardProps) => {
  const bg = board?.color || "bg-fondo";
  const { textColor, borderColor } = handleBoardColor(bg);
  if (!board) {
    return (
      <EmptyBoard isProfile={isProfile} name={name} widthFull={widthFull} />
    );
  }
  if (isProfile && isMyBoard) {
    return (
      <MyBoard
        board={board}
        borderColor={borderColor}
        textColor={textColor}
        name={name}
        widthFull={widthFull}
      />
    );
  } else {
    return (
      <BoardContent
        isProfile={isProfile}
        board={board}
        widthFull={widthFull}
        textColor={textColor}
        borderColor={borderColor}
        name={name}
      />
    );
  }
};

export default BoardCard;
