import { cyan, green, red, yellow, dim, grey, underline } from 'chalk';

export const getCustomHelp = () => {
  return `

${underline("How to read qnm's output?")}

                  ${cyan('module name')}          ${cyan(
    'latest version',
  )}       
                         ${cyan('↘')}                ${cyan(
    '↙',
  )}                ${cyan('↙ publish time')}
                           ${underline('camelcase')} ${green.dim(
    '6.2.0 ↰ 11 months ago',
  )}                 
${cyan(' node_modules/camelcase →')}  ├── 5.3.1 ${red.dim('⇡')} ${grey(
    '2 years ago',
  )} ${yellow.dim('(boxen, yargs-parser)')}
                           └─┬ ${dim(
                             'jest',
                           )}                                      ${cyan(
    '↖',
  )}           
                             └── 6.2.0 ${green.dim(
                               '✓',
                             )}                               ${cyan(
    'dependency of',
  )}
                            ${cyan('↗')}            ${cyan('↖ equal to latest')}
${cyan(' node_modules/jest/node_modules/camelcase')}`;
};
