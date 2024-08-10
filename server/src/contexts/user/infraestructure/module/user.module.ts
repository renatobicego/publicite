// user.module.ts
import { Module } from '@nestjs/common';
import { UserService } from '../../application/user.service';

@Module({
	providers: [UserService],
	exports: [UserService],
})
export class UserModule { }
