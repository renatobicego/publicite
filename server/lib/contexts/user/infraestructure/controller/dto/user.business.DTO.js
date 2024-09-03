"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBusinessUpdateDto = exports.UserBusinessDto = void 0;
const mongoose_1 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UserBusinessDto {
    static formatDocument(user) {
        return {
            clerkId: user.getClerkId(),
            email: user.getEmail(),
            username: user.getUsername(),
            description: user.getDescription(),
            profilePhotoUrl: user.getProfilePhotoUrl(),
            countryRegion: user.getCountryRegion(),
            isActive: user.getIsActive(),
            contact: user.getContact(),
            createdTime: user.getCreatedTime(),
            subscriptions: user.getSubscriptions(),
            groups: user.getGroups(),
            magazines: user.getMagazines(),
            board: user.getBoard(),
            post: user.getPost(),
            userRelations: user.getUserRelations(),
            userType: user.getUserType(),
            sector: user.getSector(),
            name: user.getName(),
            lastName: user.getLastName(),
            businessName: user.getBusinessName(),
            _id: user.getId(),
        };
    }
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the user in clerk',
        example: '5f9d8f5e9d8f5e9d8f5e9d8f',
        type: String,
    })
], UserBusinessDto.prototype, "clerkId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email of the user',
        example: 'maxi@dutsiland.com',
        type: String,
    })
], UserBusinessDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Username of the user',
        example: 'mcvetic97',
        type: String,
    })
], UserBusinessDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description of the user',
        example: 'I like to code',
        type: String,
    })
], UserBusinessDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Profile photo URL of the user',
        example: 'https://your-bucket.com/profile.jpg',
        type: String,
    })
], UserBusinessDto.prototype, "profilePhotoUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Country of the user',
        example: 'Argentina',
        type: String,
    })
], UserBusinessDto.prototype, "countryRegion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is the user active?',
        example: 'true',
        type: Boolean,
    })
], UserBusinessDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the schema - contact',
        example: '5f9d8f5e9d8f5e9d8f5e9d8f',
        type: mongoose_1.Types.ObjectId,
    })
], UserBusinessDto.prototype, "contact", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Created time of the user',
        example: '2024-10-10',
        type: String,
    })
], UserBusinessDto.prototype, "createdTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ids of the subscriptions schema',
        example: '5f9d8f5e9d8f5e9d8f5e9d8f',
        type: [mongoose_1.Types.ObjectId],
    }),
    (0, class_validator_1.IsOptional)()
], UserBusinessDto.prototype, "subscriptions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ids of the groups schema',
        example: '5f9d8f5e9d8f5e9d8f5e9d8f',
        type: [mongoose_1.Types.ObjectId],
    }),
    (0, class_validator_1.IsOptional)()
], UserBusinessDto.prototype, "groups", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ids of the magazines schema',
        example: '5f9d8f5e9d8f5e9d8f5e9d8f',
        type: [mongoose_1.Types.ObjectId],
    }),
    (0, class_validator_1.IsOptional)()
], UserBusinessDto.prototype, "magazines", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ids of the board schema',
        example: '5f9d8f5e9d8f5e9d8f5e9d8f',
        type: [mongoose_1.Types.ObjectId],
    }),
    (0, class_validator_1.IsOptional)()
], UserBusinessDto.prototype, "board", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ids of the post schema',
        example: '5f9d8f5e9d8f5e9d8f5e9d8f',
        type: [mongoose_1.Types.ObjectId],
    }),
    (0, class_validator_1.IsOptional)()
], UserBusinessDto.prototype, "post", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ids of the userRelations schema',
        example: '5f9d8f5e9d8f5e9d8f5e9d8f',
        type: [mongoose_1.Types.ObjectId],
    }),
    (0, class_validator_1.IsOptional)()
], UserBusinessDto.prototype, "userRelations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of the user',
        example: '1',
        type: String,
    })
], UserBusinessDto.prototype, "userType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sector ID of the company',
        example: '5f9d8f5e9d8f5e9d8f5e9d8f',
        type: String,
    })
], UserBusinessDto.prototype, "sector", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name',
        example: 'Maxi',
        type: String,
    })
], UserBusinessDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last Name',
        example: 'Cvetic',
        type: String,
    })
], UserBusinessDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business Name',
        example: 'Cvetic',
        type: String,
    })
], UserBusinessDto.prototype, "businessName", void 0);
exports.UserBusinessDto = UserBusinessDto;
class UserBusinessUpdateDto {
    static formatDocument(user) {
        return {
            clerkId: user.getClerkId(),
            email: user.getEmail(),
            username: user.getUsername(),
            description: user.getDescription(),
            profilePhotoUrl: user.getProfilePhotoUrl(),
            countryRegion: user.getCountryRegion(),
            isActive: user.getIsActive(),
            contact: user.getContact(),
            createdTime: user.getCreatedTime(),
            subscriptions: user.getSubscriptions(),
            groups: user.getGroups(),
            magazines: user.getMagazines(),
            board: user.getBoard(),
            post: user.getPost(),
            userRelations: user.getUserRelations(),
            userType: user.getUserType(),
            sector: user.getSector(),
            businessName: user.getBusinessName(),
            name: user.getName(),
            lastName: user.getLastName(),
            _id: user.getId(),
        };
    }
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the user in Database',
        example: '5f9d8f5e9d8f5e9d8f5e9d8f',
        type: String,
    })
], UserBusinessUpdateDto.prototype, "_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'email of the user',
        example: 'maxi@dutsiland.com',
        type: String,
    })
], UserBusinessUpdateDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'username of the user',
        example: 'mcvetic97',
        type: String,
    })
], UserBusinessUpdateDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description of the user',
        example: 'I like to code',
        type: String,
    })
], UserBusinessUpdateDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Profile photo URL of the user',
        example: 'https://your-bucket.com/profile.jpg',
        type: String,
    })
], UserBusinessUpdateDto.prototype, "profilePhotoUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Country of the user',
        example: 'Argentina',
        type: String,
    })
], UserBusinessUpdateDto.prototype, "countryRegion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sector ID of the company',
        example: '5f9d8f5e9d8f5e9d8f5e9d8f',
        type: String,
    })
], UserBusinessUpdateDto.prototype, "sector", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'name',
        example: 'Maxi',
        type: String,
    })
], UserBusinessUpdateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Lastname',
        example: 'Cvetic',
        type: String,
    })
], UserBusinessUpdateDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the company',
        example: 'Dutsiland',
        type: String,
    })
], UserBusinessUpdateDto.prototype, "businessName", void 0);
exports.UserBusinessUpdateDto = UserBusinessUpdateDto;
//# sourceMappingURL=user.business.DTO.js.map