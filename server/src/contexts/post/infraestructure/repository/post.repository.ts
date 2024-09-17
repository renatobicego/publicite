import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../../domain/entity/post.entity';
import { PostRepositoryInterface } from '../../domain/repository/post.repository.interface';
import { ClientSession, Model, ObjectId } from 'mongoose';
import { PostDocument } from '../schemas/post.schema';
import { Inject } from '@nestjs/common';
import { PostRepositoryMapperInterface } from '../../domain/repository/mapper/post.repository.mapper.interface';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';

import { PostLocation } from '../../domain/entity/postLocation.entity';
import { PostLocationDocument } from '../schemas/postLocation.schema';

export class PostRepository implements PostRepositoryInterface {
  constructor(
    @InjectModel('Post')
    private readonly postDocument: Model<PostDocument>,
    @InjectModel('PostLocation')
    private readonly locationDocument: Model<PostLocationDocument>,
    @Inject('PostRepositoryMapperInterface')
    private readonly postMapper: PostRepositoryMapperInterface,
    private readonly logger: MyLoggerService,
  ) {}
  async saveLocation(
    location: PostLocation,
    options?: { session?: ClientSession },
  ): Promise<ObjectId> {
    try {
      this.logger.log('Saving location in repository');
      const postPostedDocument = new this.locationDocument(location);
      const documentSaved = await postPostedDocument.save(options);
      return documentSaved._id as unknown as ObjectId;
    } catch (error: any) {
      this.logger.error('Error creating location REPOSITORY: ' + error);
      throw error;
    }
  }

  async create(
    post: Post,
    locationID: ObjectId,
    options?: { session?: ClientSession },
  ): Promise<Post> {
    try {
      this.logger.log('Saving post in repository');
      const documentToSave = {
        title: post.getTitle,
        author: post.getAuthor,
        postType: post.getPostType,
        description: post.getDescription,
        visibility: post.getVisibility,
        recomendations: post.getRecomendations,
        price: post.getPrice,
        location: locationID,
        category: post.getCategory,
        comments: post.getComments,
        attachedFiles: post.getAttachedFiles,
        createAt: post.getCreateAt,
      };
      const postPostedDocument = new this.postDocument(documentToSave);
      const documetnSaved = await postPostedDocument.save(options);
      return this.postMapper.documentToEntityMapped(documetnSaved);
    } catch (error: any) {
      this.logger.error('Error creating post REPOSITORY: ' + error);
      throw error;
    }
  }
}
