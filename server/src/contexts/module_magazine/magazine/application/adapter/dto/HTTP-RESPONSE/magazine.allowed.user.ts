// import { Field, ObjectType } from "@nestjs/graphql";
// import { ObjectId } from "mongoose";

// // revistas que has creado, revista en la que sos colaborador, en las que sos colaborador permitido en revistas de grupo (todas las revista del user en las que puede participar)
// //  -deberia traer nombre de revista, secciones, junto con el nombre de seccion y id de los post que hay dentro de cada seccion.


// @ObjectType()
// export class posts_graphql_magazine {
//   @Field(() => String, { nullable: true })
//   _id: ObjectId;

//   @Field(() => [String], { nullable: true })
//   imagesUrls: string[];

//   @Field(() => String, { nullable: true })
//   title: string;

//   @Field(() => String, { nullable: true })
//   description: string;

//   @Field(() => Float, { nullable: true })
//   price: number;

//   // @Field(() => String, { nullable: true })
//   // reviews: string;

//   @Field(() => String, { nullable: true })
//   frequencyPrice: string;

//   @Field(() => String, { nullable: true })
//   petitionType: string;

//   @Field(() => String, { nullable: true })
//   postType: string;
// }

// @ObjectType()
// export class sections_allUserMagazine_graphql {
//   @Field(() => String, { nullable: true })
//   _id: ObjectId;

//   @Field(() => String, { nullable: true })
//   title: string;

//   @Field(() => [posts_sections_allUserMagazine_graphql ], { nullable: true })
//   posts: posts_sections_allUserMagazine_graphql [];
// }


// @ObjectType()
// export class AllUserMagazine {

//     @Field(() => String)
//     _id: ObjectId;
//     @Field(() => String)
//     name: string;


//     @Field(() => [sections_allUserMagazine_graphql])
//     sections: sections_allUserMagazine_graphql[];

// }