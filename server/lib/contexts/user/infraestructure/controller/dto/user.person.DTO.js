"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPersonDto = void 0;
const mongoose_1 = require("mongoose");
const enums_request_1 = require("./enums.request");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UserPersonDto {
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
            name: user.getName(),
            lastName: user.getLastName(),
            gender: user.getGender(),
            birthDate: user.getBirthDate(),
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
], UserPersonDto.prototype, "clerkId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'email of the user',
        example: 'maxi@dutsiland.com',
        type: String,
    })
], UserPersonDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'username of the user',
        example: 'mcvetic97',
        type: String,
    })
], UserPersonDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description of the user',
        example: 'I like to code',
        type: String,
    })
], UserPersonDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Profile photo URL of the user',
        example: 'https://your-bucket.com/profile.jpg',
        type: String,
    })
], UserPersonDto.prototype, "profilePhotoUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Country of the user',
        example: 'Argentina',
        type: String,
    })
], UserPersonDto.prototype, "countryRegion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is the user active?',
        example: 'true',
        type: Boolean,
    })
], UserPersonDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the schema - contact',
        example: '5f9d8f5e9d8f5e9d8f5e9d8f',
        type: mongoose_1.Types.ObjectId,
    })
], UserPersonDto.prototype, "contact", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Created time of the user',
        example: '2024-10-10',
        type: String,
    })
], UserPersonDto.prototype, "createdTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ids of the subscriptions schema',
        example: ['5f9d8f5e9d8f5e9d8f5e9d8f'],
        type: [mongoose_1.Types.ObjectId],
    }),
    (0, class_validator_1.IsOptional)()
], UserPersonDto.prototype, "subscriptions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ids of the groups schema',
        example: ['5f9d8f5e9d8f5e9d8f5e9d8f'],
        type: [mongoose_1.Types.ObjectId],
    }),
    (0, class_validator_1.IsOptional)()
], UserPersonDto.prototype, "groups", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ids of the magazines schema',
        example: ['5f9d8f5e9d8f5e9d8f5e9d8f'],
        type: [mongoose_1.Types.ObjectId],
    }),
    (0, class_validator_1.IsOptional)()
], UserPersonDto.prototype, "magazines", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ids of the board schema',
        example: ['5f9d8f5e9d8f5e9d8f5e9d8f'],
        type: [mongoose_1.Types.ObjectId],
    }),
    (0, class_validator_1.IsOptional)()
], UserPersonDto.prototype, "board", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ids of the post schema',
        example: ['5f9d8f5e9d8f5e9d8f5e9d8f'],
        type: [mongoose_1.Types.ObjectId],
    }),
    (0, class_validator_1.IsOptional)()
], UserPersonDto.prototype, "post", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ids of the userRelations schema',
        example: ['5f9d8f5e9d8f5e9d8f5e9d8f'],
        type: [mongoose_1.Types.ObjectId],
    }),
    (0, class_validator_1.IsOptional)()
], UserPersonDto.prototype, "userRelations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of the user',
        example: '1',
        type: String,
    })
], UserPersonDto.prototype, "userType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the user',
        example: 'Renato',
        type: String,
    })
], UserPersonDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last name of the user',
        example: 'Bicego',
        type: String,
    })
], UserPersonDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Gender of the user',
        example: " 'M' | 'F | 'X' | 'O' ",
        type: String,
    }),
    (0, class_validator_1.IsEnum)(enums_request_1.Gender)
], UserPersonDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Birth date of the user',
        example: '2024-10-10',
        type: String,
    })
], UserPersonDto.prototype, "birthDate", void 0);
exports.UserPersonDto = UserPersonDto;
//# sourceMappingURL=user.person.DTO.js.map