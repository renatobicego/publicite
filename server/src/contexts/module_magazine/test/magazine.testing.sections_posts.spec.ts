import mongoose, { Connection, Model, ObjectId, Types } from "mongoose";
import { TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";


import mapModuleTesting from "./magazine.test.module";
import { GroupDocument } from "src/contexts/module_group/group/infrastructure/schemas/group.schema";
import { insertGroupMagazine, insertSection, insertUserMagazine } from "./models/db/insert.group.magazine";
import { createGroup } from "../../../../test/functions/create.group";
import { MagazineService } from "../magazine/application/service/magazine.service";
import { GroupMagazineDocument, GroupMagazineModel } from "../magazine/infrastructure/schemas/magazine.group.schema";
import { UnauthorizedException } from "@nestjs/common";
import { MagazineSectionDocument, MagazineSectionModel } from "../magazine/infrastructure/schemas/section/magazine.section.schema";
import { UserMagazineDocument } from "../magazine/infrastructure/schemas/magazine.user.schema";

interface SectionRequest {
    title: string,
    isFatherSection: boolean
}

describe('Magazine Service Testing - Sections & Post', () => {
    let connection: Connection;

    let groupMagazineModel: Model<GroupMagazineDocument>
    let magazineSection: Model<MagazineSectionDocument>
    let groupModel: Model<GroupDocument>
    let userMagazineModel: Model<UserMagazineDocument>


    let magazineService: MagazineService;

    const magazineId = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7f");
    const groupId = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7e");
    const userId = new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7a");
    const admins = [
        new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7c"),
        new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7d"),
    ]
    const members = [
        new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7a"),
        new Types.ObjectId("624c2d5d7b8e4d1e4c2d5d7b"),
    ]




    beforeAll(async () => {
        const moduleRef: TestingModule = await mapModuleTesting.get("magazine")();
        connection = mongoose.connection;

        groupMagazineModel = moduleRef.get<Model<GroupMagazineDocument>>(getModelToken(GroupMagazineModel.modelName));
        magazineSection = moduleRef.get<Model<MagazineSectionDocument>>(getModelToken(MagazineSectionModel.modelName));
        userMagazineModel = moduleRef.get<Model<UserMagazineDocument>>(getModelToken("UserMagazine"));
        groupModel = moduleRef.get<Model<GroupDocument>>(getModelToken("Group"));



        magazineService = moduleRef.get<MagazineService>('MagazineServiceInterface');
    });

    afterAll(async () => {
        await magazineSection.deleteMany({});
        await connection.close();

    });

    afterEach(async () => {
        await groupModel.deleteMany({});
        await groupMagazineModel.deleteMany({});
        await userMagazineModel.deleteMany({});
    });


    describe('Add new magazine section in a group magazine and user magazine', () => {
        it('Group Magazine-> type of user : Admin group - Add new magazine section, should return work success', async () => {
            const group = await createGroup({
                _id: groupId,
                admins: [admins[0]],
                magazines: [magazineId],
            }, groupModel);

            const magazine = await insertGroupMagazine(
                groupMagazineModel,
                {
                    _id: magazineId,
                    group: groupId,
                    sections: []


                }
            )
            const sectionToAdd: SectionRequest = {
                title: "Section 1",
                isFatherSection: false
            }


            await magazineService.addNewMagazineSection(
                group.admins[0].toString(),
                magazineId.toString(),
                sectionToAdd,
                groupId.toString()
            )

            const magazineSaved: any = await groupMagazineModel.findById(magazineId).populate('sections');

            expect(magazineSaved).toBeDefined();
            expect(magazineSaved!.sections.length).toBe(1);
            expect(magazineSaved!.sections[0].title).toBe(sectionToAdd.title);
            expect(magazineSaved!.sections[0].isFatherSection).toBe(false);
            expect(magazineSaved!.group).toEqual(magazine.group);


        })

        it('Group Magazine-> type of user : Creator of group - Add new magazine section, should return work success', async () => {
            const group = await createGroup({
                _id: groupId,
                admins: [admins[0]],
                members: [],
                magazines: [magazineId],
                creator: members[0]
            }, groupModel);

            const magazine = await insertGroupMagazine(
                groupMagazineModel,
                {
                    _id: magazineId,
                    group: groupId,
                    sections: [],
                    allowedCollaborators: [members[0]]


                }
            )
            const sectionToAdd: SectionRequest = {
                title: "Section 1",
                isFatherSection: false
            }


            await magazineService.addNewMagazineSection(
                group.creator.toString(),
                magazineId.toString(),
                sectionToAdd,
                groupId.toString()
            )

            const magazineSaved: any = await groupMagazineModel.findById(magazineId).populate('sections');

            expect(magazineSaved).toBeDefined();
            expect(magazineSaved!.sections.length).toBe(1);
            expect(magazineSaved!.sections[0].title).toBe(sectionToAdd.title);
            expect(magazineSaved!.sections[0].isFatherSection).toBe(false);
            expect(magazineSaved!.group).toEqual(magazine.group);


        })

        it('Group Magazine-> type of user : Allowed Collaborator group - Add new magazine section, should return work success', async () => {
            await createGroup({
                _id: groupId,
                admins: [admins[0]],
                members: [],
                magazines: [magazineId],
            }, groupModel);

            const magazine = await insertGroupMagazine(
                groupMagazineModel,
                {
                    _id: magazineId,
                    group: groupId,
                    sections: [],
                    allowedCollaborators: [members[0]]


                }
            )
            const sectionToAdd: SectionRequest = {
                title: "Section 1",
                isFatherSection: false
            }


            await magazineService.addNewMagazineSection(
                magazine.allowedCollaborators![0].toString(),
                magazineId.toString(),
                sectionToAdd,
                groupId.toString()
            )

            const magazineSaved: any = await groupMagazineModel.findById(magazineId).populate('sections');

            expect(magazineSaved).toBeDefined();
            expect(magazineSaved!.sections.length).toBe(1);
            expect(magazineSaved!.sections[0].title).toBe(sectionToAdd.title);
            expect(magazineSaved!.sections[0].isFatherSection).toBe(false);
            expect(magazineSaved!.group).toEqual(magazine.group);


        })

        it('Group Magazine-> type of user : Member of group - Add new magazine section, should return permission error', async () => {
            const group = await createGroup({
                _id: groupId,
                admins: [admins[0]],
                members: [members[0]],
                magazines: [magazineId],
            }, groupModel);

            await insertGroupMagazine(
                groupMagazineModel,
                {
                    _id: magazineId,
                    group: groupId,
                    sections: []


                }
            )
            const sectionToAdd: SectionRequest = {
                title: "Section 1",
                isFatherSection: false
            }


            await expect(magazineService.addNewMagazineSection(
                group.members[0].toString(),
                magazineId.toString(),
                sectionToAdd,
                groupId.toString()
            )).rejects.toThrow(UnauthorizedException);


            const magazineSaved: any = await groupMagazineModel.findById(magazineId)

            expect(magazineSaved).toBeDefined();
            expect(magazineSaved!.sections.length).toBe(0);


        })

        it('USER Magazine-> type of user : Magazine creator - Add new magazine section, should return work success', async () => {

            const magazine = await insertUserMagazine(
                userMagazineModel,
                {
                    _id: magazineId,
                    user: userId,
                    sections: []
                }
            )
            const sectionToAdd: SectionRequest = {
                title: "Section 1",
                isFatherSection: false
            }


            await magazineService.addNewMagazineSection(
                magazine.user.toString(),
                magazineId.toString(),
                sectionToAdd,
            )

            const magazineSaved: any = await userMagazineModel.findById(magazineId).populate('sections');

            expect(magazineSaved).toBeDefined();
            expect(magazineSaved!.sections.length).toBe(1);
            expect(magazineSaved!.sections[0].title).toBe(sectionToAdd.title);
            expect(magazineSaved!.sections[0].isFatherSection).toBe(false);
            expect(magazineSaved!.user).toEqual(magazine.user);


        })

        it('USER Magazine-> type of user : Unauthorized user - Add new magazine section, should return permission error', async () => {
            const userWithoutPermission = new Types.ObjectId("66c49508e80296e90ec637d8")
            await insertUserMagazine(
                userMagazineModel,
                {
                    _id: magazineId,
                    user: userId,
                    sections: []
                }
            )
            const sectionToAdd: SectionRequest = {
                title: "Section 1",
                isFatherSection: false
            }


            await expect(magazineService.addNewMagazineSection(
                userWithoutPermission.toString(),
                magazineId.toString(),
                sectionToAdd,
            )).rejects.toThrow(UnauthorizedException);

            const magazineSaved: any = await userMagazineModel.findById(magazineId).populate('sections');
            expect(magazineSaved).toBeDefined();
            expect(magazineSaved!.sections.length).toBe(0);

        })


    });


    describe('Add post in Magazine', () => {

        const postId = new Types.ObjectId("66c49508e80296e90ec637d2")

        it('Group Magazine-> type of user : Admin group - Add post in magazine, should return work success', async () => {
            const sectionId = new Types.ObjectId("66c49508e80296e90ec637d8")
            const group = await createGroup({
                _id: groupId,
                admins: [admins[0]],
                magazines: [magazineId],
            }, groupModel);


            await insertSection(
                magazineSection,
                {
                    _id: sectionId,
                    title: "Section 1",
                    isFatherSection: false
                })

            await insertGroupMagazine(
                groupMagazineModel,
                {
                    _id: magazineId,
                    group: groupId,
                    sections: [sectionId]
                }
            )


            await magazineService.addPostInGroupMagazine(
                postId.toString(),
                magazineId.toString(),
                group.admins[0].toString(),
                sectionId.toString(),
            )

            const magazineSectionSaved: any = await magazineSection.findById(sectionId)

            expect(magazineSectionSaved).toBeDefined();
            expect(magazineSectionSaved!.posts.length).toBe(1);
            expect(magazineSectionSaved!.posts[0]).toEqual(postId);



        })


        it('Group Magazine-> type of user : Creator of group - Add post in magazine, should return work success', async () => {
            const sectionId = new Types.ObjectId("66c49518e45296e90ec637d8")
            const group = await createGroup({
                _id: groupId,
                admins: [],
                creator: admins[0],
                magazines: [magazineId],
            }, groupModel);


            await insertSection(
                magazineSection,
                {
                    _id: sectionId,
                    title: "Section 1",
                    isFatherSection: false
                })

            await insertGroupMagazine(
                groupMagazineModel,
                {
                    _id: magazineId,
                    group: groupId,
                    sections: [sectionId]
                }
            )


            await magazineService.addPostInGroupMagazine(
                postId.toString(),
                magazineId.toString(),
                group.creator.toString(),
                sectionId.toString(),
            )

            const magazineSectionSaved: any = await magazineSection.findById(sectionId)

            expect(magazineSectionSaved).toBeDefined();
            expect(magazineSectionSaved!.posts.length).toBe(1);
            expect(magazineSectionSaved!.posts[0]).toEqual(postId);



        })


        it('Group Magazine-> type of user : Allowed collaborator of Magazine - Add post in magazine, should return work success', async () => {
            const sectionId = new Types.ObjectId("66c49508e45296e90ec637d1")
            await createGroup({
                _id: groupId,
            }, groupModel);


            await insertSection(
                magazineSection,
                {
                    _id: sectionId,
                    title: "Section 1",
                    isFatherSection: false
                })

            const groupMagazine = await insertGroupMagazine(
                groupMagazineModel,
                {
                    _id: magazineId,
                    group: groupId,
                    sections: [sectionId],
                    allowedCollaborators: [members[0]]
                }
            )

            await magazineService.addPostInGroupMagazine(
                postId.toString(),
                magazineId.toString(),
                groupMagazine.allowedCollaborators![0].toString(),
                sectionId.toString(),
            )

            const magazineSectionSaved: any = await magazineSection.findById(sectionId)


            expect(magazineSectionSaved).toBeDefined();
            expect(magazineSectionSaved!.posts.length).toBe(1);
            expect(magazineSectionSaved!.posts[0]).toEqual(postId)



        })


        it('Group Magazine-> type of user : Member of group - Add post in magazine, should return permission error', async () => {
            const sectionId = new Types.ObjectId("66d49508f45296e90ec637d8")
            const group = await createGroup({
                _id: groupId,
                members: [members[0]],
                magazines: [magazineId],
            }, groupModel);


            await insertSection(
                magazineSection,
                {
                    _id: sectionId,
                    title: "Section 1",
                    isFatherSection: false
                })

            await insertGroupMagazine(
                groupMagazineModel,
                {
                    _id: magazineId,
                    group: groupId,
                    sections: [sectionId]
                }
            )


            await expect(magazineService.addPostInGroupMagazine(
                postId.toString(),
                magazineId.toString(),
                group.members[0].toString(),
                sectionId.toString(),
            )).rejects.toThrow(UnauthorizedException)

            const magazineSectionSaved: any = await magazineSection.findById(sectionId)

            expect(magazineSectionSaved).toBeDefined();
            expect(magazineSectionSaved!.posts.length).toBe(0);




        })


        it('User Magazine-> type of user : Creator of Magazine - Add post in magazine, should return work success', async () => {
            const sectionId = new Types.ObjectId("66c49508e45096e90ec637d8")

            await insertSection(
                magazineSection,
                {
                    _id: sectionId,
                    title: "Section 1",
                    isFatherSection: false
                })

            const userMagazine = await insertUserMagazine(
                userMagazineModel,
                {
                    _id: magazineId,
                    user: admins[0],
                }
            )


            await magazineService.addPostInUserMagazine(
                postId.toString(),
                magazineId.toString(),
                userMagazine.user!.toString(),
                sectionId.toString(),
            )


            const magazineSectionSaved: any = await magazineSection.findById(sectionId)

            expect(magazineSectionSaved).toBeDefined();
            expect(magazineSectionSaved!.posts.length).toBe(1);
            expect(magazineSectionSaved!.posts[0]).toEqual(postId);
        })


        it('User Magazine-> type of user : Collaborator of Magazine - Add post in magazine, should return work success', async () => {
            const sectionId = new Types.ObjectId("66c49508e45296e90ec636d8")

            await insertSection(
                magazineSection,
                {
                    _id: sectionId,
                    title: "Section 1",
                    isFatherSection: false
                })

            const userMagazine = await insertUserMagazine(
                userMagazineModel,
                {
                    _id: magazineId,
                    user: admins[1],
                    collaborators: [members[0]],
                }
            )


            await magazineService.addPostInUserMagazine(
                postId.toString(),
                magazineId.toString(),
                userMagazine.collaborators![0].toString(),
                sectionId.toString(),
            )


            const magazineSectionSaved: any = await magazineSection.findById(sectionId)

            expect(magazineSectionSaved).toBeDefined();
            expect(magazineSectionSaved!.posts.length).toBe(1);
            expect(magazineSectionSaved!.posts[0]).toEqual(postId);




        })


        it('User Magazine-> type of user : Unauthorized user - Add post in magazine, should return work success', async () => {
            const sectionId = new Types.ObjectId("66d49508e45296e90ec635d1")
            const unauthorizedUserId = new Types.ObjectId("66c49508e45296e90ec634d8")

            await insertSection(
                magazineSection,
                {
                    _id: sectionId,
                    title: "Section 1",
                    isFatherSection: false
                })

            await insertUserMagazine(
                userMagazineModel,
                {
                    _id: magazineId,
                    user: admins[1],
                    collaborators: [members[0]],
                }
            )


            await expect(magazineService.addPostInUserMagazine(
                postId.toString(),
                magazineId.toString(),
                unauthorizedUserId.toString(),
                sectionId.toString(),
            )).rejects.toThrow(UnauthorizedException)


            const magazineSectionSaved: any = await magazineSection.findById(sectionId)

            expect(magazineSectionSaved).toBeDefined();
            expect(magazineSectionSaved!.posts.length).toBe(0);




        })





    })










});