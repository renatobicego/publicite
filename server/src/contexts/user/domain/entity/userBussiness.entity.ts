import { ObjectId } from "mongoose";
import { User } from "./user.entity";
/*
Entidad para la cuenta de empresa
*/ 
export class UserBussiness extends User {
	private sector: ObjectId;

	constructor(sector: ObjectId) {
		super();
		this.sector = sector;
	}


}