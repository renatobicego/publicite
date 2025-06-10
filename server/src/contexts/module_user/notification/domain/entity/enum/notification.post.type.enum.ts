import { registerEnumType } from "@nestjs/graphql";

export enum NotificationPostType {
    reaction = 'reaction',
    comment = 'comment',
    response = 'response'
}

registerEnumType(NotificationPostType, {
    name: 'NotificationPostType',
    description: 'NotificationPostType',
});
