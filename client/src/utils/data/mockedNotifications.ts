import {
  MagazineInvitationNotification,
  PostContactNotification,
  PostSharedNotification,
} from "@/types/postTypes";
import { mockedPosts, mockedUsers } from "./mockedData";
import {
  GroupInvitationNotification,
  NewContactRelationNotification,
} from "@/types/userTypes";
import { PaymentSuccesNotification } from "@/types/subscriptions";

export const mockedNewContactPost: PostContactNotification = {
  _id: "1",
  date: "2022-01-01",
  message: "¡Has recibido una petición de contacto!",
  post: mockedPosts[0],
  contactPetition: {
    email: "email@example.com",
    message: "Este es el mensaje enviado por el usuario renatobicego",
    phone: "1234567890",
    post: mockedPosts[0]._id,
    fullName: "Renato Bicego",
  },
};
export const mockedNewContactPostSamePost: PostContactNotification = {
  _id: "1a",
  date: "2024-01-01",
  message: "¡Has recibido una petición de contacto!",
  post: mockedPosts[0],
  contactPetition: {
    email: "email@example.com",
    message: "Este es el mensaje enviado por el usuario maxi",
    phone: "1234567890",
    post: mockedPosts[0]._id,
    fullName: "Maxi Cattaneo",
  },
};

export const mockedNewContactPost2: PostContactNotification = {
  _id: "12",
  date: "2024-01-01",
  message: "¡Has recibido una petición de contacto!",
  post: mockedPosts[1],
  contactPetition: {
    email: "email@example.com",
    message: "Este es el mensaje enviado por el usuario maxi",
    phone: "1234567890", 
    post: mockedPosts[1]._id,
    fullName: "Maxi Cattaneo",
  },
};

export const mockedNewContactRelation: NewContactRelationNotification = {
  _id: "2",
  date: "2022-01-01",
  typeRelation: "contact",
  user: {
    _id: "qeq",
    profilePhotoUrl: "avatar.png",
    username: "username",
  },
};

export const mockedGroupInvitation: GroupInvitationNotification = {
  _id: "3",
  date: "2022-01-01",
  group: { _id: "1", name: "Computadoras", profilePhotoUrl: "" },
  userInviting: { username: "username" },
  type: "groupInvitation",
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

export const mockedPaymentSuccess: PaymentSuccesNotification = {
  _id: "6",
  date: "2024-01-01",
  subscriptionPlan: {
    reason: "Suscripción mensual",
  },
};
