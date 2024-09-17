import {
  User,
  UserPreferences,
} from 'src/contexts/user/domain/entity/user.entity';
import { UserTransformationInterface } from 'src/contexts/user/domain/repository/transformations/user-transformation.interface';
import { IUserBusiness } from '../../schemas/userBussiness.schema';
import { IUserPerson } from '../../schemas/userPerson.schema';

import { UP_update } from 'src/contexts/user/domain/entity/userPerson.entity';
import { Gender } from '../../../domain/entity/enum/enums.request';
import { UB_update } from 'src/contexts/user/domain/entity/userBusiness.entity';

export class UserRepositoryMapper implements UserTransformationInterface {
  constructor() {}
  formatDocToUserPreferences(req: any): UserPreferences | null {
    const obj: UserPreferences = {
      searchPreference: req.searchPreference,
      backgroundColor: req.backgroundColor,
      boardColor: req.boardColor,
    };

    return obj;
  }

  formatUpdateDocumentUB(reqUser: UB_update): Partial<IUserBusiness> {
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
  formatUpdateDocument(reqUser: UP_update): Partial<IUserPerson> {
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

  getBaseUserData(reqUser: User) {
    return {
      clerkId: reqUser.getClerkId(),
      email: reqUser.getEmail(),
      username: reqUser.getUsername(),
      name: reqUser.getName(),
      lastName: reqUser.getLastName(),
      description: reqUser.getDescription(),
      profilePhotoUrl: reqUser.getProfilePhotoUrl(),
      countryRegion: reqUser.getCountryRegion(),
      isActive: reqUser.getIsActive(),
      contact: reqUser.getContact(),
      createdTime: reqUser.getCreatedTime(),
      subscriptions: reqUser.getSubscriptions(),
      groups: reqUser.getGroups(),
      magazines: reqUser.getMagazines(),
      board: reqUser.getBoard(),
      post: reqUser.getPost(),
      userRelations: reqUser.getUserRelations(),
      userType: reqUser.getUserType(),
    };
  }
}
