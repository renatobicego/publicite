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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const user_person_DTO_1 = require("./dto/user.person.DTO");
const user_business_DTO_1 = require("./dto/user.business.DTO");
const UP_publicite_update_request_1 = require("./dto/update.request-DTO/UP-publicite.update.request");
const UB_publicite_update_request_1 = require("./dto/update.request-DTO/UB-publicite.update.request");
let UserController = class UserController {
    constructor(userAdapter) {
        this.userAdapter = userAdapter;
    }
    ///------------CONTROLLERS CREATE ACCOUNT-------------------
    async createPersonalAccount(requesNewtUser) {
        try {
            return (await this.userAdapter.createUser(requesNewtUser, 0));
        }
        catch (error) {
            throw error;
        }
    }
    async createBusinessAccount(requestNewUser) {
        try {
            return (await this.userAdapter.createUser(requestNewUser, 1));
        }
        catch (error) {
            throw error;
        }
    }
    ///------------CONTROLLERS UPDATE ACCOUNT-------------------
    async updatePersonalAccount(updateRequest, username) {
        try {
            return (await this.userAdapter.updateUser(username, updateRequest, 0));
        }
        catch (error) {
            throw error;
        }
    }
    async updateBusinessAccount(updateRequest, username) {
        try {
            return (await this.userAdapter.updateUser(username, updateRequest, 1));
        }
        catch (error) {
            throw error;
        }
    }
};
__decorate([
    (0, common_1.Post)('/personal'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new personal account' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'The account has been successfully created.',
        type: [user_person_DTO_1.UserPersonDto],
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error.',
    }),
    __param(0, (0, common_1.Body)())
], UserController.prototype, "createPersonalAccount", null);
__decorate([
    (0, common_1.Post)('/business'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new business account' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'The account has been successfully created.',
        type: [user_business_DTO_1.UserBusinessDto],
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error.',
    }),
    __param(0, (0, common_1.Body)())
], UserController.prototype, "createBusinessAccount", null);
__decorate([
    (0, common_1.Put)('/personal/:username'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a new personal account' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The account has been successfully Updated.',
        type: [UP_publicite_update_request_1.UP_publiciteUpdateRequestDto],
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('username'))
], UserController.prototype, "updatePersonalAccount", null);
__decorate([
    (0, common_1.Put)('/business/:username'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a new business account' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The account has been successfully Updated.',
        type: [UB_publicite_update_request_1.UB_publiciteUpdateRequestDto],
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('username'))
], UserController.prototype, "updateBusinessAccount", null);
UserController = __decorate([
    (0, swagger_1.ApiTags)('Accounts'),
    (0, common_1.Controller)('user'),
    __param(0, (0, common_1.Inject)('UserAdapterInterface'))
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map