import { Good, Service } from "./postTypes";

const mockedGood: Good = {
    _id: "1",
    imagesUrls: ["/moto.png"],
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
            date: "2024-07-12"
        },
        {
            _id: "232",
            rating: 4,
            review: "review",
            author: {
                profilePhotoUrl: "/avatar.png",
                 username: "username",
            },
            date: "2024-07-12"
        }
    ],
    condition: "New",
    price: 1000,
    location: {
        _id: "1",
        latitude: 0,
        longitude: 0
    },
    category: {
        _id: "1",
        label: "Vehículos"
    },
    attachedFiles: [],
    comments: [],
    postType: "Good",
    visibility: "Public",
    recommendations: [],
    description: "Entrega un mínimo anticipo y llévate tu 0km! 💥",
    title: "Yamaha YBR-Z"
}

const mockedService: Service = {
    _id: "1",
    imagesUrls: ["/catering.png"],
    description: "Te invitamos a que nos conozcas y puedas disfrutar con tus seres queridos de tu evento tal como lo soñaste. Elaboramos bocadillos totalmente caseros y con material de primera calidad.",
    title: "Lunch para eventos social y corporativos",
    price: 1000,
    location: {
        _id: "1",
        latitude: 0,
        longitude: 0
    },
    category: {
        _id: "2",
        label: "Servicios de cocina"
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
            replies: []
        }
    ],
    postType: "Service",
    visibility: "Public",
    recommendations: [],
    frequencyPrice: "Hourly",
    reviews: [],
}

export const mockedPosts = [mockedGood, mockedService];