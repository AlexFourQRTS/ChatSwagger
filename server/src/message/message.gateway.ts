import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody, 
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
    transports: ['websocket', 'polling']
  },
  namespace: 'message'
})
export class MessageGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger('MessageGateway');

  constructor(private readonly messageService: MessageService) {}

  afterInit(server: any) {
    this.logger.log('MessageGateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Проверяем аутентификацию
    const token = client.handshake.auth?.token;
    if (!token) {
      this.logger.warn(`Client ${client.id} connected without token`);
      client.disconnect();
      return;
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('createMessage')
  async create(@MessageBody() createMessageDto: CreateMessageDto, @ConnectedSocket() client: Socket) {
    try {
      const message = await this.messageService.create(createMessageDto);
      
      // Отправляем сообщение получателю
      client.to(createMessageDto.receiverId).emit('privateMessage', message);
      
      // Отправляем подтверждение отправителю
      client.emit('messageSent', message);
      
      return message;
    } catch (error) {
      this.logger.error('Error creating message:', error);
      client.emit('messageError', { error: error.message });
    }
  }

  @SubscribeMessage('joinPrivateChat')
  async joinPrivateChat(@MessageBody() data: { userId: string, otherUserId: string }, @ConnectedSocket() client: Socket) {
    try {
      const roomName = this.getPrivateRoomName(data.userId, data.otherUserId);
      client.join(roomName);
      
      // Загружаем историю сообщений
      const messages = await this.messageService.findMessagesBetweenUsers(data.userId, data.otherUserId);
      client.emit('messageHistory', messages);
    } catch (error) {
      this.logger.error('Error joining private chat:', error);
      client.emit('error', { message: 'Failed to join private chat' });
    }
  }

  @SubscribeMessage('leavePrivateChat')
  leavePrivateChat(@MessageBody() data: { userId: string, otherUserId: string }, @ConnectedSocket() client: Socket) {
    const roomName = this.getPrivateRoomName(data.userId, data.otherUserId);
    client.leave(roomName);
  }

  @SubscribeMessage('findAllMessage')
  async findAll(@ConnectedSocket() client: Socket) {
    try {
      const messages = await this.messageService.findAll();
      client.emit('messageHistory', messages);
    } catch (error) {
      this.logger.error('Error fetching messages:', error);
      client.emit('error', { message: 'Failed to fetch messages' });
    }
  }

  @SubscribeMessage('findOneMessage')
  async findOne(@MessageBody() id: string, @ConnectedSocket() client: Socket) {
    try {
      const message = await this.messageService.findOne(id);
      client.emit('messageFound', message);
    } catch (error) {
      this.logger.error('Error fetching message:', error);
      client.emit('error', { message: 'Failed to fetch message' });
    }
  }

  private getPrivateRoomName(userId1: string, userId2: string): string {
    const sortedIds = [userId1, userId2].sort();
    return `private_${sortedIds[0]}_${sortedIds[1]}`;
  }
}