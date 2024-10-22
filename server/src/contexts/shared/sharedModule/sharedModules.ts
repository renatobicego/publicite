import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupMagazineModel } from 'src/contexts/magazine/infrastructure/schemas/magazine.group.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'GroupMagazine', schema: GroupMagazineModel.schema },
    ]),
  ],
  exports: [
    MongooseModule.forFeature([
      { name: 'GroupMagazine', schema: GroupMagazineModel.schema },
    ]),
  ],
})
export class SharedModule {}
