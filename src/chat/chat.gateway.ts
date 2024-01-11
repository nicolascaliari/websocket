import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Server, Socket } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';


@WebSocketGateway()
export class ChatGateway implements OnModuleInit {

  @WebSocketServer()
  server: Server

  constructor(private readonly chatService: ChatService) { }



  onModuleInit() {
    this.server.on('connection', (client: Socket) => {

      const { token, name } = client.handshake.auth;

      if (!name) {
        client.disconnect();
        return
      }



      this.chatService.onClientConnected({
        id: client.id,
        name
      })


      this.server.emit('clients', this.chatService.getAllClients())



      client.on('disconnect', () => {
        this.chatService.onClientDisconnected(client.id)
        this.server.emit('clients', this.chatService.getAllClients())
      })
    })








    // @SubscribeMessage('createChat')
    // create(@MessageBody() createChatDto: CreateChatDto) {
    //     return this.chatService.create(createChatDto);
    //   }

    // @SubscribeMessage('findAllChat')
    // findAll() {
    //     return this.chatService.findAll();
    //   }

    // @SubscribeMessage('findOneChat')
    // findOne(@MessageBody() id: number) {
    //     return this.chatService.findOne(id);
    //   }

    // @SubscribeMessage('updateChat')
    // update(@MessageBody() updateChatDto: UpdateChatDto) {
    //     return this.chatService.update(updateChatDto.id, updateChatDto);
    //   }

    // @SubscribeMessage('removeChat')
    // remove(@MessageBody() id: number) {
    //     return this.chatService.remove(id);
    //   }
  }



  @SubscribeMessage('send-message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket
  ) {
    const { name } = client.handshake.auth;

    if (!message) {
      return;
    }


    this.server.emit('on-message', {
      userId: client.id,
      message: message,
      name: name
    })

  }

}