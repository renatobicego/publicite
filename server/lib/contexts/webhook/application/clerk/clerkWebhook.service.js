"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const common_1 = require("@nestjs/common");
//import { User } from 'src/contexts/user/domain/entity/user.entity';
/*
  se utiliza para marcar una clase como un "proveedor" que puede ser
  inyectado en otras partes de la aplicación mediante el sistema de
  inyección de dependencias
  Cuando necesitemos de esta clase para procesar un evento de webhook se inyectara ya que usamos @Injectable
*/
let WebhookService = class WebhookService {
    constructor() { } // private readonly userService: UserRepositoryInterface, // @Inject('UserRepositoryInterface')
    async processEvent(event) {
        const { object, type } = event;
        console.log(`Processing webhook Object: ${object} and type: ${type}`);
        // switch (type) {
        //   case 'user.created':
        //     const { first_name, last_name, image_url } = event.data;
        //     const user = new User(
        //       first_name,
        //       last_name,
        //       image_url,
        //     );
        //     this.userService.createUser(user);
        //     break;
        //   default:
        //     console.log('Unknown event type:', type);
        //     break;
        // }
    }
};
WebhookService = __decorate([
    (0, common_1.Injectable)()
], WebhookService);
exports.WebhookService = WebhookService;
//# sourceMappingURL=clerkWebhook.service.js.map