export default class NotFoundHomepageleError extends Error {
  constructor(name: string) {
    const message = `Could not find homepage link for module "${name}".`;

    super(message);
  }
}
