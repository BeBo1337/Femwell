import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { ErrorService } from '../shared/error/error.service';
import { LoggerService } from '@backend/logger';
import { LiveChat, Message } from '@prisma/client';
import { CacheService } from '@backend/infrastructure';
import { SendMessageInput } from './dto/sendMessage.input';

@Injectable()
export class LiveChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly error: ErrorService,
    private readonly cacheService: CacheService,
  ) {}

  async getLiveChat(livechatId: number) {
    try {
      return this.cacheService.wrap(`${livechatId}`, async () => {
        return this.prisma.liveChat.findUniqueOrThrow({
          where: {
            id: livechatId,
          },
          include: {
            users: true,
            messages: true,
          },
        });
      });
    } catch (e) {
      this.error.handleError(new NotFoundException(e));
    }
  }

  async createLiveChat(userId: string): Promise<LiveChat> {
    try {
      this.logger.info(`Trying to create LiveChat for user with id: ${userId}`);
      const liveChat = await this.prisma.liveChat.findFirst({
        where: {
          users: {
            some: {
              id: userId,
            },
          },
        },
        include: {
          users: true,
          messages: true,
        },
      });
      if (liveChat) {
        this.logger.info(`LiveChat already exists: ${liveChat}`);
        return liveChat;
      }
      const createdChat = await this.prisma.liveChat.create({
        data: {
          users: {
            connect: {
              id: userId, // this is the id of the client that request to open the live chat
            },
          },
        },
        include: {
          users: true, // show all users in the liveChat (padulla and client)
        },
      });
      await this.prisma.liveChatUsers.create({
        data: {
          liveChatId: createdChat.id,
          userId: userId,
        },
      });
      this.logger.info(`New LiveChat created: ${createdChat}`);
      await this.cacheService.set(`${createdChat.id}`, createdChat);
      return createdChat;
    } catch (e) {
      this.error.handleError(new InternalServerErrorException(e));
    }
  }

  async addPadullaToLiveChat(
    liveChatId: number,
    padullaId: string,
  ): Promise<LiveChat> {
    try {
      const liveChat = await this.prisma.liveChat.update({
        where: {
          id: liveChatId,
        },
        data: {
          users: {
            connect: {
              id: padullaId,
            },
          },
        },
        include: {
          users: true, // show all users in the liveChat (padulla and client)
          messages: true,
        },
      });
      await this.prisma.liveChatUsers.create({
        data: {
          liveChatId,
          userId: padullaId,
        },
      });
      this.logger.info(`Padulla added to LiveChat. Padulla id: ${padullaId}`);
      return liveChat;
    } catch (e) {
      this.error.handleError(new InternalServerErrorException(e));
    }
  }

  async sendMessage(SendMessageInput: SendMessageInput) {
    const { userId, liveChatId, content, isPadullaSent } = SendMessageInput;
    try {
      const message = await this.prisma.message.create({
        data: {
          content,
          liveChatId,
          userId,
          seen: isPadullaSent ?? false,
        },
        include: {
          liveChat: {
            include: {
              users: true, // show all users in the liveChat (padulla and client)
            },
          }, // show liveChat info
          user: true, // show the user that sent the message
        },
      });
      this.logger.info(`New message sent: ${message}`);
      await this.cacheService.del(`${liveChatId}_messages`);
      return message;
    } catch (e) {
      this.error.handleError(new InternalServerErrorException(e));
    }
  }

  async getMessagesForLiveChat(liveChatId: number): Promise<Message[]> {
    return this.cacheService.wrap(`${liveChatId}_messages`, async () => {
      return this.prisma.message.findMany({
        where: {
          liveChatId: liveChatId,
        },
        include: {
          liveChat: {
            include: {
              users: {
                orderBy: {
                  id: 'asc',
                },
              },
            },
          },
          user: true,
        },
      });
    });
  }

  async deleteLiveChat(liveChatId: number): Promise<LiveChat> {
    try {
      this.logger.info(`Deleting LiveChar with id: ${liveChatId}.`);
      const deletedChat = this.prisma.liveChat.delete({
        where: {
          id: liveChatId,
        },
      });
      this.logger.info(`LiveChat deleted: ${deletedChat}`);
      return deletedChat;
    } catch (e) {
      this.error.handleError(new NotFoundException(e));
    }
  }

  async setMessagesAsRead(liveChatId: number): Promise<Message[]> {
    const oldestUnseenMessage = await this.prisma.message.findFirst({
      where: {
        liveChatId: liveChatId,
        seen: false,
      },
      orderBy: {
        createdAt: 'asc', // Order by creation date to get the oldest message
      },
    });

    if (!oldestUnseenMessage) {
      return [];
    }

    const messagesToUpdate = await this.prisma.message.findMany({
      where: {
        liveChatId: liveChatId,
        createdAt: {
          gte: oldestUnseenMessage.createdAt, // Filter messages from oldest to newest
        },
      },
    });

    messagesToUpdate.map(async (message) => {
      await this.prisma.message.update({
        where: {
          id: message.id,
        },
        data: {
          seen: true,
        },
      });
    });

    return messagesToUpdate;
  }

  async setMessageAsUnread(liveChatId: number): Promise<Message> {
    const lastMessage = await this.prisma.message.findFirst({
      where: {
        liveChatId: liveChatId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    await this.prisma.message.update({
      where: {
        id: lastMessage.id,
      },
      data: {
        seen: false,
      },
    });
    return lastMessage;
  }

  async getLiveChatsForPadulla(padullaId: string): Promise<LiveChat[]> {
    const liveChatsWithUnreadMessages: LiveChat[] =
      await this.prisma.liveChat.findMany({
        where: {
          users: {
            some: {
              id: padullaId,
            },
          },
          OR: [
            {
              messages: {
                none: {},
              },
            },
            {
              messages: {
                some: {
                  seen: false,
                },
              },
            },
          ],
        },
        include: {
          users: true,
          messages: true,
        },
        take: 10,
      });

    if (liveChatsWithUnreadMessages.length >= 10) {
      return liveChatsWithUnreadMessages;
    }

    const liveChatsIdsWithOneUser = await this.prisma.liveChatUsers.groupBy({
      by: ['liveChatId'],
      having: {
        liveChatId: {
          _count: {
            equals: 1,
          },
        },
      },
    });

    const liveChatsWithOneUser = await this.prisma.liveChat.findMany({
      where: {
        id: {
          in: liveChatsIdsWithOneUser.map((liveChat) => liveChat.liveChatId),
        },
      },
      include: {
        users: true,
        messages: true,
      },
      take: 10 - liveChatsWithUnreadMessages.length,
    });

    return [...liveChatsWithUnreadMessages, ...liveChatsWithOneUser];
  }
}
