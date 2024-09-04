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
exports.UserAdapter = void 0;
const common_1 = require("@nestjs/common");
const user_business_DTO_1 = require("../controller/dto/user.business.DTO");
const user_person_DTO_1 = require("../controller/dto/user.person.DTO");
const userBussiness_entity_1 = require("../../domain/entity/userBussiness.entity");
const console_1 = require("console");
const UP_publicite_update_request_1 = require("../controller/dto/update.request-DTO/UP-publicite.update.request");
const UB_publicite_update_request_1 = require("../controller/dto/update.request-DTO/UB-publicite.update.request");
let UserAdapter = class UserAdapter {
    constructor(logger, userService) {
        this.logger = logger;
        this.userService = userService;
    }
    async createUser(req, type) {
        this.logger.log('Creating user in the adapter');
        // Validar tipo y clase de objeto antes de usar el switch
        if (type === 0 && req instanceof user_person_DTO_1.UserPersonDto) {
            this.logger.log('Person user received in the adapter');
            try {
                const userP = await this.userService.createUser(req, 0);
                return user_person_DTO_1.UserPersonDto.formatDocument(userP);
            }
            catch (error) {
                this.logger.error('Error in adapter. The user has not been created');
                throw error;
            }
        }
        else if (type === 1 && req instanceof user_business_DTO_1.UserBusinessDto) {
            this.logger.log('Business user received in the adapter');
            try {
                const userB = await this.userService.createUser(req, 1);
                if (userB instanceof userBussiness_entity_1.UserBussiness) {
                    return user_business_DTO_1.UserBusinessDto.formatDocument(userB);
                }
                else {
                    throw new Error('Returned user is not a UserBusiness');
                }
            }
            catch (error) {
                throw error;
            }
        }
        else {
            throw console_1.error;
        }
    }
    async updateUser(username, req, type) {
        this.logger.log('Start process in the adapter: Update');
        if (type === 0 && req instanceof UP_publicite_update_request_1.UP_publiciteUpdateRequestDto) {
            const userUpdated = await this.userService.updateUser(username, req, 0);
            return user_person_DTO_1.UserPersonDto.formatDocument(userUpdated);
        }
        else if (type === 1 && req instanceof UB_publicite_update_request_1.UB_publiciteUpdateRequestDto) {
            const userUpdated = await this.userService.updateUser(username, req, 1);
            return user_business_DTO_1.UserBusinessDto.formatDocument(userUpdated);
        }
        else {
            throw console_1.error;
        }
    }
};
UserAdapter = __decorate([
    __param(1, (0, common_1.Inject)('UserServiceInterface'))
], UserAdapter);
exports.UserAdapter = UserAdapter;
//# sourceMappingURL=user.adapter.js.map