"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sector = void 0;
class Sector {
    constructor(label, description, id) {
        this.label = label;
        this.description = description;
        this._id = id;
    }
    static formatDocumentToClass(document) {
        return new Sector(document.label, document.description, document._id);
    }
    getId() {
        return this._id;
    }
    getLabel() {
        return this.label;
    }
    getDescription() {
        return this.description;
    }
}
exports.Sector = Sector;
//# sourceMappingURL=sector.entity.js.map