# qnm

> query node_modules

:mag: A simple cli utility for querying the `node_modules` directory

[![Build Status](https://circleci.com/gh/ranyitz/qnm/tree/master.svg?style=shield&circle-token=44b1fb1aa4b5bd58b977bda99d94d1be137ecbc3)](https://circleci.com/gh/ranyitz/qnm)

<img src="./assets/fuzzy-search.gif" alt="fuzzy-search" width="400px" height="400px" />

## Why?

> most bugs are caused by the assumptions we didn't realize we were making.

When debugging a problem, I sometimes find myself checking what are the installed versions of the modules within `node_modules` directory. Current solutions like running `npm list` are not fast enough and prints too much clutter, checking the version in the `package.json` takes a bit more effort and doesn't give you more information regarding other occurrences of this module. 

_qnm_ aims to get this information **fast** and tries to filter only the important parts, while supporting both yarn & npm. 

## Features
* :speech_balloon: Tab completions
* :sparkles: Interactive fuzzy-search
* :abc: Match all packages with a specific string
* :interrobang: Explain why a package was installed

## Installation

```bash
npm i --global qnm
```

> qnm will also install tab completions [during post install](https://github.com/mklabs/node-tabtab#tabtab-install---auto).

## Usage

```bash
qnm [module]
```

For example, if you want to see the installed versions of `lodash`:

```bash
qnm lodash
```

And you'll see something like that:

```bash
lodash
├── 4.17.5
├─┬ cli-table2
│ └── 3.10.1
└─┬ karma
  └── 3.10.1
```

Which means you have 3 occurrences of lodash in your `node_modules`:

1.  `./node_module/lodash`
2.  `./node_module/cli-table2/node_modules/lodash`
3.  `./node_module/karma/node_modules/lodash`


### Fuzzy-search

Use `qnm` command without arguments to trigger an [`fzf`](https://github.com/junegunn/fzf) like fuzzy search, start typing to filter the matches from your `node_modules`.

## Options

### -w, --why

> currently only works if you installed with npm

Add information regarding why this package was installed in the first place, by showing its dependent packages.

## Commands

### list

> alias: ls

Returns a list of all modules in node_modules directory.

```bash
qnm list
```

### match

Works like grep, and match's any module that includes the supplied string.

For example, i want to see which eslint plugins i have installed:

```bash
> qnm match eslint-plug

eslint-plugin-babel
└── 3.3.0

eslint-plugin-lodash
└── 2.6.1

eslint-plugin-mocha
└── 4.12.1

eslint-plugin-react
└── 6.10.3
```

## Contributing

Help is always welcome! Please head to the [CONTRIBUTING.md](./CONTRIBUTING.md) file to see how to get started.

## License

The MIT License
