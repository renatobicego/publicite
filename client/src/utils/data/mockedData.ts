import { Board } from "@/types/board";
import {
  Good,
  Magazine,
  Petition,
  PostCategory,
  Service,
} from "@/types/postTypes";
import { SubscriptionPlan } from "@/types/subscriptions";
import { boardColors } from "./selectData";
import { GetUser, Group, User } from "@/types/userTypes";

export const categories: PostCategory[] = [
  {
    _id: "66e660c0670176213da68f22",
    label: "Casa",
  },
  {
    _id: "112egsdq",
    label: "Departamento",
  },
  {
    _id: "112qsdqsf",
    label: "Oficina",
  },
];

const mockedGood: Good = {
  _id: "1",
  imagesUrls: [
    "/moto.png",
    "/Rectangle 13.png",
    "/Rectangle 14.png",
    "/Rectangle 15.png",
  ],
  year: 2022,
  brand: "brand",
  modelType: "modelType",
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
      rating: 3,
      review: "review",
      author: {
        profilePhotoUrl: "/avatar.png",
        username: "username",
      },
      date: "2024-07-12",
    },
    {
      _id: "23w22",
      rating: 4,
      review:
        "Esta es una review más larga para poder mostrar una caja de review de 200 caracteres más grande",
      author: {
        profilePhotoUrl: "/avatar.png",
        username: "username",
      },
      date: "2024-07-12",
    },
  ],
  condition: "new",
  price: 10000,
  location: {
    _id: "1",
    location: {
      type: "Point",
      coordinates: [-32.8998, -68.8259],
    },
    description: "Cacique Guaymallen 1065, Las Heras, Mendoza",
    userSetted: true,
  },
  category: categories[0],
  attachedFiles: [
    {
      _id: "1ghdsf",
      url: "url",
      label: "label",
    },
  ],
  comments: [
    {
      _id: "1232df",
      author: {
        profilePhotoUrl: "/avatar.png",
        username: "username",
      },
      comment:
        "Quería consultar si existe la posibilidad de sacar un plan de pago para pagarla. Soy de Buenos Aires, por lo que también quería consultar sobre envios.",
      date: "2024-07-12",
      replies: [],
    },
    {
      _id: "1232df",
      author: {
        profilePhotoUrl: "/avatar.png",
        username: "username",
      },
      comment:
        "Quería consultar si existe la posibilidad de sacar un plan de pago para pagarla. Soy de Buenos Aires, por lo que también quería consultar sobre envios.",
      date: "2024-09-12",
      replies: [
        {
          _id: "1232df",
          author: {
            profilePhotoUrl: "/avatar.png",
            username: "username",
          },
          comment:
            "Si, te puedo armar un plan de pago. Respecto al envío, podemos manejarlo por la empresa Andreani. Saludos",
          date: "2024-09-13",
          replies: [],
        },
      ],
    },
  ],
  postType: "good",
  visibility: {
    post: "public",
    socialMedia: "public",
  },
  recommendations: [],
  description:
    "La Yamaha YBR Z es una motocicleta robusta y confiable diseñada para aquellos que buscan una combinación perfecta entre economía y rendimiento. Con su motor de 124 cc, ofrece una conducción suave y eficiente, ideal para el uso diario en la ciudad. Su diseño ergonómico garantiza comodidad en viajes largos, mientras que su chasis resistente proporciona estabilidad y seguridad en diferentes terrenos. Además, cuenta con un tanque de combustible de gran capacidad, lo que permite recorrer largas distancias sin necesidad de recargar constantemente. La Yamaha YBR Z es la elección perfecta para quienes desean una moto duradera, económica y de fácil manejo.",
  title: "Yamaha YBR-Z",
  author: {
    profilePhotoUrl: "/avatar.png",
    username: "renatobicego",
    contact: {
      _id: "121",
      phone: "phone",
      instagram: "instagram",
      facebook: "facebook",
      x: "x",
      website: "website",
    },
    lastName: "lastName",
    name: "name",
  },
  createAt: "2024-07-12",
};

const mockedService: Service = {
  _id: "1jgdfas",
  imagesUrls: ["/catering.png"],
  description:
    "Te invitamos a que nos conozcas y puedas disfrutar con tus seres queridos de tu evento tal como lo soñaste. Elaboramos bocadillos totalmente caseros y con material de primera calidad.",
  title: "Lunch para eventos social y corporativos",
  price: 1000,
  location: {
    _id: "1",
    location: {
      type: "Point",
      coordinates: [-32.8998, -68.8259],
    },
    description: "Cacique Guaymallen 1065, Las Heras, Mendoza",
    userSetted: true,
  },
  category: categories[1],
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
  postType: "service",
  visibility: {
    post: "public",
    socialMedia: "public",
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
  createAt: "2024-07-12",
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
  postType: "petition",
  petitionType: "good",
  visibility: {
    post: "public",
    socialMedia: "public",
  },
  recommendations: [],
  attachedFiles: [],
  comments: [],
  price: 1000,
  location: {
    _id: "1",
    location: {
      type: "Point",
      coordinates: [-32.8998, -68.8259],
    },
    description: "Cacique Guaymallen 1065, Las Heras, Mendoza",
    userSetted: true,
  },
  toPrice: 2000,
  createAt: "2024-07-12",
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
  postType: "petition",
  petitionType: "service",
  frequencyPrice: "month",
  visibility: {
    post: "public",
    socialMedia: "public",
  },
  recommendations: [],
  attachedFiles: [],
  comments: [],
  price: 1000,
  location: {
    _id: "1",
    location: {
      type: "Point",
      coordinates: [-32.8998, -68.8259],
    },
    description: "Cacique Guaymallen 1065, Las Heras, Mendoza",
    userSetted: true,
  },
  toPrice: 2000,
  createAt: "2024-07-12",
};

export const freeSubscriptionPlans: SubscriptionPlan[] = [
  {
    _id: "2c9368849146f28",
    reason: "Gratuita",
    price: 6500,
    description:
      "Cuenta personal gratuita de por vida, con anuncios visibles solo para tus contactos.",
    features: ["Beneficio 1", "Beneficio 2", "Beneficio 3"],
    freePlan: true,
    intervalTime: 1,
    isActive: true,
    postLimit: 5,
    isPostPack: false,
    mpPreapprovalPlanId: "",
  },
];

export const mockedPacks: SubscriptionPlan[] = [
  {
    _id: "2c9368849146f28",
    reason: "+ 10 Publicaciones Activas",
    price: 3500,
    description:
      "Las 10 publicaciones activas sumadas tendrán una duración de 1 mes. ",
    features: [],
    intervalTime: 1,
    isActive: true,
    postLimit: 10,
    mpPreapprovalPlanId: "",
    isPostPack: true,
  },
  {
    _id: "2c9368849146ff3d01914739031d0028",
    reason: "+ 20 Publicaciones Activas",
    price: 6500,
    description:
      "Las 20 publicaciones activas sumadas tendrán una duración de 1 mes. ",
    features: [],
    intervalTime: 1,
    isActive: true,
    postLimit: 20,
    mpPreapprovalPlanId: "",
    isPostPack: true,
  },
  {
    _id: "2c9368849146ff3d01914739038",
    reason: "+ 50 Publicaciones Activas",
    price: 10000,
    description:
      "Las 50 publicaciones activas sumadas tendrán una duración de 1 mes. ",
    features: [],
    intervalTime: 1,
    isActive: true,
    postLimit: 50,
    mpPreapprovalPlanId: "",
    isPostPack: true,
  },
];

export const mockedPetitions = [
  mockedPetition,
  mockedPetition2,
  mockedPetition,
];

export const mockedPosts = [mockedGood, mockedService];

export const mockedBoards: Board[] = [
  {
    _id: "1",
    annotations: ["Anotacion 1", "Anotacion 2"],
    keywords: ["Keyword 1", "Keyword 2"],
    user: {
      username: "renatobicego",
      profilePhotoUrl: "/avatar.png",
      name: "Renato",
    },
    visibility: "public",
  },
  {
    _id: "2",
    annotations: [
      "Anotacion 1",
      "Anotacion 2",
      "Anotacion 3",
      "Anotacion 4",
      "Anotacion 5",
    ],
    keywords: ["Keyword 1", "Keyword 2"],
    user: {
      username: "pedrobicego",
      profilePhotoUrl: "/avatar.png",
      name: "Renato",
    },
    visibility: "public",
    color: boardColors[3],
  },
  {
    _id: "3",
    annotations: ["Anotacion 1", "Anotacion 2"],
    keywords: ["Keyword 1", "Keyword 2"],
    user: {
      username: "miguelabentin",
      profilePhotoUrl: "/avatar.png",
      name: "Renato",
    },
    visibility: "public",
    color: boardColors[1],
  },
  {
    _id: "4",
    annotations: [
      "Anotacion 1",
      "Anotacion 2",
      "Anotacion 3",
      "Anotacion 4",
      "Anotacion 5",
      "Anotacion 6",
    ],
    keywords: ["Keyword 1", "Keyword 2"],
    user: {
      username: "maxicvetic",
      profilePhotoUrl: "/avatar.png",
      name: "Renato",
    },
    visibility: "public",
    color: boardColors[6],
  },
];

export const mockedUsers = [
  {
    _id: "1k2",
    profilePhotoUrl: "/avatar.png",
    username: "username",
    contact: {
      _id: "12qdas1",
      phone: "phone",
    },
    lastName: "lastName",
    name: "name",
    countryRegion: "Córdoba, Argentina",
    userType: "Business",
    businessName: "Nombre de Empresa",
  },
  {
    _id: "2k3",
    profilePhotoUrl: "/avatar.png",
    username: "username",
    contact: {
      _id: "12daf1",
      phone: "phone",
      instagram: "instagram",
      facebook: "facebook",
    },
    lastName: "Bicego",
    name: "Renato",
    countryRegion: "Mendoza, Argentina",
    userType: "Person",
  },
  {
    _id: "3k4",
    profilePhotoUrl: "/avatar.png",
    username: "username",
    contact: {
      _id: "12211",
      phone: "phone",
      x: "x",
    },
    lastName: "Perez",
    name: "Pedro",
    countryRegion: "Bariloche, Río Negro, Argentina",
    userType: "Person",
  },
  {
    _id: "4k5",
    profilePhotoUrl: "/avatar.png",
    username: "username",
    contact: {
      _id: "12as211",
      website: "website",
    },
    lastName: "Lopez",
    name: "Miguel",
    countryRegion: "Córdoba, Argentina",
    userType: "Person",
  },
];

export const mockedGroups: Group[] = [
  {
    _id: "9ievfm",
    members: ["1k2", "2k3"],
    admins: ["1k2"],
    details: "details",
    name: "Computadoras",
    magazines: [],
    rules: "rules",
    profilePhotoUrl: "/group1.png",
  },
  {
    _id: "9ievfmas",
    members: ["1k2", "2k3", "3k4", "4k5", "5k6"],
    admins: ["1k2"],
    details: "details",
    name: "Instrumentos Musicales",
    magazines: [],
    rules: "rules",
    profilePhotoUrl: "/group2.png",
  },
  {
    _id: "9ievfmass",
    members: ["1k2", "2k3", "3k4", "4k5", "5k6"],
    admins: ["1k2"],
    details: "details",
    name: "Desarrolladores",
    magazines: [],
    rules: "rules",
    profilePhotoUrl: "/group3.png",
  },
];

export const mockedMagazines: Magazine[] = [
  {
    _id: "1magaz",
    collaborators: [],
    name: "Magazine 1",
    owner: "1k2",
    sections: [
      {
        _id: "234sec",
        isFatherSection: true,
        posts: mockedPosts,
        title: "Sección 1",
      },
    ],
    description: ""
  },
  {
    _id: "2magaz",
    collaborators: [],
    name: "Magazine 2",
    owner: "1k2",
    sections: [
      {
        _id: "234sec",
        isFatherSection: true,
        posts: mockedPosts,
        title: "Sección 1",
      },
    ],
    description: ""
  },
];

export const mockedCompleteUser: GetUser = {
  _id: "2k3",
  profilePhotoUrl: "/avatar.png",
  username: "username",
  contact: {
    _id: "12daf1",
    phone: "phone",
    instagram: "instagram",
    facebook: "facebook",
  },
  lastName: "Bicego",
  name: "Renato",
  countryRegion: "Mendoza, Argentina",
  userType: "Person",
  board: {
    _id: "4",
    annotations: [
      "Anotacion 1 pruebo agregar más texto en la anotación para ver el diseño",
      "Anotacion 2",
      "Anotacion 3",
      "Anotacion 4",
      "Anotacion 5",
      "Anotacion 6",
    ],
    keywords: ["Keyword 1", "Keyword 2"],
    user: "2k3",
    color: boardColors[0],
    visibility: "public",
  },
  createdTime: "2020-12-01T00:00:00.000Z",
  description: "Esta es la descripción del usuario para mostrar en su perfil",
  email: "email",
  isActive: true,
  subscriptions: [],
  groups: [],
  magazines: mockedMagazines,
  posts: mockedPosts,
  userRelations: [],
};

export const mockedCompleteMagazine = {
  _id: "1magaz",
  collaborators: [],
  name: "Magazine 1",
  owner: mockedCompleteUser,
  description:
    "Esta sería la descripción de la revista guitarras de Miguel abentin.",
  sections: [
    {
      _id: "234sec",
      isFatherSection: true,
      posts: mockedPosts,
      title: "Sección 1",
    },
    {
      _id: "345sec",
      isFatherSection: false,
      posts: mockedPosts,
      title: "Sección 2",
    },
    {
      _id: "3415sec",
      isFatherSection: false,
      posts: mockedPosts,
      title: "Sección 3",
    },
  ],
};
