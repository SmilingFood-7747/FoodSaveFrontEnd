export class DomainError extends Error {
  constructor(readonly key: string) {
    super(key);
  }
}
