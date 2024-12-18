import { UserFindAllResponse } from '../../../application/adapter/dto/HTTP-RESPONSE/user.response.dto';
import { UserBusinessUpdateDto } from '../../../domain/entity/dto/user.business.update.dto';
import { UserClerkUpdateDto } from '../../../domain/entity/dto/user.clerk.update.dto';
import { UserPersonalUpdateDto } from '../../../domain/entity/dto/user.personal.update.dto';
import { UserPreferencesEntityDto } from '../../../domain/entity/dto/user.preferences.update.dto';
import { Gender } from '../../../domain/entity/enum/user.enums';
import {
  UB_update,
} from '../../../domain/entity/userBusiness.entity';
import {
  UP_update,
} from '../../../domain/entity/userPerson.entity';
import { UserRepositoryMapperInterface } from '../../../domain/repository/mapper/user.repository.mapper.interface';
import { IUserBusiness } from '../../schemas/userBussiness.schema';
import { IUserPerson } from '../../schemas/userPerson.schema';

export class UserRepositoryMapper implements UserRepositoryMapperInterface {
  constructor() { }

  documentToResponseAllUsers(document: any): UserFindAllResponse['user'][0] {
    return {
      _id: document._id,
      profilePhotoUrl: document.profilePhotoUrl,
      username: document.username,
      contact: document.contact,
      countryRegion: document.countryRegion,
      userType: document.userType,
      businessName: document.businessName,
      lastName: document.lastName,
      name: document.name,
    };
  }
  documentToEntityMapped_clerkUpdate(document: any): UserClerkUpdateDto {
    return new UserClerkUpdateDto({
      name: document.name,
      lastName: document.lastName,
      username: document.username,
      profilePhotoUrl: document.profilePhotoUrl,
      email: document.email,
    });
  }

  documentToEntityMapped_update(
    document: any,
    type: number,
  ): UserPersonalUpdateDto | UserBusinessUpdateDto {
    if (!document) {
      throw new Error('Document is undefined or null');
    }

    if (type === 1) {
      return new UserBusinessUpdateDto({
        businessName: document.businessName,
        sector: document.sector,
        countryRegion: document.countryRegion,
        description: document.description,
      });
    } else if (type === 0) {
      return new UserPersonalUpdateDto({
        birthDate: document.birthDate,
        gender: document.gender,
        countryRegion: document.countryRegion,
        description: document.description,
      });
    } else {
      throw new Error('Invalid user type in respository mapper');
    }
  }

  documentToEntityMapped_preferences(
    document: any,
  ): UserPreferencesEntityDto | null {
    const { searchPreference, backgroundColor } = document;

    const userPreferenceUpdated = new UserPreferencesEntityDto(
      searchPreference,
      backgroundColor,
    );

    return userPreferenceUpdated;
  }

  formatUpdateDocumentUB(
    reqUser: UserBusinessUpdateDto,
  ): Partial<IUserBusiness> {
    const mapValue = (
      key: keyof UB_update,
      transformFn?: (value: any) => any,
    ) => {
      const value = reqUser[key];

      return value !== undefined && value !== null
        ? transformFn
          ? transformFn(value)
          : value
        : undefined;
    };

    return {
      businessName: mapValue('businessName'),
      sector: mapValue('sector'),
      countryRegion: mapValue('countryRegion'),
      description: mapValue('description'),
    };
  }
  formatUpdateDocument(reqUser: UserPersonalUpdateDto): Partial<IUserPerson> {
    // Define una función auxiliar `mapValue` que se utiliza para mapear los valores de `reqUser`
    const mapValue = (
      key: keyof UP_update, // La clave del objeto `reqUser` que estamos procesando
      transformFn?: (value: any) => any, // Una función opcional para transformar el valor
    ) => {
      // Obtiene el valor del objeto `reqUser` para la clave dada
      const value = reqUser[key];

      // Verifica si el valor no es `undefined` ni `null`
      return value !== undefined && value !== null
        ? transformFn // Si se proporciona `transformFn`, aplícalo al valor
          ? transformFn(value)
          : value // Si no se proporciona `transformFn`, retorna el valor tal como está
        : undefined; // Si el valor es `undefined` o `null`, retorna `undefined`
    };

    // Crea un objeto que representa el documento de actualización
    return {
      birthDate: mapValue('birthDate'), // Mapea el campo `birthDate` usando `mapValue`
      gender: mapValue(
        'gender',
        (
          gender, // Mapea el campo `gender` usando `mapValue` con una función de transformación
        ) =>
          gender === 'M'
            ? Gender.Male // Si el valor es 'M', transforma a `Gender.Male`
            : gender === 'F'
              ? Gender.Female // Si el valor es 'F', transforma a `Gender.Female`
              : Gender.Other, // De lo contrario, asigna `Gender.Other`
      ),
      countryRegion: mapValue('countryRegion'), // Mapea el campo `countryRegion` usando `mapValue`
      description: mapValue('description'), // Mapea el campo `description` usando `mapValue`
    };
  }


}
