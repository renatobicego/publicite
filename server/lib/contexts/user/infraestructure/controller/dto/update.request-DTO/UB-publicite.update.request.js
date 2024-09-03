"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UB_publiciteUpdateRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const mongoose_1 = require("mongoose");
class UB_publiciteUpdateRequestDto {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Name of the company',
        example: 'Dutsiland',
        type: String,
    })
], UB_publiciteUpdateRequestDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sector ID of the company',
        example: '5f9d8f5e9d8f5e9d8f5e9d8f',
        type: mongoose_1.Types.ObjectId,
    })
], UB_publiciteUpdateRequestDto.prototype, "sector", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Country of the company',
        example: 'Argentina',
        type: String,
    })
], UB_publiciteUpdateRequestDto.prototype, "countryRegion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Description of the company',
        example: 'I like to code',
        type: String,
    })
], UB_publiciteUpdateRequestDto.prototype, "description", void 0);
exports.UB_publiciteUpdateRequestDto = UB_publiciteUpdateRequestDto;
//# sourceMappingURL=UB-publicite.update.request.js.map