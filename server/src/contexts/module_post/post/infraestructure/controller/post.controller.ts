import { Controller, Delete, Inject, Param, UseGuards } from "@nestjs/common";
import { PostAdapterInterface } from "../../application/adapter/post.adapter.interface";
import { AuthSocket } from "src/contexts/module_socket/infrastructure/auth/socket.auth";


@Controller("post")
export class PostController {

    constructor(
        @Inject('PostAdapterInterface')
        private readonly postAdapter: PostAdapterInterface,
    ) { }


    @Delete(':id')
    @UseGuards(AuthSocket)
    async deleteAccount(@Param('id') id: string): Promise<any> {
        try {
            await this.postAdapter.deleteAccount(id);
        } catch (error: any) {
            throw error;
        }
    }


}