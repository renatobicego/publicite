import { Good, Petition, Service } from "@/types/postTypes";
import { SubscriptionPlan } from "@/types/subscriptions";

const mockedGood: Good = {
  _id: "1",
  imagesUrls: ["/moto.png", "/Rectangle 13.png", "/Rectangle 14.png", "/Rectangle 15.png"],
  year: 2022,
  brand: "brand",
  model: "model",
  reviews: [
    {
      _id: "231",
      rating: 5,
      review: "review",
      author: {
        profilePhotoUrl: "/avatar.png",
        username: "username",
      },
      date: "2024-07-12",
    },
    {
      _id: "232",
      rating: 4,
      review: "review",
      author: {
        profilePhotoUrl: "/avatar.png",
        username: "username",
      },
      date: "2024-07-12",
    },
  ],
  condition: "New",
  price: 1000,
  location: {
    _id: "1",
    lat: 0,
    lng: 0,
  },
  category: {
    _id: "1",
    label: "Vehículos",
  },
  attachedFiles: [],
  comments: [],
  postType: "Good",
  visibility: {
    post: "Public",
    socialMedia: "Public",
  },
  recommendations: [],
  description: "Entrega un mínimo anticipo y llévate tu 0km! 💥",
  title: "Yamaha YBR-Z",
  author: {
    profilePhotoUrl: "/avatar.png",
    username: "username",
    contact: {
      _id: "121",
      phone: "phone",
    },
    lastName: "lastName",
    name: "name",
  },
  createdAt: "2024-07-12",
};

const mockedService: Service = {
  _id: "1",
  imagesUrls: ["/catering.png"],
  description:
    "Te invitamos a que nos conozcas y puedas disfrutar con tus seres queridos de tu evento tal como lo soñaste. Elaboramos bocadillos totalmente caseros y con material de primera calidad.",
  title: "Lunch para eventos social y corporativos",
  price: 1000,
  location: {
    _id: "1",
    lat: 0,
    lng: 0,
  },
  category: {
    _id: "2",
    label: "Servicios de cocina",
  },
  attachedFiles: [],
  comments: [
    {
      _id: "2312",
      author: {
        profilePhotoUrl: "/avatar.png",
        username: "username",
      },
      comment: "comment",
      date: "2024-07-12",
      replies: [],
    },
  ],
  postType: "Service",
  visibility: {
    post: "Public",
    socialMedia: "Public",
  },
  recommendations: [],
  frequencyPrice: "hour",
  reviews: [],
  author: {
    profilePhotoUrl: "/avatar.png",
    username: "username",
    contact: {
      _id: "121",
      phone: "phone",
    },
    lastName: "lastName",
    name: "name",
  },
  createdAt: "2024-07-12",
};

const mockedPetition: Petition = {
  _id: "1452",
  title: "Busco iPhone 14 Pro Max",
  description:
    "Esto en búsqueda de un iPhone 14 pro max nuevo en caja, de 128gb. Cualquier duda o consulta puede contactarme por este medio. Gracias",
  author: {
    profilePhotoUrl: "/avatar.png",
    username: "username",
    contact: {
      _id: "121",
      phone: "phone",
    },
    lastName: "lastName",
    name: "name",
  },
  category: {
    _id: "1",
    label: "Teléfonos y Compoutadoras",
  },
  postType: "Petition",
  petitionType: "Good",
  visibility: {
    post: "Public",
    socialMedia: "Public",
  },
  recommendations: [],
  attachedFiles: [],
  comments: [],
  price: 1000,
  location: {
    _id: "1",
    lat: 0,
    lng: 0,
  },
  toPrice: 2000,
  createdAt: "2024-07-12",
};

const mockedPetition2: Petition = {
  _id: "14152",
  title: "Busco alquiler por Godoy Cruz",
  author: {
    profilePhotoUrl: "/avatar.png",
    username: "username",
    contact: {
      _id: "121",
      phone: "phone",
    },
    lastName: "lastName",
    name: "name",
  },
  category: {
    _id: "1",
    label: "Teléfonos y Compoutadoras",
  },
  postType: "Petition",
  petitionType: "Service",
  frequencyPrice: "month",
  visibility: {
    post: "Public",
    socialMedia: "Public",
  },
  recommendations: [],
  attachedFiles: [],
  comments: [],
  price: 1000,
  location: {
    _id: "1",
    lat: 0,
    lng: 0,
  },
  toPrice: 2000,
  createdAt: "2024-07-12",
};

export const freeSubscriptionPlans: SubscriptionPlan[] = [
  {
    _id: "2c9380849146f28",
    reason: "Gratuita",
    price: 6500,
    description: "Cuenta personal gratuita de por vida, con anuncios visibles solo para tus contactos.",
    features: ["Beneficio 1", "Beneficio 2", "Beneficio 3"],
    freePlan: true,
    intervalTime: 1,
    isActive: true,
    postLimit: 5,
    isPostPack: false,
    mpPreapprovalPlanId: ""
  }
];

export const mockedPacks: SubscriptionPlan[] = [
  {
    _id: "2c9380849146f28",
    reason: "+ 10 Publicaciones Activas",
    price: 3500,
    description: "Las 10 publicaciones activas sumadas tendrán una duración de 1 mes. ",
    features: [],
    intervalTime: 1,
    isActive: true,
    postLimit: 10,
    mpPreapprovalPlanId: "",
    isPostPack: true
  },
  {
    _id: "2c9380849146ff3d01914739031d0028",
    reason: "+ 20 Publicaciones Activas",
    price: 6500,
    description: "Las 20 publicaciones activas sumadas tendrán una duración de 1 mes. ",
    features: [],
    intervalTime: 1,
    isActive: true,
    postLimit: 20,
    mpPreapprovalPlanId: "",
    isPostPack: true
  },
  {
    _id: "2c9380849146ff3d01914739038",
    reason: "+ 50 Publicaciones Activas",
    price: 10000,
    description: "Las 50 publicaciones activas sumadas tendrán una duración de 1 mes. ",
    features: [],
    intervalTime: 1,
    isActive: true,
    postLimit: 50,
    mpPreapprovalPlanId: "",
    isPostPack: true
  },
];


export const mockedPetitions = [mockedPetition, mockedPetition2, mockedPetition];

export const mockedPosts = [mockedGood, mockedService];
