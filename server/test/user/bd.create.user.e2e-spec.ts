import { Test } from '@nestjs/testing';
import { Connection, ObjectId } from 'mongoose';

import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/contexts/shared/database/infraestructure/database.service';
import { fullNameNormalization } from 'src/contexts/user/application/functions/utils';
import {
  UserType,
  Gender,
} from 'src/contexts/user/domain/entity/enum/user.enums';

let dbConnection: Connection;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let httpServer: any;
let app: any;

describe('Insert Data', () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    dbConnection = moduleRef
      .get<DatabaseService>(DatabaseService)
      .getDBHandle();
    httpServer = app.getHttpServer();
    await dbConnection.collection('users').deleteMany({});
    await dbConnection.collection('contacts').deleteMany({}); // Limpiar contactos antes de cada prueba
  });

  beforeEach(async () => {
    // Generar y crear contactos y usuarios
    const users = await generateAndInsertUsers(50, 50); // 50 usuarios personales, 50 de empresa
    await dbConnection.collection('users').insertMany(users);
  });

  afterAll(async () => {
    await dbConnection.close();
    await app.close();
  });

  it('should create 100 users with contacts', async () => {
    const userCount = await dbConnection.collection('users').countDocuments();
    const contactCount = await dbConnection
      .collection('contacts')
      .countDocuments();
    expect(userCount).toBe(100); // Verifica que se hayan creado 100 usuarios
    expect(contactCount).toBe(100); // Verifica que se hayan creado 100 contactos
  });
});

// Función para generar y crear contactos junto a usuarios de tipo Persona y Empresa
const generateAndInsertUsers = async (
  personalCount: number,
  businessCount: number,
) => {
  const users = [];
  const emails = new Set<string>();

  // Generar usuarios personales
  const personalUsers = await generatePersonalUsers(personalCount, emails);
  users.push(...personalUsers);

  // Generar usuarios de empresa
  const businessUsers = await generateBusinessUsers(businessCount, emails);
  users.push(...businessUsers);

  return users;
};

// Función para generar usuarios personales
const generatePersonalUsers = async (count: number, emails: Set<string>) => {
  const users = [];

  const names = [
    { name: 'Juan', lastName: 'Pérez' },
    { name: 'María', lastName: 'González' },
    { name: 'Carlos', lastName: 'López' },
    { name: 'Ana', lastName: 'Hernández' },
    { name: 'Luis', lastName: 'Martínez' },
    { name: 'Sofía', lastName: 'Ramírez' },
    { name: 'Diego', lastName: 'Sánchez' },
    { name: 'Lucía', lastName: 'Torres' },
    { name: 'Javier', lastName: 'Mendoza' },
    { name: 'Valentina', lastName: 'Vásquez' },
    { name: 'Fernando', lastName: 'Castillo' },
    { name: 'Clara', lastName: 'Morales' },
    { name: 'Andrés', lastName: 'Jiménez' },
    { name: 'Isabella', lastName: 'Ríos' },
    { name: 'Mateo', lastName: 'Cruz' },
    { name: 'Victoria', lastName: 'Salazar' },
    { name: 'Sebastián', lastName: 'Aguilar' },
    { name: 'Camila', lastName: 'Ponce' },
    { name: 'Emilio', lastName: 'Guerrero' },
    { name: 'Natalia', lastName: 'Aguirre' },
  ];

  for (let i = 0; i < count; i++) {
    const contact = await createContact(i);
    const { name, lastName } = names[i % names.length];
    const finder = fullNameNormalization(name, lastName);
    const username = `user${i + 1}`;

    // Generar un email único
    let email;
    do {
      email = `${username}@example.com`;
    } while (emails.has(email));
    emails.add(email);

    users.push({
      clerkId: `56sa165sad165sad15a6sd165`,
      name: name,
      lastName: lastName,
      username: username,
      email: email,
      contact: contact.insertedId,
      userType: UserType.Person,
      finder: finder,
      gender: i % 2 === 0 ? Gender.Male : Gender.Female,
    });
  }
  return users;
};

// Función para generar usuarios de empresa
const generateBusinessUsers = async (count: number, emails: Set<string>) => {
  const users = [];

  const namesWithBusinesses = [
    { name: 'Gabriel', lastName: 'Mendoza', businessName: 'Google' },
    { name: 'Elena', lastName: 'Pizarro', businessName: 'Apple' },
    { name: 'Roberto', lastName: 'Ramírez', businessName: 'Microsoft' },
    { name: 'Laura', lastName: 'Gutiérrez', businessName: 'Amazon' },
    { name: 'José', lastName: 'Fernández', businessName: 'Facebook' },
    { name: 'Carmen', lastName: 'Jiménez', businessName: 'Tesla' },
    { name: 'Hugo', lastName: 'Vázquez', businessName: 'Netflix' },
    { name: 'Patricia', lastName: 'Castillo', businessName: 'Adobe' },
    { name: 'Fernando', lastName: 'Martínez', businessName: 'Salesforce' },
    { name: 'Marta', lastName: 'Alvarez', businessName: 'IBM' },
    { name: 'Diego', lastName: 'Pérez', businessName: 'Spotify' },
    { name: 'Valeria', lastName: 'López', businessName: 'Oracle' },
    { name: 'Carlos', lastName: 'Salazar', businessName: 'Samsung' },
    { name: 'Lucía', lastName: 'Torres', businessName: 'Zoom' },
    { name: 'Nicolás', lastName: 'Ríos', businessName: 'Slack' },
    { name: 'Isabel', lastName: 'Morales', businessName: 'LinkedIn' },
    { name: 'Santiago', lastName: 'Cruz', businessName: 'eBay' },
    { name: 'Agustina', lastName: 'Vasquez', businessName: 'Alibaba' },
    { name: 'Joaquín', lastName: 'Hernández', businessName: 'PayPal' },
    { name: 'Renata', lastName: 'Jiménez', businessName: 'Twitter' },
  ];

  for (let i = 0; i < count; i++) {
    const contact = await createContact(i + count); // Para no solapar contactos
    const { name, lastName, businessName } =
      namesWithBusinesses[i % namesWithBusinesses.length];
    const finder = fullNameNormalization(name, lastName, businessName);
    const username = `business_user${i + 1}`;

    // Generar un email único
    let email;
    do {
      email = `${username}@example.com`;
    } while (emails.has(email));
    emails.add(email);

    users.push({
      clerkId: `56sa165sad165sad15a6sd165`,
      name: name,
      lastName: lastName,
      username: username,
      email: email,
      contact: contact.insertedId,
      userType: UserType.Business,
      businessName: businessName,
      sector: '66d2177dda11f93d8647cf3a' as unknown as ObjectId,
      finder: finder,
    });
  }
  return users;
};

// Función para crear un contacto y devolver su documento
const createContact = async (index: number) => {
  const contact = {
    phone: `2151${index}`,
    instagram: `@contact${index}`,
    facebook: '',
    x: '',
    website: '',
  };
  const result = await dbConnection.collection('contacts').insertOne(contact);
  return result; // Retorna el resultado de la inserción
};
