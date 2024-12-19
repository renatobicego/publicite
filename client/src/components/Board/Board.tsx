import { Board } from "@/types/board";
import EmptyBoard from "./EmptyBoard";
import BoardContent from "./BoardContent";
import MyBoard from "./MyBoard";

interface BoardProps {
  isMyBoard: boolean; // if true, the card will be a my board card
  board?: Board;
  isProfile?: boolean; // if true, the card will be a profile card (show on profile of user). If not, is a board from search of boards
  name?: string;
  widthFull?: boolean; // if true, the card will take 100% of the parent width
  user?: {
    fullName: string;
    username: string;
    _id: string;
  }
}
const BoardCard = ({
  isMyBoard,
  board,
  isProfile = false,
  name,
  widthFull = false, 
  user
}: BoardProps) => {

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
        name={name}
        user={user}
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
        name={name}
      />
    );
  }
};

export default BoardCard;
