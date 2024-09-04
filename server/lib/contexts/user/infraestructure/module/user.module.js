"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const user_controller_1 = require("../controller/user.controller");
const user_adapter_1 = require("../adapters/user.adapter");
const user_service_1 = require("../../application/service/user.service");
const logger_service_1 = require("src/contexts/shared/logger/logger.service");
const user_repository_1 = require("../repository/user.repository");
const userPerson_schema_1 = require("../schemas/userPerson.schema");
const userBussiness_schema_1 = require("../schemas/userBussiness.schema");
const user_schema_1 = require("../schemas/user.schema");
const contact_module_1 = require("src/contexts/contact/infraestructure/module/contact.module");
const sector_repository_1 = require("src/contexts/businessSector/infraestructure/repository/sector.repository");
const sector_module_1 = require("src/contexts/businessSector/infraestructure/module/sector.module");
let UserModule = class UserModule {
};
UserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                {
                    name: user_schema_1.UserModel.modelName,
                    schema: user_schema_1.UserModel.schema,
                    discriminators: [
                        { name: userPerson_schema_1.UserPersonModel.modelName, schema: userPerson_schema_1.UserPersonModel.schema },
                        {
                            name: userBussiness_schema_1.UserBusinessModel.modelName,
                            schema: userBussiness_schema_1.UserBusinessModel.schema,
                        },
                    ],
                },
            ]),
            contact_module_1.ContactModule,
            sector_module_1.SectorModule,
        ],
        controllers: [user_controller_1.UserController],
        providers: [
            logger_service_1.MyLoggerService,
            {
                provide: 'UserAdapterInterface',
                useClass: user_adapter_1.UserAdapter,
            },
            {
                provide: 'UserServiceInterface',
                useClass: user_service_1.UserService,
            },
            {
                provide: 'UserRepositoryInterface',
                useClass: user_repository_1.UserRepository,
            },
            {
                provide: 'SectorRepositoryInterface',
                useClass: sector_repository_1.SectorRepository,
            },
        ],
    })
], UserModule);
exports.UserModule = UserModule;
//# sourceMappingURL=user.module.js.map