# qnm

> query node_modules

A simple cli utility for querying the `node_modules` directory :mag:

[![Build Status](https://circleci.com/gh/ranyitz/qnm/tree/master.svg?style=shield&circle-token=44b1fb1aa4b5bd58b977bda99d94d1be137ecbc3)](https://circleci.com/gh/ranyitz/qnm)

## Why?

> most bugs are caused by the assumptions we didn't realize we were making.

When debugging a problem, I sometimes find myself checking what are the installed versions of the modules within `node_modules` directory. It would be real nice to be able to check a specific module; know what its version; why it's installed and whether there are more copies of it. This tool should help by getting this information **fast**. If we have a tool that knows the structure of our `node_modules` we can have even better features, like tab copmletions, searching all occurrences that contains a specific string and more.

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

## Roadmap

* Supply a path as an argument and qnm will list this directory
* Diff between two workspaces

## License

The MIT License

## FAQ

#### What's the problem with `npm list`?

* Very slow.
* A lot of output.
* Sometimes fails on big projects.
* Lack of features.
