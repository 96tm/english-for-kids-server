function isValidNumber(number: number): boolean {
  return 0 <= number && number <= Number.MAX_SAFE_INTEGER;
}

export { isValidNumber };
