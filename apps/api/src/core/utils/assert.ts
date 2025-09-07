/**
 * Asserts that the provided value is not `undefined` or `null`.
 *
 * @param v - The value to be validated.
 * @param name - The name of the value being tested.
 * @throws {Error} If the value is undefined or null, an error is thrown with a message indicating which variable was missing.
 */
export function assertDefined<T>(
  v: T,
  name: string,
): asserts v is NonNullable<T> {
  if (v === undefined || v === null) {
    throw new Error(`❌ Missing required variable: ${name}`)
  }
}
