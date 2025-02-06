import { Inject } from "@nestjs/common";



import { PostReviewAdapterInterface } from "../../application/adapter/postReview.adapter.interface";
import { PostReviewServiceInterface } from "../../domain/service/postReview.service.interface";
import { PostReview } from "../../application/adapter/request/post.review.request";
import { OnEvent } from "@nestjs/event-emitter";
import { new_review } from "src/contexts/module_shared/event-emmiter/events";


export class PostReviewAdapter implements PostReviewAdapterInterface {
    constructor(
        @Inject('PostReviewServiceInterface')
        private readonly postReviewService: PostReviewServiceInterface
        

    ) { }



    @OnEvent(new_review)
    async createReview(postReview: PostReview): Promise<void> {
        try {
            return await this.postReviewService.createReview(postReview)
        } catch (error: any) {
            throw error;
        }
    }

}




/// Me falta probar hacer una peticion de review y luego aceptar y enviar la review 