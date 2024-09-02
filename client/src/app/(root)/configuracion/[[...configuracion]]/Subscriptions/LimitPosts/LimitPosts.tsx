import { useState } from "react";
import AnimatedBox from "../../AnimatedBox";
import DataBox, { CardDataItem, DataItem, EditButton } from "../../DataBox";
import LimitPostForm from "./LimitPostForm";
import { Button } from "@nextui-org/react";

const LimitPosts = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);

  return (
    <AnimatedBox isVisible={isFormVisible} className="flex-1">
      {isFormVisible ? (
        <LimitPostForm
          key={"formLimitPostsForm"}
          //   setIsFormVisible={setIsFormVisible}
        />
      ) : (
        <DataBox
          className=" max-md:my-2.5 !items-start"
          labelText="Límite de Publicaciones Activas"
          labelClassname="md:w-1/4 md:my-2.5 max-md:flex-none max-md:max-w-[65%] max-md:min-w-[40px]"
        >
          <div className="flex flex-col gap-2 flex-1 my-2.5">
            <DataItem className="font-semibold">
              60 publicaciones activas
            </DataItem>
            <CardDataItem
              title="50 publicaciones"
              subtitle="Publicité Premium"
            />
            <CardDataItem
              title="10 publicaciones"
              subtitle="Pack de 10 publicaciones"
              boldLabel="Disponible hasta: 17/09"
            />
          </div>
          <Button
            color="secondary"
            variant="light"
            radius="full"
            className={`font-normal max-md:absolute max-md:right-0 max-md:-top-2.5`}
          >
            Aumentar Límite
          </Button>
        </DataBox>
      )}
    </AnimatedBox>
  );
};

export default LimitPosts;
