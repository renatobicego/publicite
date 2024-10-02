"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config"); // Asegúrate de importar ConfigModule
const core_1 = require("@nestjs/core");
const webhook_module_1 = require("./contexts/webhook/infrastructure/module/webhook.module");
const database_module_1 = require("./contexts/shared/database/infrastructure/database.module");
const logger_module_1 = require("./contexts/shared/logger/logger.module");
const user_module_1 = require("./contexts/user/infrastructure/module/user.module");
const exception_filter_1 = require("./contexts/shared/exceptionFilter/infrastructure/exception.filter");
const contact_module_1 = require("./contexts/contact/infrastructure/module/contact.module");
const sector_module_1 = require("./contexts/businessSector/infrastructure/module/sector.module");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true, // Opcional: hace que las variables de entorno estén disponibles globalmente
            }),
            webhook_module_1.WebhookModule,
            user_module_1.UserModule,
            database_module_1.DatabaseModule,
            logger_module_1.LoggerModule,
            contact_module_1.ContactModule,
            sector_module_1.SectorModule,
        ],
        providers: [
            {
                provide: core_1.APP_FILTER,
                useClass: exception_filter_1.AllExceptionsFilter,
            },
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map