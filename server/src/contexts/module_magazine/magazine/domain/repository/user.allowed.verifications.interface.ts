export interface UserMagazineAllowedVerificationsInterface {
    is_user_allowed_to_edit_section_USER_MAGAZINE(
        sectionId: string,
        userId: string,

    ): Promise<boolean>;

    is_user_allowed_to_edit_section_GROUP_MAGAZINE(
        sectionId: string,
        userId: string,
        magazineId: string
    ): Promise<boolean>;
    is_admin_creator_or_collaborator_of_magazine_GROUP_MAGAZINE(magazineId: string, userId: string): Promise<boolean>

    is_creator_of_magazine_USER_MAGAZINE(magazineId: string, userId: string): Promise<boolean>
    is_admin_or_creator_of_magazine_GROUP_MAGAZINE(
        magazineId: string,
        userId: string,
    ): Promise<any>

}