<p align="center">
  <img src="https://gist.githubusercontent.com/ranyitz/ede5da04d74ccd9d40fc8a804d9a7a1a/raw/644d69caaa3145ede932a67c86b27f1c051eb3c6/qnm-logo.svg" alt="qnm-logo"/>
</p>

<p align="center">:mag: A simple cli utility for querying the <code>node_modules</code> directory</p>
<p align="center">
  <a href="https://circleci.com/gh/ranyitz/qnm">
   <img src="https://img.shields.io/circleci/build/github/ranyitz/qnm?token=44b1fb1aa4b5bd58b977bda99d94d1be137ecbc3&style=for-the-badge" alt="Build Status" />
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/qnm">
    <img alt="NPM version" src="https://img.shields.io/npm/v/qnm.svg?style=for-the-badge">
  </a>
  <a aria-label="License" href="https://github.com/ranyitz/qnm/blob/master/LICENSE">
    <img alt="License" src="https://img.shields.io/npm/l/qnm.svg?style=for-the-badge">
  </a>
  <p align="center">
    <img src="https://user-images.githubusercontent.com/11733036/138602697-29b9f00b-b35b-4db6-9005-e2bba7bd9398.png" alt="qnm-help" />
  </p>
</p>

## Why?

> most bugs are caused by the assumptions we didn't realize we were making.

I often need to quickly check the versions of the modules installed in the `node_modules` directory. Current solutions like running `npm list` are slow and produce a lot of irrelevant output. Checking the version in the `package.json` file of the specific module requires more effort and doesn’t provide information about other instances of the same module.

_qnm_ is a tool that solves this problem by providing fast and focused information about the installed modules. It supports both `npm` and `yarn` and allows you to quickly identify the versions of the modules you are interested in.

## Features

- :sparkles: Interactive fuzzy-search
- :abc: Match all packages with a specific string
- :interrobang: Explain why a package was installed
- :books: Supports monorepos
- :clock12: Show when a version was release and what is the latest version

## Usage

> You can use bunx/npx to run qnm, the docs use bunx because it's the fastest way

```bash
bunx qnm [module]
```

For example, if you want to see the installed versions of `lodash`:

```bash
bunx qnm lodash
```

And you'll see something like that:

```bash
lodash 4.17.21 ↰ 2 days ago
├── 4.17.21 ✓
├─┬ cli-table2
│ └── 3.10.1 ⇡ 1 year ago
└─┬ karma
  └── 3.10.1 ⇡ 1 year ago
```

Which means you have 3 occurrences of lodash in your `node_modules`:

1.  `./node_module/lodash`
2.  `./node_module/cli-table2/node_modules/lodash`
3.  `./node_module/karma/node_modules/lodash`

- The latest version of lodash is 4.17.21, it was published 2 days ago.
- The other 2 occurrences of lodash (3.10.1) were released a year ago.

### Fuzzy-search

<img src="./assets/fuzzy-search.gif" alt="fuzzy-search" width="400px" height="400px" />

Use `qnm` command without arguments to trigger an [`fzf`](https://github.com/junegunn/fzf) like fuzzy search.

- Start typing to filter the matches from your `node_modules`
- Use arrows to move cursor up and down
- `Enter` key to select the item, `CTRL-C` / `ESC` to exit
- `TAB` and `Shift-TAB` to mark multiple items

## Options

### --no-remote

do not fetch remote data from npm, use this if you want qnm to run faster. qnm will show limited view.

### -o , --open

Open the module's `package.json` file with the default editor.

### -d, --debug

See full error messages, mostly for debugging.

### --disable-colors

Disables the most of colors and styling. E.g. version colors.

## Commands

### doctor

> experimental

Shows the heaviest modules in your `node_modules`. Helpful if you want to understand what's taking the most space on your `node_modules` directory.

```bash
bunx qnm doctor
```

sort the modules based on the amount of duplications they have in your `node_modules`.

```bash
bunx qnm doctor --sort duplicates
```

![image](https://user-images.githubusercontent.com/11733036/149247765-74247703-a7ce-4476-9b2e-7be31d4d672e.png)

### list

> alias: ls

Returns a list of all modules in node_modules directory.

```bash
bunx qnm list
```

| Optional arguments |                                       Description                                       |
| ------------------ | :-------------------------------------------------------------------------------------: |
| `--deps`           |              List the versions of direct dependencies and devDependencies.              |
| `--remote`         | Fetch remote data, this may be very slow for many packages due to many network requests |

### match

Works like grep, and match's any module that includes the supplied string.

For example, i want to see which eslint plugins i have installed:

```bash
> bunx qnm match eslint-plug

eslint-plugin-babel
└── 3.3.0

eslint-plugin-lodash
└── 2.6.1

eslint-plugin-mocha
└── 4.12.1

eslint-plugin-react
└── 6.10.3
```

| Optional arguments |                                       Description                                       |
| ------------------ | :-------------------------------------------------------------------------------------: |
| `--remote`         | Fetch remote data, this may be very slow for many packages due to many network requests |

### homepage

Opens package "homepage" property in your browser.

## Contributing

Help is always welcome! Please head to the [CONTRIBUTING.md](./CONTRIBUTING.md) file to see how to get started.

## License

The MIT License

## Installation

> while qnm used to be installed globally, it's recommended to use `npx`/`bunx` to run it, it's just much faster.

If you prefer the global installation, you can do it with:

```bash
npm i --global qnm
```
