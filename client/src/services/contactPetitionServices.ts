"use server"

import { mockedNewContactPost, mockedNewContactPost2, mockedNewContactPostSamePost } from "@/utils/data/mockedNotifications"

export const getContactPetitionsOfUser = async (id: string) => {
    return [mockedNewContactPost, mockedNewContactPost2]
}

export const getContactPetitionsOfPost = async (id: string) => {
    return [mockedNewContactPost, mockedNewContactPostSamePost]
}