import { MyLoggerService } from "src/contexts/module_shared/logger/logger.service"

interface userWithPostsAndSubscriptions {
    posts: [{
        postBehaviourType: string // libre o agenda
    }]
    activeRelations: any[]
    subscriptions: [
        {
            subscriptionPlan: {
                postsLibresCount: number
                postsAgendaCount: number
                maxContacts: number
            }
        }
    ]
}

/*
Un plan o pack que no trae un campo (p. ej. un pack de tokens o de MB, que sólo
carga lo que suma) cuenta 0 en esa dimensión, y una suscripción sin plan populado
se ignora: sumar `undefined` dejaba el límite en NaN.
*/
function planNumber(subscription: any, field: string): number {
    const value = subscription?.subscriptionPlan?.[field];
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function calculatePostLimitFromUser(userWithSubscriptionsAndPosts: userWithPostsAndSubscriptions, logger: MyLoggerService): {
    agendaPostCount: number,
    librePostCount: number,
    totalAgendaPostLimit: number,
    totalLibrePostLimit: number,
    agendaAvailable: number,
    libreAvailable: number
} {
    const subscriptions: any[] = userWithSubscriptionsAndPosts.subscriptions ?? [];
    const { totalAgendaPostLimit, totalLibrePostLimit } = subscriptions.reduce(
        (limits, subscription) => {
            limits.totalAgendaPostLimit += planNumber(subscription, 'postsAgendaCount');
            limits.totalLibrePostLimit += planNumber(subscription, 'postsLibresCount');
            return limits;
        },
        { totalAgendaPostLimit: 0, totalLibrePostLimit: 0 }
    );


    const posts: any[] = userWithSubscriptionsAndPosts.posts ?? [];
    const { agendaPostCount, librePostCount } = posts.reduce(
        (counts, post) => {
            if (post?.postBehaviourType === 'agenda') counts.agendaPostCount++;
            if (post?.postBehaviourType === 'libre') counts.librePostCount++;
            return counts;
        },
        { agendaPostCount: 0, librePostCount: 0 }
    );
    logger.warn("Status of Limit posts of user: ");
    logger.log("User has agenda post: " + agendaPostCount + " |--|  User has Libre post: " + librePostCount);
    logger.log("Total agenda limit of user plan: " + totalAgendaPostLimit + " - Total libre limit of user plan : " + totalLibrePostLimit);

    const agendaAvailable = totalAgendaPostLimit - agendaPostCount;

    const libreAvailable = totalLibrePostLimit - librePostCount;
    logger.log('Agenda available of user: ' + agendaAvailable);
    logger.log('Libre available of user: ' + libreAvailable);
    logger.warn("PROCEDIENDO A ACTUALIZAR STATUS DE POSTS ")
    return { agendaPostCount, librePostCount, totalAgendaPostLimit, totalLibrePostLimit, agendaAvailable, libreAvailable };


}


function calculateContactLimitFromUser(userWithSubscriptionsAndPosts: userWithPostsAndSubscriptions, logger: MyLoggerService): {
    contactLimit: number,
    contactCount: number,
    contactAvailable: number

} {
    logger.log('Calculating contact limit....');
    let contactLimit = 0, contactCount = 0, contactAvailable = 0;
    const subscriptions: any[] = userWithSubscriptionsAndPosts.subscriptions ?? [];

    subscriptions.forEach((subscription: any) => {
        contactLimit += planNumber(subscription, 'maxContacts');
    });

    if (userWithSubscriptionsAndPosts.activeRelations && userWithSubscriptionsAndPosts.activeRelations.length > 0) {
        contactCount = userWithSubscriptionsAndPosts.activeRelations.length
    }

    contactAvailable = contactLimit - contactCount
    logger.log('Contact limit: ' + contactLimit + ' - Contact count: ' + contactCount + ' - Contact available: ' + contactAvailable);

    return { contactLimit, contactCount, contactAvailable };
}

export { calculatePostLimitFromUser, calculateContactLimitFromUser, userWithPostsAndSubscriptions };
