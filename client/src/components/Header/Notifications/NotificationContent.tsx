import MagazineInvitation from "@/components/notifications/MagazineInvitation";
import NewContactRequest from "@/components/notifications/NewContactRequest";
import NewContactPost from "@/components/notifications/posts/NewContactPost";
import PostShared from "@/components/notifications/posts/PostShared";
import ReviewRequest from "@/components/notifications/posts/ReviewRequest";
import PaymentSuccess from "@/components/notifications/suscriptions/PaymentSuccess";
import { mockedNewContactPost, mockedNewContactRelation, mockedGroupInvitation, mockedPostShared, mockedMagazineInvitation, mockedPaymentSuccess, mockedReviewPost } from "@/utils/data/mockedNotifications";
import GroupInvitation from "@/components/notifications/groups/GroupNotification";

const NotificationsContent = () => {
  return (
    <div className="max-md:mb-4 md:p-2 flex flex-col gap-2">
      <NewContactPost notification={mockedNewContactPost} />
      <NewContactRequest notification={mockedNewContactRelation} />
      <GroupInvitation notification={mockedGroupInvitation} />
      <PostShared notification={mockedPostShared} />
      <MagazineInvitation notification={mockedMagazineInvitation} />
      <PaymentSuccess notification={mockedPaymentSuccess} />
      <ReviewRequest notification={mockedReviewPost} />
    </div>
  );
};

export default NotificationsContent;