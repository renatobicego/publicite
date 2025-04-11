import { Connection, ObjectId, Types } from 'mongoose';
import * as request from 'supertest';
import startServerForE2ETest from '../../../test/getStartede2e-test';
import createTestingUser_e2e, {
  UserType_test,
} from '../../../test/functions_e2e_testing/create.user';
import { UserRelationType_testing } from '../../../test/notifications/model/user.notification.test.model';

let dbConnection: Connection;
let httpServer: any;
let app: any;
const token = process.env.TEST_TOKEN as string;
describe('User Find E2E Tests', () => {
  beforeAll(async () => {
    const { databaseConnection, application, server } =
      await startServerForE2ETest();
    dbConnection = databaseConnection;
    app = application;
    httpServer = server;
  });

  afterEach(async () => {
    await dbConnection.collection('users').deleteMany({});
    await dbConnection.collection('userrelations').deleteMany({});
    await dbConnection.collection('posts').deleteMany({});
    await dbConnection.collection('Notifications').deleteMany({});
    await dbConnection.collection('magazines').deleteMany({});
    await dbConnection.collection('magazinesections').deleteMany({});
  });

  afterAll(async () => {
    await dbConnection.close();
    await app.close();
  });

  describe('findUserById', () => {
    const FIND_USER_BY_ID_QUERY = `
      query FindUserById($id: String!) {
        findUserById(_id: $id) {
          _id
          businessName
          contact {
            _id
            facebook
            instagram
            phone
            website
            x
          }
          countryRegion
          description
          lastName
          name
          posts {
            _id
            description
            frequencyPrice
            petitionType
            postType
            price
            title
            toPrice
            imagesUrls
            endDate
            reviews {
              _id
              rating
            }
            isActive
          }
          profilePhotoUrl
          userType
          username
          board {
            _id
            annotations
            color
            keywords
            user
            visibility
          }
          groups {
            _id
            members
            admins
            name
            profilePhotoUrl
          }
          magazines {
            _id
            name
            sections {
              posts {
                _id
                imagesUrls
              }
            }
          }
          userRelations {
            _id
            typeRelationA
            typeRelationB
            userA {
              _id
              businessName
              lastName
              name
              profilePhotoUrl
              userType
              username
            }
            userB {
              _id
              businessName
              username
              userType
              profilePhotoUrl
              name
              lastName
            }
          }
          isFriendRequestPending
          isAcceptRequestFriend {
            notification_id
            type
            value
            userRelationId
            toRelationShipChange
            newRelation
          }
        }
      }
    `;

    it('should return user when found and authenticated, same user', async () => {
      // Create a test user
      const testUser = await createTestingUser_e2e(
        {
          _id: new Types.ObjectId('67420686b02bdd1f9f0ef446'),
          clerkId: '123',
          email: 'email',
          username: 'username',
          name: 'name',
          lastName: 'lastName',
          finder: 'finder',
          profilePhotoUrl: 'profilePhotoUrl',
          userType: UserType_test.Person,
          groups: [],
        },
        dbConnection,
      );

      const response = await request(httpServer)
        .post('/graphql')
        .set('Authorization', token)
        .send({
          query: FIND_USER_BY_ID_QUERY,
          variables: {
            id: testUser._id!.toString(),
          },
        });

      console.log('\n=== Same User Profile Response ===');
      console.log('Status:', response.status);
      console.log(
        'User Data:',
        JSON.stringify(response.body.data.findUserById, null, 2),
      );
      console.log('================================\n');

      expect(response.status).toBe(200);
      expect(response.body.data.findUserById).toBeDefined();

      // Basic fields
      expect(response.body.data.findUserById._id).toBe(
        testUser._id!.toString(),
      );
      expect(response.body.data.findUserById.username).toBe(testUser.username);
      expect(response.body.data.findUserById.name).toBe(testUser.name);
      expect(response.body.data.findUserById.lastName).toBe(testUser.lastName);
      expect(response.body.data.findUserById.profilePhotoUrl).toBe(
        testUser.profilePhotoUrl,
      );
      expect(response.body.data.findUserById.userType).toBe(testUser.userType);

      expect(Array.isArray(response.body.data.findUserById.posts)).toBe(true);
      expect(Array.isArray(response.body.data.findUserById.groups)).toBe(true);
      expect(Array.isArray(response.body.data.findUserById.magazines)).toBe(
        true,
      );
      expect(Array.isArray(response.body.data.findUserById.userRelations)).toBe(
        true,
      );

      expect(response.body.data.findUserById.contact).toBeDefined();
      expect(response.body.data.findUserById.board).toBeDefined();
      expect(
        response.body.data.findUserById.isFriendRequestPending,
      ).toBeDefined();
      expect(
        response.body.data.findUserById.isAcceptRequestFriend,
      ).toBeDefined();
    });

    it('should return user when found and authenticated, external user, they are not friends', async () => {
      const testUser = await createTestingUser_e2e(
        {
          _id: new Types.ObjectId('67420686b02bdd1f9f0ef448'),
          clerkId: '123',
          email: 'email',
          username: 'username',
          name: 'name',
          lastName: 'lastName',
          finder: 'finder',
          profilePhotoUrl: 'profilePhotoUrl',
          userType: UserType_test.Person,
          groups: [],
        },
        dbConnection,
      );

      const response = await request(httpServer)
        .post('/graphql')
        .set('Authorization', token)
        .send({
          query: FIND_USER_BY_ID_QUERY,
          variables: {
            id: testUser._id!.toString(),
          },
        });

      console.log('\n=== External User Profile Response ===');
      console.log('Status:', response.status);
      console.log(
        'User Data:',
        JSON.stringify(response.body.data.findUserById, null, 2),
      );
      console.log('====================================\n');

      expect(response.status).toBe(200);
      expect(response.body.data.findUserById).toBeDefined();

      expect(response.body.data.findUserById._id).toBe(
        testUser._id!.toString(),
      );
      expect(response.body.data.findUserById.username).toBe(testUser.username);
      expect(response.body.data.findUserById.name).toBe(testUser.name);
      expect(response.body.data.findUserById.lastName).toBe(testUser.lastName);
      expect(response.body.data.findUserById.profilePhotoUrl).toBe(
        testUser.profilePhotoUrl,
      );
      expect(response.body.data.findUserById.userType).toBe(testUser.userType);

      expect(Array.isArray(response.body.data.findUserById.posts)).toBe(true);
      expect(Array.isArray(response.body.data.findUserById.groups)).toBe(true);
      expect(Array.isArray(response.body.data.findUserById.magazines)).toBe(
        true,
      );
      expect(Array.isArray(response.body.data.findUserById.userRelations)).toBe(
        true,
      );

      expect(response.body.data.findUserById.contact).toBeDefined();
      expect(response.body.data.findUserById.board).toBeDefined();
      expect(
        response.body.data.findUserById.isFriendRequestPending,
      ).toBeDefined();
      expect(
        response.body.data.findUserById.isAcceptRequestFriend,
      ).toBeDefined();
    });

    it('should return user when found and authenticated, external user, they are friends', async () => {
      const relationId = new Types.ObjectId('67420686b02bdd1f9f0ef451');

      const requestingUser = await createTestingUser_e2e(
        {
          _id: new Types.ObjectId('67420686b02bdd1f9f0ef449'),
          clerkId: '123',
          email: 'requesting@example.com',
          username: 'requestingUser',
          name: 'Requesting',
          lastName: 'User',
          finder: 'finder1',
          profilePhotoUrl: 'photo1',
          userType: UserType_test.Person,
          groups: [],
          userRelations: [relationId],
        },
        dbConnection,
      );

      const targetUser = await createTestingUser_e2e(
        {
          _id: new Types.ObjectId('67420686b02bdd1f9f0ef450'),
          clerkId: '456',
          email: 'target@example.com',
          username: 'targetUser',
          name: 'Target',
          lastName: 'User',
          finder: 'finder2',
          profilePhotoUrl: 'photo2',
          userType: UserType_test.Person,
          groups: [],
          userRelations: [relationId],
        },
        dbConnection,
      );

      await dbConnection.collection('userrelations').insertOne({
        _id: relationId,
        userA: requestingUser._id,
        userB: targetUser._id,
        typeRelationA: UserRelationType_testing.friends,
        typeRelationB: UserRelationType_testing.friends,
      });

      const response = await request(httpServer)
        .post('/graphql')
        .set('Authorization', token)
        .send({
          query: FIND_USER_BY_ID_QUERY,
          variables: {
            id: targetUser._id!.toString(),
          },
        });

      console.log('\n=== Friend Profile Response ===');
      console.log('Status:', response.status);
      console.log(
        'User Data:',
        JSON.stringify(response.body.data.findUserById, null, 2),
      );
      console.log('============================\n');

      expect(response.status).toBe(200);
      expect(response.body.data.findUserById).toBeDefined();

      expect(response.body.data.findUserById._id).toBe(
        targetUser._id!.toString(),
      );
      expect(response.body.data.findUserById.username).toBe(
        targetUser.username,
      );
      expect(response.body.data.findUserById.name).toBe(targetUser.name);
      expect(response.body.data.findUserById.lastName).toBe(
        targetUser.lastName,
      );
      expect(response.body.data.findUserById.profilePhotoUrl).toBe(
        targetUser.profilePhotoUrl,
      );
      expect(response.body.data.findUserById.userType).toBe(
        targetUser.userType,
      );

      // Verify userRelations contains the friendship
      expect(Array.isArray(response.body.data.findUserById.userRelations)).toBe(
        true,
      );
      expect(
        response.body.data.findUserById.userRelations.length,
      ).toBeGreaterThan(0);

      const userRelation = response.body.data.findUserById.userRelations.find(
        (relation: any) =>
          (relation.userA._id === requestingUser._id!.toString() &&
            relation.userB._id === targetUser._id!.toString()) ||
          (relation.userA._id === targetUser._id!.toString() &&
            relation.userB._id === requestingUser._id!.toString()),
      );

      console.log('\n=== User Relations ===');
      console.log(
        'Found Relations:',
        JSON.stringify(response.body.data.findUserById.userRelations, null, 2),
      );
      console.log('============================\n');

      expect(userRelation).toBeDefined();
      expect(userRelation.typeRelationA).toBe(UserRelationType_testing.friends);
      expect(userRelation.typeRelationB).toBe(UserRelationType_testing.friends);
    });

    it('should return user when found and authenticated, external user, they are topfriends', async () => {
      const relationId = new Types.ObjectId('67420686b02bdd1f9f0ef452');

      const requestingUser = await createTestingUser_e2e(
        {
          _id: new Types.ObjectId('67420686b02bdd1f9f0ef453'),
          clerkId: '789',
          email: 'requesting2@example.com',
          username: 'requestingUser2',
          name: 'Requesting2',
          lastName: 'User2',
          finder: 'finder3',
          profilePhotoUrl: 'photo3',
          userType: UserType_test.Person,
          groups: [],
          userRelations: [relationId],
        },
        dbConnection,
      );

      const targetUser = await createTestingUser_e2e(
        {
          _id: new Types.ObjectId('67420686b02bdd1f9f0ef454'),
          clerkId: '012',
          email: 'target2@example.com',
          username: 'targetUser2',
          name: 'Target2',
          lastName: 'User2',
          finder: 'finder4',
          profilePhotoUrl: 'photo4',
          userType: UserType_test.Person,
          groups: [],
          userRelations: [relationId],
        },
        dbConnection,
      );

      await dbConnection.collection('userrelations').insertOne({
        _id: relationId,
        userA: requestingUser._id,
        userB: targetUser._id,
        typeRelationA: UserRelationType_testing.topfriends,
        typeRelationB: UserRelationType_testing.topfriends,
      });

      const response = await request(httpServer)
        .post('/graphql')
        .set('Authorization', token)
        .send({
          query: FIND_USER_BY_ID_QUERY,
          variables: {
            id: targetUser._id!.toString(),
          },
        });

      console.log('\n=== TopFriends Profile Response ===');
      console.log('Status:', response.status);
      console.log(
        'User Data:',
        JSON.stringify(response.body.data.findUserById, null, 2),
      );
      console.log('============================\n');

      expect(response.status).toBe(200);
      expect(response.body.data.findUserById).toBeDefined();

      // Verify basic user data
      expect(response.body.data.findUserById._id).toBe(
        targetUser._id!.toString(),
      );
      expect(response.body.data.findUserById.username).toBe(
        targetUser.username,
      );

      // Verify userRelations contains the topfriends relation
      expect(Array.isArray(response.body.data.findUserById.userRelations)).toBe(
        true,
      );
      expect(
        response.body.data.findUserById.userRelations.length,
      ).toBeGreaterThan(0);

      const userRelation = response.body.data.findUserById.userRelations.find(
        (relation: any) =>
          (relation.userA._id === requestingUser._id!.toString() &&
            relation.userB._id === targetUser._id!.toString()) ||
          (relation.userA._id === targetUser._id!.toString() &&
            relation.userB._id === requestingUser._id!.toString()),
      );

      expect(userRelation).toBeDefined();
      expect(userRelation.typeRelationA).toBe(
        UserRelationType_testing.topfriends,
      );
      expect(userRelation.typeRelationB).toBe(
        UserRelationType_testing.topfriends,
      );
    });


    it('should not return private posts and magazines for non-friends', async () => {
      const targetUser = await createTestingUser_e2e(
        {
          _id: new Types.ObjectId('67420686b02bdd1f9f0ef466'),
          clerkId: '890',
          email: 'target6@example.com',
          username: 'targetUser6',
          name: 'Target6',
          lastName: 'User6',
          finder: 'finder10',
          profilePhotoUrl: 'photo10',
          userType: UserType_test.Person,
          groups: [],
        },
        dbConnection,
      );

      // Create a private post
      const postId = new Types.ObjectId('67420686b02bdd1f9f0ef467');
      await dbConnection.collection('posts').insertOne({
        _id: postId,
        author: targetUser._id,
        visibility: { post: 'friends', socialMedia: 'public' },
        isActive: true,
        title: 'Private Post',
        description: 'This is a private post',
      });

      // Create a private magazine
      const magazineId = new Types.ObjectId('67420686b02bdd1f9f0ef468');
      const sectionId = new Types.ObjectId('67420686b02bdd1f9f0ef469');

      await dbConnection.collection('magazinesections').insertOne({
        _id: sectionId,
        posts: [postId],
        isFatherSection: true,
      });

      await dbConnection.collection('magazines').insertOne({
        _id: magazineId,
        sections: [sectionId],
        visibility: 'friends',
        user: targetUser._id,
        kind: 'UserMagazine',
        ownerType: 'User',
      });

      const response = await request(httpServer)
        .post('/graphql')
        .set('Authorization', token)
        .send({
          query: FIND_USER_BY_ID_QUERY,
          variables: {
            id: targetUser._id!.toString(),
          },
        });

      console.log('\n=== Private Content Response ===');
      console.log('Status:', response.status);
      console.log(
        'User Data:',
        JSON.stringify(response.body.data.findUserById, null, 2),
      );
      console.log('============================\n');

      expect(response.status).toBe(200);
      expect(response.body.data.findUserById).toBeDefined();

      // Verify private content is not visible
      expect(response.body.data.findUserById.posts.length).toBe(0);
      expect(response.body.data.findUserById.magazines.length).toBe(0);
    });
  });
});

