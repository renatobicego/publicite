"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const express = require("express");
const compression = require("compression");
const https_1 = require("firebase-functions/v2/https");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
// Create an instance of Express server
const expressServer = express();
// Apply compression middleware
expressServer.use(compression());
let nestApp;
// Function to initialize NestJS application
const initializeNestApp = async () => {
    if (!nestApp) {
        nestApp = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressServer));
        nestApp.useGlobalPipes(new common_1.ValidationPipe({ transform: true }));
        nestApp.enableCors({});
        await nestApp.init();
    }
};
// Export Firebase function
exports.api = (0, https_1.onRequest)(async (request, response) => {
    await initializeNestApp();
    expressServer(request, response);
});
//# sourceMappingURL=index.js.map