interface contact_seller_post {
    _id: any;
}

interface contact_seller_client {
    _id: string,
    name: string,
    email: string,
    lastName: string,
    username: string,
    phone: string,
    message: string
}

export class ContactSeller {
    private readonly post: contact_seller_post;
    private readonly client: contact_seller_client;
    private readonly notification_id: any;

    constructor(post: contact_seller_post, client: contact_seller_client, notification_id: any) {
        this.post = post;
        this.client = client;
        this.notification_id = notification_id;
    }


    getPost(): contact_seller_post {
        return this.post;
    }

    getClient(): contact_seller_client {
        return this.client;
    }

    toString(): string {
        return JSON.stringify(this);
    }


}
