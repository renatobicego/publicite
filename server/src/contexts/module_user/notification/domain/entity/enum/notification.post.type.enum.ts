import { registerEnumType } from "@nestjs/graphql";

export enum NotificationPostType {
    reaction = 'reaction',
    comment = 'comment'
}

registerEnumType(NotificationPostType, {
    name: 'NotificationPostType',
    description: 'NotificationPostType',
});
