# qnm
> query node_modules

A simple cli utility for querying the `node_modules` directory.

## why?
> most bugs are caused by the assumptions we didn't realize we were making.

When debugging a problem, I sometimes find myself checking what are the **real™** versions of the modules within `node_modules` directory, i want to be able and check a specific module, list them all, get diffs between two repositories etc...

This tool should help me ease and improve this workflow.

## Installation
```bash
npm i --global qnm
```

## Usage
```bash
qnm [module]
```

For example, if you want to see the installed version of `lodash`:

```bash
qnm lodash
```

## License
The MIT License