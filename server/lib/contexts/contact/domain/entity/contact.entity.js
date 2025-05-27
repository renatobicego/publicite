"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contact = void 0;
class Contact {
    constructor(phone, instagram, facebook, x, website) {
        this.phone = phone;
        this.instagram = instagram;
        this.facebook = facebook;
        this.x = x;
        this.website = website;
    }
    static formatDtoToEntity(contact) {
        return new Contact(contact.phone, contact.instagram, contact.facebook, contact.x, contact.website);
    }
    getPhone() {
        return this.phone;
    }
    getInstagram() {
        return this.instagram;
    }
    getFacebook() {
        return this.facebook;
    }
    getX() {
        return this.x;
    }
    getWebsite() {
        return this.website;
    }
}
exports.Contact = Contact;
//# sourceMappingURL=contact.entity.js.map