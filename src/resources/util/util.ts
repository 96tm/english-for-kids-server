function isValidNumber(number: number): boolean {
  return 1 <= number && number <= Number.MAX_SAFE_INTEGER;
}

export { isValidNumber };
