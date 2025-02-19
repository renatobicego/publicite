import NotificationRenderer from "@/components/notifications/NotificationRenderer";
import { Spinner } from "@nextui-org/react";

const NotificationsContent = ({
  notifications,
  isLoading,
}: {
  notifications: BaseNotification[];
  isLoading: boolean;
}) => {
  return (
    <div className="max-md:mb-4 md:p-2 flex flex-col gap-2 min-w-60 relative">
      {!isLoading && notifications.length === 0 && (
        <p className="text-sm text-light-text">No hay notificaciones nuevas</p>
      )}
      <NotificationRenderer notifications={notifications} />
      {isLoading && (
        <div className="w-full flex justify-center items-center top-0 left-0">
          <Spinner color="warning" />
        </div>
      )}
    </div>
  );
};

export default NotificationsContent;
