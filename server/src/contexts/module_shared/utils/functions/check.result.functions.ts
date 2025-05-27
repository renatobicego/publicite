import { Logger, UnauthorizedException } from '@nestjs/common';
import { NotModifyException } from '../../exceptionFilter/noModifyException';


function chekResultOfOperation(result: any, message?: string) {
  if (!result || result == null) {
    Logger.error(
      message ??
      'User not allowed.',
    );
    throw new UnauthorizedException(
      message ??
      'User not allowed.',
    );
  }

  if (result.matchedCount === 0 || !result) {
    Logger.error(
      message ??
      'User not allowed.',
    );
    throw new UnauthorizedException(
      message ??
      'User not allowed.',
    );
  }
}


function checkIfanyDataWasModified(result: any) {
  chekResultOfOperation(result);


  if (result.modifiedCount === 0) {
    throw new NotModifyException();
  }
}

export { chekResultOfOperation, checkIfanyDataWasModified };
