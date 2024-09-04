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
exports.ContactRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
let ContactRepository = class ContactRepository {
    constructor(contactModel) {
        this.contactModel = contactModel;
    }
    async createContact(contact, options) {
        const createdContact = new this.contactModel({
            phone: contact.getPhone(),
            instagram: contact.getInstagram(),
            facebook: contact.getFacebook(),
            x: contact.getX(),
            website: contact.getWebsite(),
        });
        await createdContact.save({ session: options === null || options === void 0 ? void 0 : options.session });
        return createdContact._id;
    }
};
ContactRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Contact'))
], ContactRepository);
exports.ContactRepository = ContactRepository;
//# sourceMappingURL=contact.repository.js.map