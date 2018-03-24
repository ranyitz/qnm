const buildWithAncestors = (m, { why }) => {
  let hierarchy = {
    version: m.version,
  };

  if (why) {
    hierarchy.whyInfo = m.whyInfo || [];
  }

  if (m.parent) {
    let currentModule = m;

    while (currentModule.parent) {
      currentModule = currentModule.parent;

      if (hierarchy.dependents) {
        hierarchy = {
          name: currentModule.name,
          dependents: hierarchy,
        };
      } else {
        hierarchy = {
          name: currentModule.name,
          ...hierarchy,
        };
      }
    }
  }

  return hierarchy;
};

module.exports = (moduleOccurrences, { why } = {}) => {
  const buildedOccurrences = moduleOccurrences.map(m =>
    buildWithAncestors(m, { why }),
  );

  const rootOccurrence = buildedOccurrences.find(
    occurrence => !occurrence.dependents && !occurrence.name,
  );

  const result = {
    name: moduleOccurrences[0].name,
    ...(rootOccurrence || {}),
    dependents: buildedOccurrences.filter(
      occurrence => occurrence !== rootOccurrence,
    ),
  };

  return result;
};
