

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
    private readonly post: any;
    private readonly client: contact_seller_client;
    private readonly notification_id: any;
    private readonly owner: any;


    constructor(post: any, client: contact_seller_client, notification_id: any, owner: any) {
        this.post = post;
        this.client = client;
        this.notification_id = notification_id;
        this.owner = owner;
    }


    getPost(): any {
        return this.post;
    }

    getClient(): contact_seller_client {
        return this.client;
    }

    toString(): string {
        return JSON.stringify(this);
    }


}
