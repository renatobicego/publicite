"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UP_publiciteUpdateRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UP_publiciteUpdateRequestDto {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Birth date of the user',
        example: '2024-10-10',
        type: String,
    })
], UP_publiciteUpdateRequestDto.prototype, "birthDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Gender of the user',
        example: " 'M' | 'F | 'X' | 'O' ",
        type: String,
    })
], UP_publiciteUpdateRequestDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Country of the user',
        example: 'Argentina',
        type: String,
    })
], UP_publiciteUpdateRequestDto.prototype, "countryRegion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Description of the user',
        example: 'I like to code',
        type: String,
    })
], UP_publiciteUpdateRequestDto.prototype, "description", void 0);
exports.UP_publiciteUpdateRequestDto = UP_publiciteUpdateRequestDto;
//# sourceMappingURL=UP-publicite.update.request.js.map