const head = require('lodash/head');
const prompts = require('prompts');

module.exports = async whyTree => {
  const whyList = [whyTree.label];
  let currentNode = whyTree;

  while (currentNode.nodes.length > 0) {
    if (currentNode.nodes.length === 1) {
      const nextNode = head(currentNode.nodes);
      whyList.push(nextNode.label);
      currentNode = nextNode;
    } else {
      const result = await prompts({
        type: 'select',
        name: 'value',
        message: `The package "${
          currentNode.label
        }" was install because of the following packages, choose one of them to continue:`,
        choices: currentNode.nodes.map(node => ({
          title: node.label,
          value: node,
        })),
        initial: 0,
      });

      whyList.push(result.value.label);
      currentNode = result.value;
    }
  }

  return whyList.join(' => ');
};
