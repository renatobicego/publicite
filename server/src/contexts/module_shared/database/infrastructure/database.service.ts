import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService {
  constructor(@InjectConnection() private readonly connection: Connection) { }

  getDBHandle(): Connection {
    try {
      return this.connection;
    } catch (error: any) {
      throw error;
    }

  }
}
