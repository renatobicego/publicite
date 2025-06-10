"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectorResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const mongoose_1 = require("mongoose");
class SectorResponseDto {
    static formatClassToResponse(sector) {
        return {
            _id: sector.getId(),
            label: sector.getLabel(),
            description: sector.getDescription(),
        };
    }
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of sector',
        example: '5f9d8f5e9d8f5e9d8f5e9d8f',
        type: mongoose_1.Types.ObjectId,
    })
], SectorResponseDto.prototype, "_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Label sector',
        example: 'Technology',
        type: String,
    })
], SectorResponseDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description of sector',
        example: 'This is a sector',
        type: String,
    })
], SectorResponseDto.prototype, "description", void 0);
exports.SectorResponseDto = SectorResponseDto;
//# sourceMappingURL=sector.dto.js.map