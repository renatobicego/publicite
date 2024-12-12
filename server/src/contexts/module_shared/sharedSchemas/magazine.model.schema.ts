import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupMagazineModel } from 'src/contexts/module_magazine/magazine/infrastructure/schemas/magazine.group.schema';
import { MagazineModel } from 'src/contexts/module_magazine/magazine/infrastructure/schemas/magazine.schema';
import { UserMagazineModel } from 'src/contexts/module_magazine/magazine/infrastructure/schemas/magazine.user.schema';


@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: MagazineModel.modelName,
                schema: MagazineModel.schema,
                discriminators: [
                    {
                        name: UserMagazineModel.modelName,
                        schema: UserMagazineModel.schema,
                    },
                    {
                        name: GroupMagazineModel.modelName,
                        schema: GroupMagazineModel.schema,
                    },
                ],
            }
        ]),
    ],
    exports: [
        MongooseModule.forFeature([
            {
                name: MagazineModel.modelName,
                schema: MagazineModel.schema,
                discriminators: [
                    {
                        name: UserMagazineModel.modelName,
                        schema: UserMagazineModel.schema,
                    },
                    {
                        name: GroupMagazineModel.modelName,
                        schema: GroupMagazineModel.schema,
                    },
                ],
            }
        ]),
    ],
})
export class MagazineModelSharedModule { }