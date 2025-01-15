export class PostComment{
    private user: string;
    private comment: string;

    constructor(userId:string,comment:string){
        this.user = userId;
        this.comment = comment;
    }

    get getUserId(){
        return this.user
    }

    get getComment(){
        return this.comment;
    }



}

