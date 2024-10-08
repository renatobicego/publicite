import { Board } from "@/types/board";
import EmptyBoard from "./EmptyBoard";
import BoardContent from "./BoardContent";
import { handleBoardColor } from "@/utils/functions/utils";
import MyBoard from "./MyBoard";

interface BoardProps {
  isMyBoard: boolean; // if true, the card will be a my board
  board?: Board;
  isProfile?: boolean; // if true, the card will be a profile card
  name?: string;
  widthFull?: boolean; // if true, the card will take 100% of the parent width
}
const BoardCard = ({
  isMyBoard,
  board,
  isProfile = false,
  name,
  widthFull = false, 
}: BoardProps) => {
  const bg = board?.color || "bg-fondo";
  // Change style of board based in color of the board
  const { textColor, borderColor } = handleBoardColor(bg);
  // if the board doesn't exist, return an empty board
  if (!board) {
    return (
      <EmptyBoard isProfile={isProfile} name={name} widthFull={widthFull} />
    );
  }
  // if is my profile and is my board, return my board
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
    // return normal board
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
