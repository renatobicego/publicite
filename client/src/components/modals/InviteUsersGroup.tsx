import { FaPlus } from "react-icons/fa6"
import PrimaryButton from "../buttons/PrimaryButton"

const InviteUsersGroup = () => {
  return (
    <PrimaryButton startContent={<FaPlus />}>
        Invitar Miembros
    </PrimaryButton>
  )
}

export default InviteUsersGroup