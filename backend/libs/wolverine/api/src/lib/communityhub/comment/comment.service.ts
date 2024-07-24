import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentInput, UpdateCommentInput } from '../../index';
import { LoggerService } from '@backend/logger';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ErrorService } from '../../shared/error/error.service';
import { Comment } from '@prisma/client';

@Injectable()
export class CommentService {
  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly error: ErrorService,
  ) {}
  async createComment(input: CreateCommentInput): Promise<Comment> {
    try {
      this.logger.info(`Creating a new comment on post: ${input.postId}.`);
      const result = await this.prisma.comment.create({
        data: {
          content: input.content,
          userId: input.userId,
          postId: input.postId,
          createdAt: new Date(),
        },
      });
      this.logger.info(`Comment created successfully with id: ${result.id}.`);
      return result;
    } catch (e) {
      this.error.handleError(new InternalServerErrorException(e));
    }
  }

  async updateComment(input: UpdateCommentInput): Promise<Comment> {
    try {
      this.logger.info(`Updating comment with id: ${input.id}`);
      const result = await this.prisma.comment.update({
        where: { id: input.id },
        data: { content: input.content },
      });
      this.logger.info(`Comment with id: ${input.id} updated successfully`);
      return result;
    } catch (e) {
      this.error.handleError(new NotFoundException(e));
    }
  }

  async deleteComment(id: number, userId: string): Promise<Comment> {
    try {
      this.logger.info(`Deleting comment with id: ${id}.`);
      const result = await this.prisma.comment.delete({
        where: { id, userId },
      });
      this.logger.info(`Comment deleted successfully with id: ${id}.`);
      return result;
    } catch (e) {
      this.error.handleError(new NotFoundException(e));
    }
  }

  async getComments(postId: string): Promise<Comment[]> {
    try {
      this.logger.info(`fetching all comments from post with id: ${postId}.`);
      const result = await this.prisma.comment.findMany({
        where: { postId },
        include: {
          user: {
            select: {
              profilePic: true,
              username: true,
            },
          },
        },
      });
      this.logger.info(`Successfully retrieved ${result.length} comments.`);
      return result;
    } catch (e) {
      this.error.handleError(new NotFoundException(e));
    }
  }
}
