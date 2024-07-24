import { ObjectType, Field, GraphQLISODateTime } from '@nestjs/graphql';
import { GraphQLString } from 'graphql/type';
import { GraphQLUUID } from 'graphql-scalars';
import { Like, Comment, CommunityHubUser } from '../../../index';
import { PostsFilter } from '../dto/posts.filter.input';
import { Prisma } from '@prisma/client';

@ObjectType()
export class Post {
  @Field(() => GraphQLUUID)
  id!: string;

  @Field(() => CommunityHubUser)
  user!: CommunityHubUser;

  @Field(() => GraphQLString)
  content!: string;

  @Field(() => [Comment], { nullable: true })
  comments?: Comment[];

  @Field(() => [Like], { nullable: true })
  likes?: Like[];

  @Field(() => GraphQLUUID)
  userId!: string;

  @Field(() => GraphQLString, { nullable: true })
  imageUrl?: string;

  @Field(() => Boolean)
  isAnonymous!: boolean;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  static buildFilter(filter: PostsFilter): Prisma.PostWhereInput {
    if (!filter) return {};
    return {
      ...(filter.ids?.length && { id: { in: filter.ids } }),
      ...(filter.usernames?.length && {
        user: {
          username: {
            in: filter.usernames,
          },
        },
      }),
    };
  }
}
