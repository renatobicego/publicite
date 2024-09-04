"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const userPerson_schema_1 = require("../schemas/userPerson.schema");
const userBussiness_schema_1 = require("../schemas/userBussiness.schema");
const userPerson_entity_1 = require("../../domain/entity/userPerson.entity");
const userBussiness_entity_1 = require("../../domain/entity/userBussiness.entity");
const enums_request_1 = require("../controller/dto/enums.request");
let UserRepository = class UserRepository {
    constructor(userPersonModel, userBusinessModel, sectorRepository, logger) {
        this.userPersonModel = userPersonModel;
        this.userBusinessModel = userBusinessModel;
        this.sectorRepository = sectorRepository;
        this.logger = logger;
    }
    async save(reqUser, type, session) {
        try {
            let createdUser;
            let userSaved;
            switch (type) {
                case 0: // Personal User
                    if (reqUser instanceof userPerson_entity_1.UserPerson) {
                        createdUser = this.formatDocument(reqUser);
                        userSaved = await createdUser.save({ session });
                        const userRsp = userPerson_entity_1.UserPerson.formatDocument(userSaved);
                        return userRsp;
                    }
                    throw new common_1.BadRequestException('Invalid user instance for type 0');
                case 1: // Business User
                    if (reqUser instanceof userBussiness_entity_1.UserBussiness) {
                        this.logger.warn('--VALIDATING BUSINESS SECTOR ID: ' + reqUser.getSector());
                        await this.sectorRepository.validateSector(reqUser.getSector());
                        createdUser = this.formatDocument(reqUser);
                        userSaved = await createdUser.save({ session });
                        return userBussiness_entity_1.UserBussiness.formatDocument(userSaved);
                    }
                    throw new common_1.BadRequestException('Invalid user instance for type 1');
                default:
                    throw new common_1.BadRequestException('Invalid user type');
            }
        }
        catch (error) {
            throw error;
        }
    }
    async update(username, reqUser, type) {
        try {
            let entityToDocument;
            switch (type) {
                case 0: // Personal User
                    this.logger.log('Search user(Personal) for update');
                    entityToDocument = this.formatUpdateDocument(reqUser);
                    const userUpdated = await this.userPersonModel.findOneAndUpdate({ username: username }, // Búsqueda por username
                    entityToDocument, { new: true });
                    if (!userUpdated) {
                        throw new common_1.BadRequestException('User not found');
                    }
                    return userPerson_entity_1.UserPerson.formatDocument(userUpdated);
                case 1:
                    this.logger.log('Search user(Business) for update');
                    entityToDocument = this.formatUpdateDocumentUB(reqUser);
                    const userUpdatedB = await this.userBusinessModel.findOneAndUpdate({ username: username }, // Búsqueda por username
                    entityToDocument, { new: true });
                    if (!userUpdatedB) {
                        throw new common_1.BadRequestException('User not found');
                    }
                    return userBussiness_entity_1.UserBussiness.formatDocument(userUpdatedB);
                default:
                    throw new common_1.BadRequestException('Invalid user type');
            }
        }
        catch (error) {
            this.logger.error('Error in update method', error);
            throw error;
        }
    }
    //---------------------------FORMATS OPERATIONS ------------------
    formatDocument(reqUser) {
        const baseUserData = this.getBaseUserData(reqUser);
        this.logger.log('Start process in the repository: formatDocument');
        if (reqUser instanceof userPerson_entity_1.UserPerson) {
            return new this.userPersonModel(Object.assign(Object.assign({}, baseUserData), { gender: reqUser.getGender(), birthDate: reqUser.getBirthDate() }));
        }
        else if (reqUser instanceof userBussiness_entity_1.UserBussiness) {
            return new this.userBusinessModel(Object.assign(Object.assign({}, baseUserData), { sector: reqUser.getSector(), businessName: reqUser.getBusinessName() }));
        }
        else {
            throw new common_1.BadRequestException('Invalid user instance - formatDocument in repository');
        }
    }
    getBaseUserData(reqUser) {
        this.logger.log('Start process in the repository: getBaseUserData');
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
    formatUpdateDocument(reqUser) {
        // Define una función auxiliar `mapValue` que se utiliza para mapear los valores de `reqUser`
        const mapValue = (key, // La clave del objeto `reqUser` que estamos procesando
        transformFn) => {
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
            birthDate: mapValue('birthDate'),
            gender: mapValue('gender', (gender) => gender === 'M'
                ? enums_request_1.Gender.Male // Si el valor es 'M', transforma a `Gender.Male`
                : gender === 'F'
                    ? enums_request_1.Gender.Female // Si el valor es 'F', transforma a `Gender.Female`
                    : enums_request_1.Gender.Other),
            countryRegion: mapValue('countryRegion'),
            description: mapValue('description'), // Mapea el campo `description` usando `mapValue`
        };
    }
    formatUpdateDocumentUB(reqUser) {
        const mapValue = (key, transformFn) => {
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
};
UserRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(userPerson_schema_1.UserPersonModel.modelName)),
    __param(1, (0, mongoose_1.InjectModel)(userBussiness_schema_1.UserBusinessModel.modelName)),
    __param(2, (0, common_1.Inject)('SectorRepositoryInterface'))
], UserRepository);
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.repository.js.map