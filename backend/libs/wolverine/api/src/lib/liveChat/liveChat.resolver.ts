import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { LiveChatService } from './liveChat.service';
import { Message } from './entities/message.entity';
import { LiveChat } from './entities/liveChat.entity';
import { LoggerService } from '@backend/logger';
import { Role, Roles } from '@backend/infrastructure';
import { GraphQLError } from 'graphql/index';
import { User } from '../user/entities/user.entity';
import { InjectPubSubToken } from './providers/pubSub.provider';
import { UserService } from '../user/user.service';
import { SendMessageInput } from './dto/sendMessage.input';
import { GraphQLPositiveInt, GraphQLUUID } from 'graphql-scalars';

@Resolver(() => LiveChat)
export class LiveChatResolver {
  constructor(
    @InjectPubSubToken() private pubSub: PubSub,
    private readonly liveChatService: LiveChatService,
    private readonly logger: LoggerService,
    private readonly userService: UserService,
  ) {}
  @Subscription(() => Message, {
    nullable: true,
    resolve: (value) => value.newMessage,
  })
  newMessage(
    @Args('liveChatId', { type: () => GraphQLPositiveInt }) liveChatId: number,
  ) {
    return this.pubSub.asyncIterator(`newMessage.${liveChatId}`);
  }

  @Subscription(() => GraphQLPositiveInt, {
    nullable: true,
    resolve: (value) => value.id,
  })
  userExitLiveChat(
    @Args('liveChatId', { type: () => GraphQLPositiveInt }) liveChatId: number,
  ) {
    return this.pubSub.asyncIterator(`userExitLiveChat.${liveChatId}`);
  }

  @Subscription(() => User, {
    nullable: true,
    resolve: (value) => value.user,
    filter: (payload, variables) => {
      return variables.userId !== payload.typingUserId;
    },
  })
  userStartedTyping(
    @Args('liveChatId', { type: () => GraphQLPositiveInt }) liveChatId: number,
  ) {
    return this.pubSub.asyncIterator(`userStartedTyping.${liveChatId}`);
  }

  @Subscription(() => User, {
    nullable: true,
    resolve: (value) => value.user,
    filter: (payload, variables) => {
      return variables.userId !== payload.typingUserId;
    },
  })
  userStoppedTyping(
    @Args('liveChatId', { type: () => GraphQLPositiveInt }) liveChatId: number,
  ) {
    return this.pubSub.asyncIterator(`userStoppedTyping.${liveChatId}`);
  }

  @Subscription(() => User, {
    nullable: true,
    resolve: (value) =>
      value.liveChat.users.find((user: User) => user.id === value.userId),
  })
  padullaEnteredLiveChat(
    @Args('liveChatId', { type: () => GraphQLPositiveInt }) liveChatId: number,
  ) {
    return this.pubSub.asyncIterator(`padullaEnteredLiveChat.${liveChatId}`);
  }

  @Roles([Role.Padulla, Role.Premium, Role.User])
  @Mutation(() => User)
  async userStartedTypingMutation(
    @Args('liveChatId', { type: () => GraphQLPositiveInt }) liveChatId: number,
    @Args('userId', { type: () => GraphQLUUID }) userId: string,
  ) {
    const user = await this.userService.findOne(userId);

    await this.pubSub.publish(`userStartedTyping.${liveChatId}`, {
      user,
      typingUserId: userId,
    });
    return user;
  }

  @Roles([Role.Padulla, Role.Premium, Role.User])
  @Mutation(() => User)
  async userStoppedTypingMutation(
    @Args('liveChatId', { type: () => GraphQLPositiveInt }) liveChatId: number,
    @Args('userId', { type: () => GraphQLUUID }) userId: string,
  ) {
    const user = await this.userService.findOne(userId);

    await this.pubSub.publish(`userStoppedTyping.${liveChatId}`, {
      user,
      typingUserId: userId,
    });

    return user;
  }

  @Roles([Role.Padulla, Role.Premium, Role.User])
  @Mutation(() => Message)
  async sendMessage(
    @Args('sendMessageInput') SendMessageInput: SendMessageInput,
  ) {
    const newMessage = await this.liveChatService.sendMessage(SendMessageInput);
    await this.pubSub
      .publish(`newMessage.${SendMessageInput.liveChatId}`, { newMessage })
      .then((res) => {
        this.logger.info('published', res);
      })
      .catch((err) => {
        this.logger.error('err', err);
      });

    return newMessage;
  }

  @Roles([Role.Padulla, Role.Premium, Role.User])
  @Mutation(() => LiveChat)
  async createLiveChat(
    @Args('userId', { type: () => GraphQLUUID }) userId: string,
  ) {
    return this.liveChatService.createLiveChat(userId);
  }

  @Roles([Role.Padulla])
  @Mutation(() => LiveChat)
  async addPadullaToLiveChat(
    @Args('liveChatId', { type: () => GraphQLPositiveInt }) liveChatId: number,
    @Args('userId', { type: () => GraphQLUUID }) userId: string,
  ) {
    const res = await this.liveChatService.addPadullaToLiveChat(
      liveChatId,
      userId,
    );
    await this.pubSub.publish(`padullaEnteredLiveChat.${liveChatId}`, {
      liveChat: res,
      userId,
    });
    return res;
  }

  @Roles([Role.Padulla, Role.Premium, Role.User])
  @Query(() => LiveChat)
  async getLiveChat(
    @Args('liveChatId', { type: () => GraphQLPositiveInt }) liveChatId: number,
  ) {
    return this.liveChatService.getLiveChat(liveChatId);
  }

  @Roles([Role.Padulla, Role.Premium, Role.User])
  @Query(() => [Message])
  async getMessagesForLiveChat(
    @Args('liveChatId', { type: () => GraphQLPositiveInt }) liveChatId: number,
  ) {
    return this.liveChatService.getMessagesForLiveChat(liveChatId);
  }

  @Roles([Role.Padulla, Role.Premium, Role.User])
  @Mutation(() => LiveChat)
  async deleteLiveChat(
    @Args('liveChatId', { type: () => GraphQLPositiveInt }) liveChatId: number,
  ) {
    await this.pubSub.publish(`userExitLiveChat.${liveChatId}`, {
      id: liveChatId,
    });
    return this.liveChatService.deleteLiveChat(liveChatId);
  }

  @Roles([Role.Padulla, Role.Premium, Role.User])
  @Mutation(() => Boolean)
  async enterLiveChat(
    @Args('liveChatId', { type: () => GraphQLPositiveInt }) liveChatId: number,
    @Args('userId', { type: () => GraphQLUUID }) userId: string,
  ): Promise<boolean> {
    await this.pubSub
      .publish(`userInLiveCha: ${liveChatId}`, {
        userId,
        liveChatId,
      })
      .catch((err) => {
        this.logger.error('pubSub error', err);
        throw new GraphQLError(`pubSub error: ${err}`, {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
          },
        });
      });
    return true;
  }

  @Roles([Role.Padulla, Role.Premium, Role.User])
  @Mutation(() => [Message])
  async setMessagesAsRead(@Args('liveChatId', { type: () => GraphQLPositiveInt }) liveChatId: number) {
    return await this.liveChatService.setMessagesAsRead(liveChatId);
  }

  @Roles([Role.Padulla])
  @Mutation(() => Message)
  async setMessageAsUnread(@Args('liveChatId', { type: () => GraphQLPositiveInt }) liveChatId: number) {
    return await this.liveChatService.setMessageAsUnread(liveChatId);
  }

  @Roles([Role.Padulla])
  @Query(() => [LiveChat])
  async getLiveChatsForPadulla(
    @Args('userId', { type: () => GraphQLUUID }) userId: string,
  ) {
    return this.liveChatService.getLiveChatsForPadulla(userId);
  }
}
