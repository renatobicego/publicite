"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Importamos las herramientas y clases necesarias para las pruebas unitarias y el manejo de la lógica de negocio.
const testing_1 = require("@nestjs/testing"); // Utilidades de NestJS para crear módulos de prueba.
const common_1 = require("@nestjs/common"); // Excepción que se lanza cuando se recibe una solicitud incorrecta.
const mongoose_1 = require("@nestjs/mongoose"); // Utilidad para obtener el token de conexión de Mongoose.
const mongoose_2 = require("mongoose"); // Clases de Mongoose para manejar sesiones y tipos específicos.
const user_service_1 = require("./user.service"); // Servicio que vamos a probar.
const user_person_DTO_1 = require("../../infrastructure/controller/dto/user.person.DTO"); // DTO para datos de usuarios personales.
const user_business_DTO_1 = require("../../infrastructure/controller/dto/user.business.DTO"); // DTO para datos de usuarios empresariales.
const logger_service_1 = require("src/contexts/shared/logger/logger.service"); // Servicio de logging personalizado.
const userPerson_entity_1 = require("../../domain/entity/userPerson.entity"); // Entidad que representa un usuario personal.
const userBussiness_entity_1 = require("../../domain/entity/userBussiness.entity"); // Entidad que representa un usuario empresarial.
describe('UserService', () => {
    // Declaramos las variables que usaremos en las pruebas para almacenar las instancias de los servicios y conexiones.
    let userService;
    let userRepository;
    let contactService;
    let logger;
    let connection;
    let session;
    // El bloque beforeEach se ejecuta antes de cada prueba individual.
    beforeEach(async () => {
        // Creamos un módulo de pruebas usando `Test.createTestingModule`.
        const module = await testing_1.Test.createTestingModule({
            // Definimos los proveedores que estarán disponibles durante las pruebas.
            providers: [
                user_service_1.UserService,
                {
                    // Proveemos la implementación de la interfaz UserRepositoryInterface usando un mock.
                    provide: 'UserRepositoryInterface',
                    useValue: {
                        save: jest.fn(), // Mock de la función save, que simula el comportamiento del repositorio.
                    },
                },
                {
                    // Proveemos la implementación de la interfaz ContactServiceInterface usando un mock.
                    provide: 'ContactServiceInterface',
                    useValue: {
                        createContact: jest.fn(), // Mock de la función createContact.
                    },
                },
                {
                    // Proveemos una implementación mock para MyLoggerService.
                    provide: logger_service_1.MyLoggerService,
                    useValue: {
                        log: jest.fn(),
                        error: jest.fn(), // Mock de la función error.
                    },
                },
                {
                    // Proveemos un mock para la conexión a la base de datos usando Mongoose.
                    provide: (0, mongoose_1.getConnectionToken)(),
                    useValue: {
                        startSession: jest.fn().mockResolvedValue({
                            startTransaction: jest.fn(),
                            commitTransaction: jest.fn(),
                            abortTransaction: jest.fn(),
                            endSession: jest.fn(), // Mock de la función endSession para finalizar la sesión.
                        }),
                    },
                },
            ],
        }).compile(); // Compilamos el módulo de prueba.
        // Obtenemos instancias de los servicios y conexión desde el módulo de prueba.
        userService = module.get(user_service_1.UserService);
        userRepository = module.get('UserRepositoryInterface');
        contactService = module.get('ContactServiceInterface');
        logger = module.get(logger_service_1.MyLoggerService);
        connection = module.get((0, mongoose_1.getConnectionToken)());
        session = await connection.startSession(); // Iniciamos una nueva sesión de base de datos.
    });
    // Bloque describe para agrupar las pruebas del método `createUser`.
    describe('createUser', () => {
        // Primera prueba: verifica que se puede crear un usuario personal correctamente.
        it('should create a personal user successfully', async () => {
            const userPersonDto = new user_person_DTO_1.UserPersonDto(); // Creamos un DTO de usuario personal.
            const contactId = new mongoose_2.Types.ObjectId(); // Generamos un nuevo ID de contacto.
            // Simulamos el comportamiento de la función createContact del servicio.
            jest
                .spyOn(userService, 'createContact')
                .mockResolvedValue(contactId);
            // Simulamos el comportamiento del método formatDtoToEntity de la entidad UserPerson.
            jest.spyOn(userPerson_entity_1.UserPerson, 'formatDtoToEntity').mockReturnValue({});
            // Simulamos el comportamiento del método save del repositorio.
            jest.spyOn(userRepository, 'save').mockResolvedValue({});
            // Llamamos al método createUser de UserService con el DTO y un tipo de usuario.
            const result = await userService.createUser(userPersonDto, 0);
            // Verificamos que la función createContact fue llamada con los argumentos correctos.
            expect(userService.createContact).toHaveBeenCalledWith(userPersonDto.contact, { session });
            // Verificamos que la función save fue llamada con los argumentos correctos.
            expect(userRepository.save).toHaveBeenCalledWith({}, 0, session);
            // Verificamos que se haya confirmado la transacción.
            expect(session.commitTransaction).toHaveBeenCalled();
            // Verificamos que se haya finalizado la sesión.
            expect(session.endSession).toHaveBeenCalled();
            // Verificamos que el resultado sea el esperado.
            expect(result).toEqual({});
        });
        // Segunda prueba: verifica que se puede crear un usuario empresarial correctamente.
        it('should create a business user successfully', async () => {
            const userBusinessDto = new user_business_DTO_1.UserBusinessDto(); // Creamos un DTO de usuario empresarial.
            const contactId = new mongoose_2.Types.ObjectId(); // Generamos un nuevo ID de contacto.
            // Simulamos el comportamiento de la función createContact del servicio.
            jest
                .spyOn(userService, 'createContact')
                .mockResolvedValue(contactId);
            // Simulamos el comportamiento del método formatDtoToEntity de la entidad UserBussiness.
            jest.spyOn(userBussiness_entity_1.UserBussiness, 'formatDtoToEntity').mockReturnValue({});
            // Simulamos el comportamiento del método save del repositorio.
            jest.spyOn(userRepository, 'save').mockResolvedValue({});
            // Llamamos al método createUser de UserService con el DTO y un tipo de usuario.
            const result = await userService.createUser(userBusinessDto, 1);
            // Verificamos que la función createContact fue llamada con los argumentos correctos.
            expect(userService.createContact).toHaveBeenCalledWith(userBusinessDto.contact, { session });
            // Verificamos que la función save fue llamada con los argumentos correctos.
            expect(userRepository.save).toHaveBeenCalledWith({}, 1, session);
            // Verificamos que se haya confirmado la transacción.
            expect(session.commitTransaction).toHaveBeenCalled();
            // Verificamos que se haya finalizado la sesión.
            expect(session.endSession).toHaveBeenCalled();
            // Verificamos que el resultado sea el esperado.
            expect(result).toEqual({});
        });
        // Tercera prueba: verifica que se lanza una excepción si el tipo de usuario es inválido.
        it('should throw BadRequestException for invalid user type', async () => {
            const invalidDto = {}; // Creamos un DTO inválido.
            // Verificamos que el método createUser lanza una BadRequestException cuando el tipo de usuario es inválido.
            await expect(userService.createUser(invalidDto, 2)).rejects.toThrow(common_1.BadRequestException);
            // Verificamos que la transacción se haya cancelado.
            expect(session.abortTransaction).toHaveBeenCalled();
            // Verificamos que se haya registrado un error en el logger.
            expect(logger.error).toHaveBeenCalledWith('Error in service. The user has not been created');
        });
        // Cuarta prueba: verifica que se manejen los errores y se deshaga la transacción si ocurre un error.
        it('should handle errors and rollback transaction', async () => {
            // Simulamos que la función save del repositorio lanza un error.
            jest
                .spyOn(userRepository, 'save')
                .mockRejectedValue(new Error('Test Error'));
            const userPersonDto = new user_person_DTO_1.UserPersonDto(); // Creamos un DTO de usuario personal.
            // Verificamos que el método createUser lanza un error cuando la función save falla.
            await expect(userService.createUser(userPersonDto, 0)).rejects.toThrow('Test Error');
            // Verificamos que la transacción se haya cancelado.
            expect(session.abortTransaction).toHaveBeenCalled();
            // Verificamos que la sesión se haya finalizado.
            expect(session.endSession).toHaveBeenCalled();
            // Verificamos que se haya registrado un error en el logger.
            expect(logger.error).toHaveBeenCalledWith('Error in service. The user has not been created');
        });
        // it('should handle errors and rollback transaction (contact)', async () => {
        //   // Simulamos que la función save del repositorio lanza un error.
        //   jest
        //     .spyOn(contactService, 'createContact')
        //     .mockRejectedValue(new Error('Test Error'));
        //   const contactDto = new ContactRequestDto(); // Creamos un DTO de usuario personal.
        //   // Verificamos que el método createUser lanza un error cuando la función save falla.
        //   await expect(contactService.createContact(contactDto)).rejects.toThrow(
        //     'Test Error',
        //   );
        //   //verificamos que no se llame al repositorio
        //   expect(ContactRepository.createContact).not.toHaveBeenCalled();
        //   // Verificamos que la transacción se haya cancelado.
        //   expect(session.abortTransaction).toHaveBeenCalled();
        //   // Verificamos que la sesión se haya finalizado.
        //   expect(session.endSession).toHaveBeenCalled();
        //   // Verificamos que se haya registrado un error en el logger.
        //   expect(logger.error).toHaveBeenCalledWith(
        //     'Error in service. The user has not been created',
        //   );
        // });
    });
});
//# sourceMappingURL=user.service.spec.js.map