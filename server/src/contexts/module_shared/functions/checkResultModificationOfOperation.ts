import { Logger } from '@nestjs/common';

function checkResultModificationOfOperation(result: any, message?: string) {
  if (result.matchedCount === 0 || !result) {
    Logger.error(
      message ??
      'User not allowed.',
    );
    throw new Error(
      message ??
      'User not allowed.',
    );
  }
}

export { checkResultModificationOfOperation };
