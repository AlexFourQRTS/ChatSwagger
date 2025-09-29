import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async create(createMessageDto: CreateMessageDto) {
    const { content, senderId, receiverId } = createMessageDto;
    
    const message = await this.prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        deliveredAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            isOnline: true,
          }
        },
        receiver: {
          select: {
            id: true,
            email: true,
            isOnline: true,
          }
        }
      }
    });

    return message;
  }

  async findMessagesBetweenUsers(userId1: string, userId2: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            isOnline: true,
          }
        },
        receiver: {
          select: {
            id: true,
            email: true,
            isOnline: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }

  async findAll() {
    return this.prisma.message.findMany({
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            isOnline: true,
          }
        },
        receiver: {
          select: {
            id: true,
            email: true,
            isOnline: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.message.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            isOnline: true,
          }
        },
        receiver: {
          select: {
            id: true,
            email: true,
            isOnline: true,
          }
        }
      }
    });
  }
}
