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
var ContactService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const contact_entity_1 = require("../../domain/entity/contact.entity");
let ContactService = ContactService_1 = class ContactService {
    constructor(contactRepository, logger) {
        this.contactRepository = contactRepository;
        this.logger = logger;
    }
    async createContact(contact, options) {
        try {
            this.logger.log('Creating contact in service: ' + ContactService_1.name);
            const formatContact = contact_entity_1.Contact.formatDtoToEntity(contact);
            return await this.contactRepository.createContact(formatContact, options);
        }
        catch (error) {
            throw error;
        }
    }
};
ContactService = ContactService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ContactRepositoryInterface'))
], ContactService);
exports.ContactService = ContactService;
//# sourceMappingURL=contact.service.js.map