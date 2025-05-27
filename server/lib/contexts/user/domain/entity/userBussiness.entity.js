"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBussiness = void 0;
const user_entity_1 = require("./user.entity");
class UserBussiness extends user_entity_1.User {
    constructor(clerkId, email, username, description, profilePhotoUrl, countryRegion, isActive, name, lastName, sector, businessName, contact, // Hacer contact opcional
    createdTime = '', // Valor por defecto
    subscriptions = [], // Valor por defecto
    groups = [], // Valor por defecto
    magazines = [], // Valor por defecto
    board = [], // Valor por defecto
    post = [], // Valor por defecto
    userRelations = [], // Valor por defecto
    userType = user_entity_1.UserType.Business, // Valor por defecto
    _id) {
        super(clerkId, email, username, description, profilePhotoUrl, countryRegion, isActive, name, lastName, contact, createdTime, subscriptions, groups, magazines, board, post, userRelations, userType);
        this.sector = sector;
        this.businessName = businessName;
        this._id = _id;
    }
    static formatDocument(document) {
        var _a, _b, _c, _d, _e, _f, _g;
        return new UserBussiness(document.clerkId, document.email, document.username, document.description, document.profilePhotoUrl, document.countryRegion, document.isActive, document.name, document.lastName, document.contact, document.businessName, document.sector, document.createdTime, (_a = document.subscriptions) !== null && _a !== void 0 ? _a : [], (_b = document.groups) !== null && _b !== void 0 ? _b : [], (_c = document.magazines) !== null && _c !== void 0 ? _c : [], (_d = document.board) !== null && _d !== void 0 ? _d : [], (_e = document.post) !== null && _e !== void 0 ? _e : [], (_f = document.userRelations) !== null && _f !== void 0 ? _f : [], (_g = document.userType) !== null && _g !== void 0 ? _g : user_entity_1.UserType.Business, // Valor por defecto en caso de que falte
        document._id);
    }
    static formatDtoToEntity(dto, contactId) {
        var _a, _b, _c, _d, _e, _f;
        return new UserBussiness(dto.clerkId, dto.email, dto.username, dto.description, dto.profilePhotoUrl, dto.countryRegion, dto.isActive, dto.name, dto.lastName, dto.sector, dto.businessName, contactId, dto.createdTime, (_a = dto.subscriptions) !== null && _a !== void 0 ? _a : [], (_b = dto.groups) !== null && _b !== void 0 ? _b : [], (_c = dto.magazines) !== null && _c !== void 0 ? _c : [], (_d = dto.board) !== null && _d !== void 0 ? _d : [], (_e = dto.post) !== null && _e !== void 0 ? _e : [], (_f = dto.userRelations) !== null && _f !== void 0 ? _f : [], user_entity_1.UserType.Business);
    }
    static formatUpdateDto(req) {
        const updateObject = Object.assign(Object.assign(Object.assign(Object.assign({}, (req.businessName && { businessName: req.businessName })), (req.sector && { sector: req.sector })), (req.countryRegion && { countryRegion: req.countryRegion })), (req.description && { description: req.description }));
        return updateObject;
    }
    getId() {
        return this._id;
    }
    getSector() {
        return this.sector;
    }
    getBusinessName() {
        return this.businessName;
    }
}
exports.UserBussiness = UserBussiness;
//# sourceMappingURL=userBussiness.entity.js.map