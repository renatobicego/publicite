function checkResultModificationOfOperation(result: any) {
  if (result.matchedCount === 0) {
    throw new Error(
      'Group admin does not have permission or schema does not exist.',
    );
  }
}

export { checkResultModificationOfOperation };
