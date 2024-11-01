import { Body, Controller, Post } from "@nestjs/common";

@Controller('socket')
export class SocketContrroller {

  @Post()
  async helloTest(
    @Body() notificationBody: any,
  ): Promise<any> {
    try {
      console.log(notificationBody)
    } catch (error: any) {
      throw error;
    }
  }


}