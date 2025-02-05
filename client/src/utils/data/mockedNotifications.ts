import {
  ContactSellerNotification,
  PostSharedNotification,
  ReviewPostNotification,
} from "@/types/postTypes";
import { mockedPosts, mockedUsers } from "./mockedData";
import { NewContactRelationNotification } from "@/types/userTypes";
import { PaymentNotificationType } from "@/types/subscriptions";
import { MagazineInvitationNotification } from "@/types/magazineTypes";
import { GroupNotification } from "@/types/groupTypes";

export const mockedNewContactPost: ContactSellerNotification = {
  _id: "1",
  date: "2022-01-01",
  backData: { userIdTo: "1", userIdFrom: "2" },
  event: "contact_seller_new_request",
  frontData: {
    contactSeller: {
      client: {
        email: "email@example.com",
        message: "Este es el mensaje enviado por el usuario maxi",
        phone: "1234567890",
        lastName: "Cattaneo",
        name: "Maxi",
        post: mockedPosts[0]._id,
        _id: "1",
        username: "maxi",
      },
      post: mockedPosts[0],
    },
  },
  isActionsAvailable: true,
  previousNotificationId: null,
  viewed: false,
};
export const mockedNewContactPostSamePost: ContactSellerNotification = {
  _id: "1qs",
  date: "2022-01-01",
  backData: { userIdTo: "1", userIdFrom: "2" },
  event: "contact_seller_new_request",
  frontData: {
    contactSeller: {
      client: {
        email: "email@example.com",
        message: "Este es el mensaje enviado por el usuario maxi",
        phone: "1234567890",
        lastName: "Cattaneo",
        name: "Maxi",
        post: mockedPosts[0]._id,
        _id: "1a",
        username: "maxi",
      },
      post: mockedPosts[0],
    },
  },
  isActionsAvailable: true,
  previousNotificationId: null,
  viewed: false,
};

export const mockedNewContactPost2: ContactSellerNotification = {
  _id: "1sA",
  date: "2022-01-01",
  backData: { userIdTo: "1", userIdFrom: "2" },
  event: "contact_seller_new_request",
  frontData: {
    contactSeller: {
      client: {
        email: "email@example.com",
        message: "Este es el mensaje enviado por el usuario maxi",
        phone: "1234567890",
        lastName: "Cattaneo",
        name: "Maxi",
        post: mockedPosts[1]._id,
        _id: "1",
        username: "maxi",
      },
      post: mockedPosts[1],
    },
  },
  isActionsAvailable: true,
  previousNotificationId: null,
  viewed: false,
};

export const mockedNewContactRelation: NewContactRelationNotification = {
  _id: "2",
  date: "2022-01-01",
  typeRelation: "contacts",
  user: {
    _id: "qeq",
    profilePhotoUrl: "avatar.png",
    username: "username",
  },
};

export const mockedGroupInvitation: GroupNotification = {
  _id: "3",
  backData: { userIdTo: "1", userIdFrom: "2" },
  date: "2022-01-01",
  event: "notification_group_user_request_sent",
  viewed: false,
  frontData: {
    group: {
      _id: "1",
      name: "Computadoras",
      profilePhotoUrl: "",
      userInviting: { _id: "2", username: "username" },
    },
  },
  isActionsAvailable: true,
  previousNotificationId: null,
};

export const mockedPostShared: PostSharedNotification = {
  _id: "4",
  date: "2022-01-01",
  post: mockedPosts[0],
  userSharing: mockedUsers[0],
};

export const mockedMagazineInvitation: MagazineInvitationNotification = {
  _id: "5",
  date: "2024-01-01",
  magazine: { _id: "1", name: "Computadoras" },
  userInviting: { username: "username" },
};

export const mockedPaymentSuccess: PaymentNotificationType = {
  _id: "6",
  date: "2024-01-01",
  subscriptionPlan: {
    reason: "Suscripción mensual",
  },
};

export const mockedReviewPost: ReviewPostNotification = {
  _id: "7",
  date: "2024-01-01",
  post: mockedPosts[0],
  userAsking: mockedUsers[0],
};
