import { Button } from "@nextui-org/react";
import { useState } from "react";

const Profile = () => {
  console.log("re-render")
  const [show, setShow] = useState(false);
  return (
    <section className="flex flex-col gap-4">
      <h2 className="profile-title">Datos de Perfil</h2>
      {show ? (
        <Button onPress={() => setShow(false)}>
          Hide
        </Button>
      ) : (
        <Button onPress={() => setShow(true)}>
          Show
        </Button>
      )}
    </section>
  );
};

export default Profile;