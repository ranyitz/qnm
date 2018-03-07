# qnm
> query node_modules

A simple cli utility for querying the `node_modules` directory.

## Why?
> most bugs are caused by the assumptions we didn't realize we were making.

When debugging a problem, I sometimes find myself checking what are the **real™** versions of the modules within `node_modules` directory, i want to be able and check a specific module, list them all, get diffs between two repositories etc...

This tool should help me ease and improve this workflow.

### So what's the problem with `npm list`?
* Very slow
* A lot of output
* Sometimes fails on big projects
* Lack of debugging features

## Installation
```bash
npm i --global qnm
```

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
> 4.17.5
> 3.10.1 (cli-table2)
> 3.10.1 (karma)
```

Which means you have 3 occurences of lodash in your `node_modules`:
1. `./node_module/lodash`
2. `./node_module/cli-table2/node_modules/lodash`
3. `./node_module/karma/node_modules/lodash`

## Options
### -m, --match
Works like grep, and match's any module that includes the supplied string.

For example:
```bash
qnm -m lodash
```

Will provide the following output:
```bash
lodash.includes > 4.3.0
lodash.isarguments > 3.1.0
lodash.isarray > 3.0.4
```

### list
> alias: ls

Returns a list of all modules in node_modules directory.
```bash
qnm list
```
## Roadmap

* Search a module's node_modules
* In case of typo, suggest module name that does exist
* Search by regex
* Fuzzy search for node_modules
* Diff between two workspaces

## License
The MIT License