// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { ConfigService, ConfigModule } from '@nestjs/config';


// @Module({
//   imports: [
//     ConfigModule.forRoot(), //Cargamos las variables de entorno

// 		//Iniciamos la config de la BD
//     MongooseModule.forRootAsync({
// 			//importamos configModule que nos permite cargar las variables de entorno
//       imports: [ConfigModule], 
// 			//UseFactory es una funcion de fabrica crea la configuración que necesita MongooseModule para conectarse a MongoDB.
//       useFactory: async (configService: ConfigService) => ({
				
//         uri: configService.get<string>('DATABASE_URI'), // Obtén la URI de la base de datos desde las variables de entorno
//       }),
//       inject: [ConfigService], // Inyecta ConfigService para poder utilizarlo
//     }),
//   ],
// })
// export class DatabaseModule {}
