import { Divider, Switch } from "@nextui-org/react";
import CheckboxNotifications from "./CheckboxNotifications";

const Notifications = () => {
  return (
    <section className="flex flex-col gap-4 items-start">
      <h2 className="profile-title">Preferencia de Notificaciones</h2>
      <Divider />
      <div className="flex gap-4 w-full justify-between items-center">
        <div className="flex gap-2 items-start flex-col">
          <h6>Notificaciones por Mail</h6>
          <p className="text-xs">
            Recibiriás notificaciones por mail, en conjunto con las
            notificaciones recibidas por la aplicación.
          </p>
        </div>
        <Switch isSelected aria-label="Notificaciones por Mail" />
      </div>
      <CheckboxNotifications />
    </section>
  );
};

export default Notifications;
