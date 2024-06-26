import { Field, InputType } from '@nestjs/graphql';
import { GraphQLUUID } from 'graphql-scalars';
import { GraphQLString } from 'graphql/type';

@InputType()
export class UpdatePostInput {
  @Field(() => GraphQLUUID)
  id!: string;

  @Field(() => GraphQLString)
  content!: string;

  @Field(() => GraphQLUUID)
  userId!: string;

  @Field(() => GraphQLString)
  imageUrl?: string;

  @Field(() => Boolean)
  deleteImage?: boolean;
}
