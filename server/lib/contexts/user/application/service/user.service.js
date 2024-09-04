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
var UserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const user_business_DTO_1 = require("../../infraestructure/controller/dto/user.business.DTO");
const user_person_DTO_1 = require("../../infraestructure/controller/dto/user.person.DTO");
const userPerson_entity_1 = require("../../domain/entity/userPerson.entity");
const userBussiness_entity_1 = require("../../domain/entity/userBussiness.entity");
const UP_publicite_update_request_1 = require("../../infraestructure/controller/dto/update.request-DTO/UP-publicite.update.request");
const UB_publicite_update_request_1 = require("../../infraestructure/controller/dto/update.request-DTO/UB-publicite.update.request");
let UserService = UserService_1 = class UserService {
    constructor(userRepository, contactService, logger, connection) {
        this.userRepository = userRepository;
        this.contactService = contactService;
        this.logger = logger;
        this.connection = connection;
    }
    async createUser(req, type) {
        const session = await this.connection.startSession();
        session.startTransaction();
        let user;
        this.logger.log('Creating ACCOUNT -> start process in the service: ' + UserService_1.name);
        try {
            const contactId = await this.createContact(req.contact, {
                session,
            });
            if (req instanceof user_person_DTO_1.UserPersonDto && type === 0) {
                // Crear el contacto dentro de la transacción
                this.logger.log('Creating PERSONAL ACCOUNT with username: ' + req.username);
                const userPersonal = userPerson_entity_1.UserPerson.formatDtoToEntity(req, contactId);
                user = await this.userRepository.save(userPersonal, 0, session);
                await session.commitTransaction();
                await session.endSession();
                return user;
            }
            else if (req instanceof user_business_DTO_1.UserBusinessDto && type === 1) {
                this.logger.log('Creating BUSINESS ACCOUNT with username: ' + req.username);
                const userBusiness = userBussiness_entity_1.UserBussiness.formatDtoToEntity(req, contactId);
                user = await this.userRepository.save(userBusiness, 1, session);
                await session.commitTransaction();
                await session.endSession();
                return user;
            }
            else {
                throw new common_1.BadRequestException('Invalid user type');
            }
        }
        catch (error) {
            await session.abortTransaction();
            this.logger.error('Error in service. The user has not been created');
            this.logger.error(error);
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    async createContact(contactDto, options) {
        return await this.contactService.createContact(contactDto, options);
    }
    async updateUser(username, req, type) {
        this.logger.log('Updating user in the service: ' + UserService_1.name);
        let user;
        try {
            if (req instanceof UP_publicite_update_request_1.UP_publiciteUpdateRequestDto && type === 0) {
                this.logger.log('Update PERSONAL ACCOUNT with username: ' + username);
                const userPersonal = userPerson_entity_1.UserPerson.formatUpdateDto(req);
                user = await this.userRepository.update(username, userPersonal, type);
                return user;
            }
            else if (req instanceof UB_publicite_update_request_1.UB_publiciteUpdateRequestDto && type === 1) {
                this.logger.log('Update BUSINESS ACCOUNT with username: ' + username);
                const userPersonal = userBussiness_entity_1.UserBussiness.formatUpdateDto(req);
                user = await this.userRepository.update(username, userPersonal, type);
                return user;
            }
            else {
                this.logger.error('User type not valid: Action -> UPDATE. error in service');
                throw common_1.BadRequestException;
            }
        }
        catch (error) {
            this.logger.error('User has not been updated. error in service: ' + error.message);
            throw error;
        }
    }
};
UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_2.Inject)('UserRepositoryInterface')),
    __param(1, (0, common_2.Inject)('ContactServiceInterface')),
    __param(3, (0, mongoose_1.InjectConnection)())
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map