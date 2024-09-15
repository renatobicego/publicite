import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(), //Cargamos las variables de entorno

    //Iniciamos la config de la BD
    MongooseModule.forRootAsync({
      //importamos configModule que nos permite cargar las variables de entorno
      imports: [ConfigModule],
      //UseFactory es una funcion de fabrica crea la configuración que necesita MongooseModule para conectarse a MongoDB.
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URI'),
      }),
      inject: [ConfigService], // Inyecta ConfigService para poder utilizarlo
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
