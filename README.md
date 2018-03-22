# qnm

> query node_modules

:mag: A simple cli utility for querying the `node_modules` directory

[![Build Status](https://circleci.com/gh/ranyitz/qnm/tree/master.svg?style=shield&circle-token=44b1fb1aa4b5bd58b977bda99d94d1be137ecbc3)](https://circleci.com/gh/ranyitz/qnm)

## Why?

> most bugs are caused by the assumptions we didn't realize we were making.

When debugging a problem, I sometimes find myself checking what are the installed versions of the modules within `node_modules` directory. While current commands like `npm list` provide too much clutter and are usually not fast enough. _qnm_ aims to get this information **fast** and show you only important information, while supporting both yarn & npm. 

## Features
* Tab completions
* Match all packages with a specific string
* Why a package was installed?

## Installation

```bash
npm i --global qnm
```

> qnm will also install tab completions during post install.

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

## Options

### -m, --match

Works like grep, and match's any module that includes the supplied string.

For example, i want to see which eslint plugins i have installed:

```bash
> qnm -m eslint-plug

eslint-plugin-babel
└── 3.3.0

eslint-plugin-lodash
└── 2.6.1

eslint-plugin-mocha
└── 4.12.1

eslint-plugin-react
└── 6.10.3
```

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

## Contributing

Open issues for bugs or feature requests and feel free to open pull requests!

For local development, fork the repo, clone, install dependencies and run the tests:

```
git clone git@github.com:<username>/qnm.git
cd qnm
npm install
npm test
```

## License

The MIT License
