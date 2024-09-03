"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPerson = void 0;
const user_entity_1 = require("./user.entity");
var UserType;
(function (UserType) {
    UserType["Personal"] = "Personal";
    UserType["Business"] = "Business";
})(UserType || (UserType = {}));
class UserPerson extends user_entity_1.User {
    constructor(clerkId, email, username, description, profilePhotoUrl, countryRegion, isActive, name, lastName, gender, birthDate, contact, createdTime, subscriptions, groups, magazines, board, post, userRelations, userType, _id) {
        super(clerkId, email, username, description, profilePhotoUrl, countryRegion, isActive, name, lastName, contact, createdTime !== null && createdTime !== void 0 ? createdTime : '', subscriptions !== null && subscriptions !== void 0 ? subscriptions : [], groups !== null && groups !== void 0 ? groups : [], magazines !== null && magazines !== void 0 ? magazines : [], board !== null && board !== void 0 ? board : [], post !== null && post !== void 0 ? post : [], userRelations !== null && userRelations !== void 0 ? userRelations : [], userType !== null && userType !== void 0 ? userType : UserType.Personal);
        this.gender = gender;
        this.birthDate = birthDate;
        this._id = _id;
    }
    // Método para crear una entidad UserPerson a partir de un documento de la base de datos
    static formatDocument(document) {
        var _a;
        return new UserPerson(document.clerkId, document.email, document.username, document.description, document.profilePhotoUrl, document.countryRegion, document.isActive, document.name, document.lastName, document.gender, document.birthDate, (_a = document.contact) !== null && _a !== void 0 ? _a : undefined, document.createdTime, document.subscriptions, document.groups, document.magazines, document.board, document.post, document.userRelations, UserType.Personal, document._id);
    }
    // Método para crear una entidad UserPerson a partir de un DTO para la creación
    static formatDtoToEntity(req, contactId) {
        var _a, _b, _c, _d, _e, _f;
        return new UserPerson(req.clerkId, req.email, req.username, req.description, req.profilePhotoUrl, req.countryRegion, req.isActive, req.name, req.lastName, req.gender, req.birthDate, contactId !== null && contactId !== void 0 ? contactId : undefined, req.createdTime, (_a = req.subscriptions) !== null && _a !== void 0 ? _a : [], (_b = req.groups) !== null && _b !== void 0 ? _b : [], (_c = req.magazines) !== null && _c !== void 0 ? _c : [], (_d = req.board) !== null && _d !== void 0 ? _d : [], (_e = req.post) !== null && _e !== void 0 ? _e : [], (_f = req.userRelations) !== null && _f !== void 0 ? _f : [], UserType.Personal);
    }
    static formatUpdateDto(req) {
        const updateObject = Object.assign(Object.assign(Object.assign(Object.assign({}, (req.birthDate && { birthDate: req.birthDate })), (req.gender && { gender: req.gender })), (req.countryRegion && { countryRegion: req.countryRegion })), (req.description && { description: req.description }));
        return updateObject;
    }
    getId() {
        return this._id;
    }
    getGender() {
        return this.gender;
    }
    getBirthDate() {
        return this.birthDate;
    }
}
exports.UserPerson = UserPerson;
//# sourceMappingURL=userPerson.entity.js.map