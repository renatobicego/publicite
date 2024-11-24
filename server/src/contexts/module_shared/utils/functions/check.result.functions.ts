import { Logger, UnauthorizedException } from '@nestjs/common';

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
    throw new Error('No data was modified in the database. Please verify you request.');
  }
}

export { chekResultOfOperation, checkIfanyDataWasModified };
