"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ContactRequestDto {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Contact phone',
        example: '+54 9 11 1111 1111',
        type: String,
    }),
    (0, class_validator_1.IsOptional)()
], ContactRequestDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Instagram',
        example: '@Dutsiland',
        type: String,
    }),
    (0, class_validator_1.IsOptional)()
], ContactRequestDto.prototype, "instagram", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Facebook',
        example: 'Dutsiland Company',
        type: String,
    }),
    (0, class_validator_1.IsOptional)()
], ContactRequestDto.prototype, "facebook", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'X (Ex twitter)',
        example: '@Dutsiland',
        type: String,
    }),
    (0, class_validator_1.IsOptional)()
], ContactRequestDto.prototype, "x", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Website',
        example: 'htttps://dutsiland.com',
        type: String,
    }),
    (0, class_validator_1.IsOptional)()
], ContactRequestDto.prototype, "website", void 0);
exports.ContactRequestDto = ContactRequestDto;
//# sourceMappingURL=contact.request.js.map