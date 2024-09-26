# Rutas GET

### Usuario
- `getUserProfileData`: Ruta que devuelva los datos personales del usuario **LISTA**
- `getBusinessSector`: traer rubros de empresas **LISTA**
- `getUserPreferences`: Devolver las userPreferences del usuario **LISTA**
- `getUsers`: Debe devolver 50 usuarios aleatorios o los que coincidan con la búsqueda (en caso de que se haga una búsqueda). La búsqueda va a existir si envio una searchQuery, o sea voy a enviar una query param opcional que va a ser el nombre, apellido o usuario y se debería devolver usuarios que cumplan con la query (por ejemplo la ruta sería `users?search=acá%20la%20busqueda`). La respuesta debe ser una array con los siguientes datos (doy como ejemplo si es Business o si es Person: 
```json
[
	{
		_id:  "1k2",
		profilePhotoUrl:  "/avatar.png",
		username:  "username",
		contact: {
			_id:  "12qdas1",
			phone:  "phone",
			...todasLasRedesSocialesQueTenga
		},
		countryRegion:  "Córdoba, Argentina",
		userType:  "Business",
		businessName:  "Nombre de Empresa",
	},
	{
		_id:  "2k3",
		profilePhotoUrl:  "/avatar.png",
		username:  "username",
		contact: {
		_id:  "12daf1",
		phone:  "phone",
		instagram:  "instagram",
		facebook:  "facebook",
		},
		lastName:  "Bicego",
		name:  "Renato",
		countryRegion:  "Mendoza, Argentina",
		userType:  "Person",
	}
]
```
- `getUserByUsername`: Devolver datos del usuario por su username. Los datos a devolver son:
```json
export  const  mockedCompleteUser:  GetUser  = {
	_id:  "2k3",
	profilePhotoUrl:  "/avatar.png",
	username:  "username",
	contact: {
		_id:  "12daf1",
		phone:  "phone",
		instagram:  "instagram",
		facebook:  "facebook",
	},
	lastName:  "Bicego",
	name:  "Renato",
	countryRegion:  "Mendoza, Argentina",
	userType:  "Person",
	board: {
		_id:  "4",
		annotations:  [
		"Anotacion 1 pruebo agregar más texto en la anotación para ver el diseño",
		"Anotacion 2",
		"Anotacion 3",
		"Anotacion 4",
		"Anotacion 5",
		"Anotacion 6",
		],
		keywords:  ["Keyword 1",  "Keyword 2"],
		user:  "2k3",
		color:  "color",
		visibility:  "public",
	},
	description:  "Esta es la descripción del usuario para mostrar en su perfil",
	email:  "email",
	subscriptions:  [después vemos qué datos],
	groups:  [
		{
			_id: "id",
			name: "nombre del grupo",
			profilePhotoUrl: "url",
			members: [solo los ids]
		}
	],
	magazines:  [
		{
			_id:  "1magaz",
			name:  "Magazine 1",
			sections:  [
				{
					posts: [
						{
							imagesUrls: ["url"]
						}
					]
				}
			] ***aclaración abajo 
			description:  ""
		}
	],
	posts:  mockedPosts (abajo esta cómo),
	userRelations:  [después vemos qué datos],
};
***(necesito unicamente 3 fotos de 3 posts distintos, es para mostrar de portada 3 imagenes
en la card de revista. Voy a poner una foto de cómo se vería después de esto. hay que tener 
en cuenta que los posts pueden estar en distintas secciones, pero simplemente quiero 3 fotos
 de cualquier posts que se encuentre en las secciones. Si hay 1 post que me devuelva 
 solo 1 foto. si no hay ningún post que no me devuelva nada)

const mockedPosts = [
	(good){
		_id: "id",
		imagesUrls: ["urls"],
		title: "titulo",
		description: "descripcion",
		price: 2000,
		reviews: [
			{
				rating: 4.5
			}
		]
	},
	(service){
		_id: "id",
		imagesUrls: ["urls"],
		title: "titulo",
		description: "descripcion",
		price: 2000,
		frequencyPrice: "hour",
		reviews: [
			{
				rating: 4.5
			}
		]
	},
	(petition){
		_id: "id",
		title: "titulo",
		description: "descripcion",
		price: 2000,
		toPrice: 4000,
		frequencyPrice: "hour",
		petitionType: "good"
	}
]
```
### Posts
- `getPostData`: Devolver los datos completos del post por el id enviado. los objetos serían sería:
```js
const mockedGood:  Good  = {
	_id:  "1",
	imagesUrls:  [
		"/moto.png",
		"/Rectangle 13.png",
		"/Rectangle 14.png",
		"/Rectangle 15.png",
	],
	year:  2022,
	brand:  "brand",
	modelType:  "modelType",
	reviews:  [
		{
			_id:  "231",
			rating:  5,
			review:  "review",
			author: {
				profilePhotoUrl:  "/avatar.png",
				username:  "username",
			},
			date:  "2024-07-12",
		},
		{
			_id:  "232",
			rating:  3,
			review:  "review",
			author: {
				profilePhotoUrl:  "/avatar.png",
				username:  "username",
			},
			date:  "2024-07-12",
		},
		{
			_id:  "23w22",
			rating:  4,
			review:
			"Esta es una review más larga para poder mostrar una caja de review de 200 caracteres más grande",
			author: {
				profilePhotoUrl:  "/avatar.png",
				username:  "username",
			},
			date:  "2024-07-12",
		},
	],
	condition:  "new",
	price:  10000,
	location: {
		_id:  "1",
		location: {
			type:  "Point",
			coordinates:  [-32.8998,  -68.8259],
		},
		description:  "Cacique Guaymallen 1065, Las Heras, Mendoza",
		userSetted:  true,
	},
	category:  categories[0] (devolver todas las props con el populate),
	attachedFiles:  [
		{
			_id:  "1ghdsf",
			url:  "url",
			label:  "label",
		},
	],
	comments:  [
		{
			_id:  "1232df",
			author: {
				profilePhotoUrl:  "/avatar.png",
				username:  "username",
			},
			comment: "Quería consultar si existe la posibilidad de sacar un plan de pago para pagarla. Soy de Buenos Aires, por lo que también quería consultar sobre envios.",
			date:  "2024-07-12",
			replies:  [],
		},
		{
			_id:  "1232df",
			author: {
				profilePhotoUrl:  "/avatar.png",
				username:  "username",
			},
			comment: "Quería consultar si existe la posibilidad de sacar un plan de pago para pagarla. Soy de Buenos Aires, por lo que también quería consultar sobre envios.",
			date:  "2024-09-12",
			replies:  [
				{
					_id:  "1232df",
					author: {
						profilePhotoUrl:  "/avatar.png",
						username:  "username",
					},
					comment: "Si, te puedo armar un plan de pago. Respecto al envío, podemos manejarlo por la empresa Andreani. Saludos",
					date:  "2024-09-13",
					replies:  [],
				},
			],
		},
	],
	postType:  "good",
	visibility: {
		post:  "public",
		socialMedia:  "public",
	},
	recommendations:  [],
	description: "La Yamaha YBR Z es una motocicleta robusta y confiable diseñada para aquellos que buscan una combinación perfecta entre economía y rendimiento. Con su motor de 124 cc, ofrece una conducción suave y eficiente, ideal para el uso diario en la ciudad. Su diseño ergonómico garantiza comodidad en viajes largos, mientras que su chasis resistente proporciona estabilidad y seguridad en diferentes terrenos. Además, cuenta con un tanque de combustible de gran capacidad, lo que permite recorrer largas distancias sin necesidad de recargar constantemente. La Yamaha YBR Z es la elección perfecta para quienes desean una moto duradera, económica y de fácil manejo.",
	title:  "Yamaha YBR-Z",
	author: {
		profilePhotoUrl:  "/avatar.png",
		username:  "renatobicego",
		contact: {
			_id:  "121",
			phone:  "phone",
			instagram:  "instagram",
			facebook:  "facebook",
			x:  "x",
			website:  "website",
		},
		lastName:  "lastName",
		name:  "name",
	},
	createAt:  "2024-07-12",
};

const  mockedService:  Service  = {
	_id:  "1jgdfas",
	imagesUrls:  ["/catering.png"],
	description:"Te invitamos a que nos conozcas y puedas disfrutar con tus seres queridos de tu evento tal como lo soñaste. Elaboramos bocadillos totalmente caseros y con material de primera calidad.",
	title:  "Lunch para eventos social y corporativos",
	price:  1000,
	location: {
		_id:  "1",
		location: {
			type:  "Point",
			coordinates:  [-32.8998,  -68.8259],
		},
		description:  "Cacique Guaymallen 1065, Las Heras, Mendoza",
		userSetted:  true,
	},
	category:  categories[1] (todas las props con el populate),
	attachedFiles:  [],
	comments:  [
		{
			_id:  "2312",
			author: {
				profilePhotoUrl:  "/avatar.png",
				username:  "username",
			},
			comment:  "comment",
			date:  "2024-07-12",
			replies:  [(igual que good, las mismas props)],
		},
	],
	postType:  "service",
	visibility: {
		post:  "public",
		socialMedia:  "public",
	},
	recommendations:  [],
	frequencyPrice:  "hour",
	reviews:  [],
	author: {
		profilePhotoUrl:  "/avatar.png",
		username:  "username",
		contact: {
			_id:  "121",
			phone:  "phone",
		},
		lastName:  "lastName",
		name:  "name",
	},
	createAt:  "2024-07-12",
};
const  mockedPetition:  Petition  = {
	_id:  "1452",
	title:  "Busco iPhone 14 Pro Max",
	description: "Esto en búsqueda de un iPhone 14 pro max nuevo en caja, de 128gb. Cualquier duda o consulta puede contactarme por este medio. Gracias",
	author: {
		profilePhotoUrl:  "/avatar.png",
		username:  "username",
		contact: {
			_id:  "121",
			phone:  "phone",
		},
		lastName:  "lastName",
		name:  "name",
	},
	category: {
		_id:  "1",
		label:  "Teléfonos y Compoutadoras",
	},
	postType:  "petition",
	petitionType:  "good",
	visibility: {
		post:  "public",
		socialMedia:  "public",
	},
	recommendations:  [],
	attachedFiles:  [],
	comments:  [],
	price:  1000,
	location: {
		_id:  "1",
		location: {
			type:  "Point",
			coordinates:  [-32.8998,  -68.8259],
		},
		description:  "Cacique Guaymallen 1065, Las Heras, Mendoza",
		userSetted:  true,
	},
	toPrice:  2000,
	createAt:  "2024-07-12",
};
 
```
- `getCategories`: devolver categorias de anuncios


**Los siguientes gets hay que implementar un sistema de infiniteFetchScroll, o sea el usuario al llegar al final de la página va a hacer un fetch más trayendo 50 posts más. Cuando se hace el fetch, el back devuelve una prop de tipo boolean que dice si hay más valores para traer o ya no hay más. Hay que buscar alguna guía que explique cómo hacer esto. También hay que filtrarlos por la visibility**
- `getGoods`: devolver posts de tipos bienes. Hay que tener en cuenta que pueden haber queries opcionales y algunas obligatorias: searchTerm (búsqueda opcional), location (obligatoria, sería latitud y longitud y habría que filtrar con una proximidad (radius), esa proximidad va a estar disponivle solo para usuarios premium). Sería algo como `GET /posts/goods?search=autos&lat=20.30&lng=-23.23&radius=20`. El objeto que debería devolver sería:
```js
export  const  mockedGoods = [
	{
		_id: "id",
		imagesUrls: ["urls"],
		title: "titulo",
		description: "descripcion",
		price: 2000,
		reviews: [
			{
				rating: 4.5
			}
		]
	},
	{
		_id: "id1",
		imagesUrls: ["urls2"],
		title: "titulo2",
		description: "descripcion",
		price: 20002,
		reviews: [
			{
				rating: 4.5
			}
		]
	},
]
```
- `getServices`: idem a getGoods pero debería devolver servicios: 
```js
[
	{
		_id: "id",
		imagesUrls: ["urls"],
		title: "titulo",
		description: "descripcion",
		price: 2000,
		frequencyPrice: "hour",
		reviews: [
			{
				rating: 4.5
			}
		]
	}
]
```
- `getPetitions`: idem pero debería devolver necesidades
```js
[
	{
		_id: "id",
		title: "titulo",
		description: "descripcion",
		price: 2000,
		toPrice: 4000,
		frequencyPrice: "hour",
		petitionType: "good"
	}
]
```

### Revistas
- `getMagazineById`: traer revista con sus datos por id, donde los posts debería devolverlos con las mismas props que el `getPosts`:
```js
export  const  mockedCompleteMagazine:  UserMagazine  = {
	_id:  "1magaz",
	collaborators:  [
		{
			_id: "id"
			username: "username",
			profilePhotoUrl: "foto"
		}
	],
	name:  "Magazine 1",
	user:  {
		_id: "id"
		username: "username",
		profilePhotoUrl: "foto"
	},
	description: "Esta sería la descripción de la revista guitarras de Miguel abentin.",
	sections:  [
		{
			_id:  "234sec",
			isFatherSection:  true,
			posts:  mockedPosts,
			title:  "Sección 1",
		},
		{
			_id:  "345sec",
			isFatherSection:  false,
			posts:  mockedPosts,
			title:  "Sección 2",
		},
		{
			_id:  "3415sec",
			isFatherSection:  false,
			posts:  mockedPosts,
			title:  "Sección 3",
		},
	],
	ownerType:  "user",
};
export  const  mockedCompleteMagazineGroup:  GroupMagazine  = {
	_id:  "1magaz",
	allowedCollaborators:  [
		{
			_id: "id"
			username: "username",
			profilePhotoUrl: "foto"
		}
	],
	name:  "Magazine 1",
	group:  {
		_id: "id"
		name: "name",
		profilePhotoUrl: "foto"
	},
	description: "Esta sería la descripción de la revista guitarras de Miguel abentin.",
	sections:  [
		{
			_id:  "234sec",
			isFatherSection:  true,
			posts:  mockedPosts,
			title:  "Sección 1",
		},
		{
			_id:  "345sec",
			isFatherSection:  false,
			posts:  mockedPosts,
			title:  "Sección 2",
		},
		{
			_id:  "3415sec",
			isFatherSection:  false,
			posts:  mockedPosts,
			title:  "Sección 3",
		},
	],
	ownerType:  "group",
};
```

### Grupos
- `getGroups`: idem a getPosts solo que tiene que traer grupos y únicamente se va a enviar un searchTerm nada más que va a ser opcional. Tiene que devolver:
```js
[
	{
		_id: "id",
		name: "nombre del grupo",
		profilePhotoUrl: "url",
		members: [solo los ids]
	}
],
```
- `getGroupById`: traer todos los datos de grupo. Tiene que devolver:
```js
{
	_id:  "9ievfm",
	members:  [
		{
			_id: "id"
			username: "username",
			profilePhotoUrl: "foto"
		}
	],
	admins:  [solo los ids],
	details:  "details",
	name:  "Computadoras",
	magazines:  [
		{
			_id:  "1magaz",
			name:  "Magazine 1",
			sections:  [
				{
					posts: [
						{
							imagesUrls: ["url"]
						}
					]
				}
			] ***lo mismo que con getUserByUsername
			description:  ""
		}
	],
	rules:  "rules",
	profilePhotoUrl:  "/group1.png",
},
```
- `getGroupPosts`: debería devolver cualquier tipo de post (good, service o petition) de los miembros de un grupo por el id del mismo. También deberíamos impementar el infiniteFetchScroll pero unicamente que acá no van a haber searchQueries. Debería devolver una array con la misma estructura que los `getGoods, getPetitions o getServices`, o sea las mimsas props dependiendo del tipo.

### Pizarras
- `getBoards`: idem a `getGroups`, solo que el searchTerm que se envía debería filtrar pizarras por las annotations y las keywords. Tener en cuenta que como `getGoods, getServices y getPetitions`, hay que filtrar por la visibility Debería devolver: 
```js
const boards = [
	{
		_id:  "1",
		annotations:  ["Anotacion 1",  "Anotacion 2"],
		keywords:  ["Keyword 1",  "Keyword 2"],
		user: {
			username:  "renatobicego",
			profilePhotoUrl:  "/avatar.png",
			name:  "Renato",
		},
		visibility:  "public",
		color: "color"
	},
]
```
