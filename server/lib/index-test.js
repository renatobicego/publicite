"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Usar el ValidationPipe globalmente
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true }));
    // Habilitar CORS
    app.enableCors();
    // Configuración de Swagger
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Publicite API documentation')
        .setDescription('Publicite - API documentation')
        .setVersion('1.0')
        .addTag('Endpoints 🚀')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document); // La documentación estará disponible en /api
    await app.listen(3001);
}
bootstrap();
//# sourceMappingURL=index-test.js.map