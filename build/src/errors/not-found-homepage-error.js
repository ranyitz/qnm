module.exports = class NotFoundHomepageleError extends Error {
  constructor(name) {
    const message = `Could not find homepage link for module "${name}".`;
    super(message);
  }
};
//# sourceMappingURL=not-found-homepage-error.js.map
