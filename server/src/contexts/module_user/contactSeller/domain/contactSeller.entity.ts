

interface contact_seller_client {
    clientId: any,
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
    private readonly date: Date;
    private readonly isOpinionRequested: boolean;
    private readonly isOpinionRequestAvailable: boolean;


    constructor(post: any, client: contact_seller_client, notification_id: any, owner: any, date: Date, isOpinionRequested: boolean) {
        this.post = post;
        this.client = client;
        this.notification_id = notification_id;
        this.owner = owner;
        this.date = date;
        this.isOpinionRequested = client.clientId ? isOpinionRequested : true
        this.isOpinionRequestAvailable = client.clientId ? true : false
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
