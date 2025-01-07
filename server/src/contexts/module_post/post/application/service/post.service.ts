import { Inject } from '@nestjs/common';
import { Connection, ObjectId } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';


import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { UserServiceInterface } from 'src/contexts/module_user/user/domain/service/user.service.interface';
import { PostUpdateDto } from '../../domain/entity/dto/post.update.dto';
import { PostRepositoryInterface } from '../../domain/repository/post.repository.interface';
import { PostServiceInterface } from '../../domain/service/post.service.interface';
import { PostRequest } from '../../domain/entity/models_graphql/HTTP-REQUEST/post.request';
import { PostFactory } from '../post-factory/post.factory';
import { PostType } from '../../domain/entity/enum/post-type.enum';
import { UserLocation } from '../../domain/entity/models_graphql/HTTP-REQUEST/post.location.request';
import { removeAccents_removeEmojisAndToLowerCase } from '../../domain/utils/normalice.data';
import { checkStopWordsAndReturnSearchQuery, SearchType } from 'src/contexts/module_shared/utils/functions/checkStopWordsAndReturnSearchQuery';
import { toPairs } from 'lodash';


interface UserRelation {
  userA: string;
  userB: string;
  typeRelationA: string;
  typeRelationB: string;
}

export class PostService implements PostServiceInterface {
  constructor(
    @Inject('PostRepositoryInterface')
    private readonly postRepository: PostRepositoryInterface,
    @InjectConnection() private readonly connection: Connection,
    private readonly logger: MyLoggerService,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
  ) { }



  async create(post: PostRequest): Promise<any> {
    const postType = post.postType.toLowerCase();
    if (!postType) throw new Error('Post type is required');
    const postFactory = PostFactory.getInstance(this.logger);
    const postMapped = postFactory.createPost(postType as PostType, post);

    const session = await this.connection.startSession();
    let newPostId: String;
    try {
      const newPostIdId = await session.withTransaction(async () => {

        //Post to save
        newPostId = await this.postRepository.create(postMapped, {
          session,
        });
        if (!newPostId) {
          throw new Error('Error al crear el post');
        }

        //Post to save in user
        await this.userService.saveNewPostInUser(newPostId, post.author, {
          session,
        });
        return newPostId;
      });

      //Todo ok
      await session.commitTransaction();

      return {
        _id: newPostIdId,
      };
    } catch (error: any) {
      throw error;
    } finally {
      session.endSession();
    }
  }



  async deletePostById(id: string): Promise<void> {
    try {
      this.logger.log('Deleting post with id: ' + id);
      await this.postRepository.deletePostById(id);
    } catch (error: any) {
      this.logger.log('An error was ocurred deleting a post with id: ' + id);
      throw error;
    }
  }


  async findMatchPost(postType: string, searchTerm: string): Promise<void> {
    try {
      const termsWithOutAccentsAndEmojis = removeAccents_removeEmojisAndToLowerCase(searchTerm);
      const searchTermNormalized = checkStopWordsAndReturnSearchQuery(termsWithOutAccentsAndEmojis, SearchType.post)
      if (searchTermNormalized === null) return
      return await this.postRepository.findMatchPost(postType, searchTermNormalized);
    } catch (error: any) {
      throw error;
    }
  }

  async findAllPostByPostType(
    page: number,
    limit: number,
    postType: string,
    userLocation: UserLocation,
    searchTerm?: string,
  ): Promise<any> {
    try {
      return await this.postRepository.findAllPostByPostType(
        page,
        limit,
        postType,
        userLocation,
        searchTerm,
      );
    } catch (error: any) {
      throw error;
    }
  }


  async findPostsByAuthorId(id: string): Promise<any> {
    try {
      this.logger.log('Finding posts by author id: ' + id);
      return await this.postRepository.findPostsByAuthorId(id);
    } catch (error: any) {
      this.logger.error(
        'An error was ocurred finding posts by author id: ' + id,
      );
      throw error;
    }
  }
  async findPostById(id: string): Promise<void> {
    try {
      this.logger.log('Finding posts by  id: ' + id);
      return await this.postRepository.findPostById(id);
    } catch (error: any) {
      this.logger.error(
        'An error was ocurred finding posts by author id: ' + id,
      );
      throw error;
    }
  }


  async findFriendPosts(postType: string, userRequestId: string, page: number, limit: number, searchTerm: string): Promise<void> {
    try {

      const relationMap: Map<string, String[]> = await this.makeUserMapRelation(userRequestId)
      if (!relationMap) return

      return await this.postRepository.findFriendPosts(postType, userRequestId, relationMap, page, limit, searchTerm)

    } catch (error: any) {
      throw error;
    }
  }


  async makeUserMapRelation(userRequestId: string): Promise<any> {
    const userRelation = await this.userService.getRelationsFromUserByUserId(userRequestId)
    if (!userRelation) return
    const relationMap = new Map<string, String[]>()
    const TOPFRIENDS = 'topfriends';
    const CONTACTS = 'contacts';
    const FRIENDS = 'friends';

    /*
    1. Obtenemos las relaciones del usuario 
    2. usamos el forEch que lo que hace es, setear el map ID DEL USUARIO AMIGO  por un lado y el tipo de relacion
    3. Con la jerarquizacion de las relaciones deberiamos setear nuevos lugares en el map con el tipo de relacion que buscamos 



    CONSIDERACIONES:: 
    Podemos agregar un map para saber si funciona mas rapido que el if, ver la opcion que sea mas optima para este caso


      public = 'public',
      registered = 'registered',
      contacts = 'contacts',
      friends = 'friends',
      topfriends = 'topfriends',


    
    */


    userRelation.forEach((relation: UserRelation) => {
      const relationArray: String[] = [];
      const friendId = relation.userA.toString() === userRequestId
        ? relation.userB.toString()
        : relation.userA.toString();

      relationArray.push(relation.typeRelationA);

      if (relation.typeRelationA === TOPFRIENDS) {
        relationArray.push(CONTACTS)
        relationArray.push(FRIENDS)
      } else if (relation.typeRelationA === FRIENDS) {
        relationArray.push(CONTACTS)
      }

      relationMap.set(friendId, relationArray);
    });


    return relationMap;

  }


  async makeReactionSchemaAndSetReactionToPost(postId: string, reaction: { user: string, reaction: string }, session: any): Promise<void> {
    try {
      this.logger.log('Setting reactions to posts id: ' + postId);
      return await this.postRepository.makeReactionSchemaAndSetReactionToPost(postId, reaction, session);
    } catch (error: any) {
      this.logger.error('An error was ocurred setting reactions to posts id: ' + postId);
      throw error;
    }
  }

  async updatePostById(
    postUpdate: PostUpdateDto,
    id: string,
    postType: string,
  ): Promise<any> {
    try {
      return await this.postRepository.updatePostById(postUpdate, id, postType);
    } catch (error: any) {
      throw error;
    }
  }

  async updateEndDateFromPostById(postId: string, userRequestId: string, newDate: Date): Promise<void> {
    try {
      this.logger.log('Updating end date from post with id: ' + postId);
      return await this.postRepository.updateEndDateFromPostById(postId, userRequestId, newDate);
    } catch (error: any) {
      throw error;
    }
  }


  async removeReactionFromPost(userRequestId: string, _id: string): Promise<any> {
    try {
      this.logger.log('Removing reaction from post with id: ' + _id);
      await this.postRepository.removeReactionFromPost(userRequestId, _id);
    } catch (error: any) {
      this.logger.error('An error was ocurred removing reaction from post with id: ' + _id);
      throw error;
    }
  }




}
