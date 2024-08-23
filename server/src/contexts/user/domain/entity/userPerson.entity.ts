import { User } from "./user.entity";

/*
Entidad para la cuenta personal
*/

enum Gender {
  Mujer = 'Mujer',
  Hombre = 'Hombre',
	Otro = 'Prefiero no decir'
}
export class UserPerson extends User{	
	private name :string;
	private lastName: string;
	private gender: Gender;
	private birthDate: string;
	
	constructor(name:string,lastName:string,gender:Gender,birthDate:string){
		super();
		this.name = name;
		this.lastName = lastName;
		this.gender = gender;
		this.birthDate = birthDate;
	}


}


