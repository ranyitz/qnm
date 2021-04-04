export default class NotFoundRepositoryError extends Error {
  constructor(name: string) {
    const message = `Could not find repository link for module "${name}".`;

    super(message);
  }
}
