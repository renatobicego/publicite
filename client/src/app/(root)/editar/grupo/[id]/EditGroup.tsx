import { Group } from "@/types/userTypes";

const EditGroup = ({ groupData }: { groupData: Group }) => {
  const initialValues: Group = {
    _id: groupData._id,
    name: groupData.name,
    admins: groupData.admins,
    details: groupData.details,
    rules: groupData.rules,
    magazines: groupData.magazines,
    members: groupData.members,
    profilePhotoUrl: groupData.profilePhotoUrl,
    visibility: groupData.visibility,
  };
  return <div>EditGroup</div>;
};

export default EditGroup;
