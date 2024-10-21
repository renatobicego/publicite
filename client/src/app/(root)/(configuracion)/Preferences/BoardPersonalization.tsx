import DataBox from "../DataBox";
import BoardCard from "@/components/Board/Board";
import BoardColor from "@/components/Board/inputs/BoardColor";
import { Board } from "@/types/board";
import { editBoard } from "@/app/server/boardActions";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useRouter } from "next-nprogress-bar";

const BoardPersonalization = ({ board }: { board: Board }) => {
  const router = useRouter();
  const setColorSelected = async (color: string) => {
    const resApi = await editBoard(board._id, { color });
    if (resApi.error) {
      toastifyError(resApi.error);
      return;
    }
    toastifySuccess(resApi.message as string);
    router.refresh();
  };

  return (
    <DataBox
      labelText="Personalizar Pizarra"
      className="!items-start mt-2.5"
      labelClassname="mt-1"
    >
      <div className="flex-1 flex flex-col gap-4">
        <BoardColor
          colorSelected={board.color || "bg-fondo"}
          setColorSelected={setColorSelected}
        />
        <BoardCard
          isMyBoard={false}
          isProfile
          widthFull
          name={board.user.username}
          board={board}
        />
      </div>
    </DataBox>
  );
};

export default BoardPersonalization;
