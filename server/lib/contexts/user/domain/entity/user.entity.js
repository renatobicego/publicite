"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserType = void 0;
var UserType;
(function (UserType) {
    UserType["Personal"] = "Personal";
    UserType["Business"] = "Business";
})(UserType = exports.UserType || (exports.UserType = {}));
class User {
    constructor(clerkId, email, username, description, profilePhotoUrl, countryRegion, isActive, name, lastName, contact, createdTime, subscriptions, groups, magazines, board, post, userRelations, userType) {
        this.clerkId = clerkId;
        this.email = email;
        this.username = username;
        this.description = description;
        this.profilePhotoUrl = profilePhotoUrl;
        this.countryRegion = countryRegion;
        this.isActive = isActive;
        this.name = name;
        this.lastName = lastName;
        this.contact = contact;
        this.createdTime = createdTime;
        this.subscriptions = subscriptions !== null && subscriptions !== void 0 ? subscriptions : [];
        this.groups = groups !== null && groups !== void 0 ? groups : [];
        this.magazines = magazines !== null && magazines !== void 0 ? magazines : [];
        this.board = board !== null && board !== void 0 ? board : [];
        this.post = post !== null && post !== void 0 ? post : [];
        this.userRelations = userRelations !== null && userRelations !== void 0 ? userRelations : [];
        this.userType = userType !== null && userType !== void 0 ? userType : UserType.Personal;
    }
    getClerkId() {
        return this.clerkId;
    }
    getEmail() {
        return this.email;
    }
    getUsername() {
        return this.username;
    }
    getDescription() {
        return this.description;
    }
    getProfilePhotoUrl() {
        return this.profilePhotoUrl;
    }
    getCountryRegion() {
        return this.countryRegion;
    }
    getIsActive() {
        return this.isActive;
    }
    getContact() {
        return this.contact;
    }
    getCreatedTime() {
        var _a;
        return (_a = this.createdTime) !== null && _a !== void 0 ? _a : '';
    }
    getSubscriptions() {
        return this.subscriptions;
    }
    getGroups() {
        return this.groups;
    }
    getMagazines() {
        return this.magazines;
    }
    getBoard() {
        return this.board;
    }
    getPost() {
        return this.post;
    }
    getUserRelations() {
        return this.userRelations;
    }
    getUserType() {
        var _a;
        return (_a = this.userType) !== null && _a !== void 0 ? _a : UserType.Personal;
    }
    getName() {
        return this.name;
    }
    getLastName() {
        return this.lastName;
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map