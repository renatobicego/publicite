import { registerEnumType } from '@nestjs/graphql';

export enum PostBehaviourType {
    libre = 'libre',
    agenda = 'agenda',
}

registerEnumType(PostBehaviourType, {
    name: 'PostBehaviourType',
    description: 'Type of the post ',
});
