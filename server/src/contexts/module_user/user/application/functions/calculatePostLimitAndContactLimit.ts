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

function calculatePostLimitFromUser(userWithSubscriptionsAndPosts: userWithPostsAndSubscriptions, logger: MyLoggerService): {
    agendaPostCount: number,
    librePostCount: number,
    totalAgendaPostLimit: number,
    totalLibrePostLimit: number,
    agendaAvailable: number,
    libreAvailable: number
} {
    const { totalAgendaPostLimit, totalLibrePostLimit } = userWithSubscriptionsAndPosts.subscriptions.reduce(
        (limits, subscription) => {
            limits.totalAgendaPostLimit += subscription.subscriptionPlan.postsAgendaCount;
            limits.totalLibrePostLimit += subscription.subscriptionPlan.postsLibresCount;
            return limits;
        },
        { totalAgendaPostLimit: 0, totalLibrePostLimit: 0 }
    );


    const { agendaPostCount, librePostCount } = userWithSubscriptionsAndPosts.posts.reduce(
        (counts, post) => {
            if (post.postBehaviourType === 'agenda') counts.agendaPostCount++;
            if (post.postBehaviourType === 'libre') counts.librePostCount++;
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
    const { subscriptions } = userWithSubscriptionsAndPosts

    if (subscriptions && subscriptions.length > 0) {
        subscriptions.map((plan: any) => {
            return contactLimit += plan.subscriptionPlan.maxContacts
        })
    }

    if (userWithSubscriptionsAndPosts.activeRelations && userWithSubscriptionsAndPosts.activeRelations.length > 0) {
        contactCount = userWithSubscriptionsAndPosts.activeRelations.length
    }

    contactAvailable = contactLimit - contactCount
    logger.log('Contact limit: ' + contactLimit + ' - Contact count: ' + contactCount + ' - Contact available: ' + contactAvailable);

    return { contactLimit, contactCount, contactAvailable };
}

export { calculatePostLimitFromUser, calculateContactLimitFromUser, userWithPostsAndSubscriptions };