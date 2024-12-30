import { clerkClient } from "@clerk/express";

export async function setSuscriptionInClerkMetadata(userId: string, subscriptionId: any) {
    try {
        if (subscriptionId === null) subscriptionId = "675f2b75b0a367029a0d35a6" // Free plan
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                subscriptionId: subscriptionId
            },
        });

    } catch (error: any) {
        console.log(error);
        throw error;
    }
}