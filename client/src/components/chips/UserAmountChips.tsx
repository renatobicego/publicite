import { Chip } from "@nextui-org/react";
import axios from "axios";

const UserAmountChips = async () => {
  // const { data: userCount }: { data: number } = await axios.get(
  //   `${process.env.API_URL}/user/count`
  // );

  return (
    <Chip className="mt-2 bg-service text-white">¡{} usuarios activos!</Chip>
  );
};

export default UserAmountChips;
