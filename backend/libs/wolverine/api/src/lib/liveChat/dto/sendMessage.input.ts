import { InputType, Field } from '@nestjs/graphql';
import { GraphQLString } from 'graphql/type';
import { GraphQLPositiveInt, GraphQLUUID } from 'graphql-scalars';

@InputType()
export class SendMessageInput {
  @Field(() => GraphQLUUID)
  userId!: string;

  @Field(() => GraphQLPositiveInt, { nullable: true })
  liveChatId!: number;

  @Field(() => GraphQLString)
  content!: string;

  @Field(() => Boolean, { nullable: true })
  isPadullaSent?: boolean
}
