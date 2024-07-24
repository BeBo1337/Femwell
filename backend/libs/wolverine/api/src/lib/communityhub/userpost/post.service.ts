import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostInput, UpdatePostInput } from '../../index';
import { LoggerService } from '@backend/logger';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ErrorService } from '../../shared/error/error.service';
import { Post } from '@prisma/client';
import { wolverineConfig } from '../../config/wolverine.config';
import { ConfigType } from '@nestjs/config';
import { PostsFilter } from './dto/posts.filter.input';
import { Post as PostModel } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly error: ErrorService,
    @Inject(wolverineConfig.KEY)
    private readonly Cfg: ConfigType<typeof wolverineConfig>,
  ) {}
  async createPost(input: CreatePostInput): Promise<Post> {
    try {
      this.logger.info(`Creating a new post for user id: ${input.id}.`);
      const result = await this.prisma.post.create({
        data: {
          id: input.id,
          content: input.content,
          userId: input.userId,
          isAnonymous: input.isAnonymous,
          imageUrl: input.imageUrl,
          createdAt: new Date(),
        },
      });
      this.logger.info(`Post created successfully with id: ${result.id}.`);
      return result;
    } catch (e) {
      this.error.handleError(new InternalServerErrorException(e));
    }
  }

  async updatePost(input: UpdatePostInput): Promise<Post> {
    try {
      this.logger.info(`Updating post with id: ${input.id}.`);
      const imageUrl = input.deleteImage ? null : input.imageUrl;
      const result = await this.prisma.post.update({
        where: { id: input.id, userId: input.userId },
        data: {
          content: input.content,
          imageUrl,
        },
      });
      this.logger.info(`Post with id: ${input.id} updated successfully`);
      return result;
    } catch (e) {
      this.error.handleError(new InternalServerErrorException(e));
    }
  }

  async deletePost(id: string): Promise<Post> {
    try {
      this.logger.info(`Deleting post with id: ${id}.`);
      const result = await this.prisma.post.delete({ where: { id } });
      this.logger.info(`Post deleted successfully with id: ${id}.`);
      return result;
    } catch (e) {
      this.error.handleError(new NotFoundException(e));
    }
  }

  async getPosts(filter: PostsFilter): Promise<Post[]> {
    try {
      this.logger.info('Fetching all posts.');
      const where = PostModel.buildFilter(filter);
      const result = await this.prisma.post.findMany({
        where,
        orderBy: {
          createdAt: 'desc', // Sort by createdAt in descending order fot the most recent posts
        },
        take: this.Cfg.postLimit, // Limit the result to 50 posts
        include: {
          comments: {
            include: {
              user: {
                select: {
                  username: true, // Only select the username and profilePic fields from the related user
                  profilePic: true,
                },
              },
            },
          },
          likes: true,
          user: {
            select: {
              username: true, // Only select the username and profilePic fields from the related user
              profilePic: true,
            },
          },
        },
      });
      this.logger.info('Posts fetched successfully.');
      return result;
    } catch (e) {
      this.error.handleError(new InternalServerErrorException(e));
    }
  }
}
