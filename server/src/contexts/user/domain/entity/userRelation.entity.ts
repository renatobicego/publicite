import { ObjectId } from "mongoose";

export class UserRelation {
	private userA: ObjectId;
	private userB: ObjectId;
	private typeRelationA: string;
	private typeRelationB: string;

	constructor(userA: ObjectId, userB: ObjectId, typeRelationA: string, typeRelationB: string) {
		this.userA = userA;
		this.userB = userB;
		this.typeRelationA = typeRelationA;
		this.typeRelationB = typeRelationB;
	}
	
}