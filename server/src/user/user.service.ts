import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';


import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
      },
      orderBy: {
        isOnline: 'desc'
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
      }
    });
  }

  // Новый метод для получения чатов пользователя
  async getUserChats(userId: string) {
    // Получаем всех пользователей, с которыми есть переписка
    const chats = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            isOnline: true,
            lastSeen: true,
          }
        },
        receiver: {
          select: {
            id: true,
            email: true,
            isOnline: true,
            lastSeen: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Группируем по собеседникам и получаем последнее сообщение
    const chatMap = new Map();
    
    chats.forEach(message => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const otherUser = message.senderId === userId ? message.receiver : message.sender;
      
      if (!chatMap.has(otherUserId)) {
        chatMap.set(otherUserId, {
          user: otherUser,
          lastMessage: message,
          unreadCount: 0
        });
      }
    });

    // Подсчитываем непрочитанные сообщения
    for (const [otherUserId, chat] of chatMap) {
      const unreadCount = await this.prisma.message.count({
        where: {
          senderId: otherUserId,
          receiverId: userId,
          isRead: false
        }
      });
      chat.unreadCount = unreadCount;
    }

    return Array.from(chatMap.values()).sort((a, b) => 
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  }

  async updateOnlineStatus(id: string, isOnline: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: {
        isOnline,
        lastSeen: new Date()
      }
    });
  }

  test() {
    return `User test is ok`;
  }
}
