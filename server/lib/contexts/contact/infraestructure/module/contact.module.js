"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const contact_controller_1 = require("../controller/contact.controller");
const contact_adapter_1 = require("../adapter/contact.adapter");
const logger_service_1 = require("src/contexts/shared/logger/logger.service");
const contact_service_1 = require("../../application/service/contact.service");
const contact_repository_1 = require("../repository/contact.repository");
const contact_schema_1 = require("../schema/contact.schema");
let ContactModule = class ContactModule {
};
ContactModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: 'Contact', schema: contact_schema_1.ContactSchema }]),
        ],
        controllers: [contact_controller_1.ContactController],
        providers: [
            logger_service_1.MyLoggerService,
            contact_service_1.ContactService,
            contact_repository_1.ContactRepository,
            {
                provide: 'ContactAdapterInterface',
                useClass: contact_adapter_1.ContactAdapter,
            },
            {
                provide: 'ContactServiceInterface',
                useClass: contact_service_1.ContactService,
            },
            {
                provide: 'ContactRepositoryInterface',
                useClass: contact_repository_1.ContactRepository,
            },
        ],
        exports: [
            contact_service_1.ContactService,
            {
                provide: 'ContactServiceInterface',
                useClass: contact_service_1.ContactService,
            },
            {
                provide: 'ContactRepositoryInterface',
                useClass: contact_repository_1.ContactRepository,
            },
        ],
    })
], ContactModule);
exports.ContactModule = ContactModule;
//# sourceMappingURL=contact.module.js.map