import { Logger } from '@nestjs/common';

function checkResultModificationOfOperation(result: any, message?: string) {
  if (result.matchedCount === 0) {
    Logger.error(
      message ??
        'Group admin does not have permission or schema does not exist.',
    );
    throw new Error(
      message ??
        'Group admin does not have permission or schema does not exist.',
    );
  }
}

export { checkResultModificationOfOperation };
