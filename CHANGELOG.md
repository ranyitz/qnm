# Changelog

## 0.13.2 (May 30, 2018)
* Remove the auto installation of tab completions and add a new command `install-completions` instead.

## 0.13.1 (May 30, 2018)
* Add errors for no `node_modules` case and empty `node_modules` case.

## 0.13.0 (May 30, 2018)
* Add an update notifier.

## 0.12.0 (May 30, 2018)
* [#31](https://github.com/ranyitz/qnm/pull/31) Add `--homepage` option to open the homepage of a certain package.
* [#35](https://github.com/ranyitz/qnm/pull/35) Fix `--why` option on match & list commands.
* [#33](https://github.com/ranyitz/qnm/pull/33) Add `--open` option to open the `package.json` of a certain package.

## 0.11.0 (May 26, 2018)
* [#34](https://github.com/ranyitz/qnm/pull/34) Highlight the same versions with the same colors.
* [#30](https://github.com/ranyitz/qnm/pull/30) Be able to pass options to fuzzy search mode.

## 0.10.2 (April 7, 2018)
* Fixed a bug when exiting watch mode would disable `ctrl+c` for the shell process.

## 0.10.1 (March 28, 2018)
* [#24](https://github.com/ranyitz/qnm/pull/24) Add list --deps options for listing modules own dependencies.

## 0.10.0 (March 28, 2018)
* [#21](https://github.com/ranyitz/qnm/pull/21) Add `match` command instead `-m, --match` options.
* [#22](https://github.com/ranyitz/qnm/pull/22) Add multi-select feature to fuzzy-search.

## 0.9.0 (March 22, 2018)
* Added a fuzzy search when calling `qnm` without arguments. 

## 0.8.2 (March 12, 2018)
* Show the "--why" info only when this is a package installed in the root.
* Fix question mark position in 'not found module' message.
* Change 'Dependencies' to 'dependencies' on the '--why' feature.
* Add underline to main modules render function.

## 0.8.1 (March 11, 2018)

* Add --why option to see who are the dependents of a certain package.

## 0.8.0 (March 10, 2018)

* Improve rendering, output a tree view of the modules and versions.
* Show nesting of modules ancestors.

## 0.7.2 (March 10, 2018)

* Improve error handling.
* Add debug option.

## 0.7.1 (March 10, 2018)

* Install tab completions automatically.

## 0.7.0 (March 9, 2018)

* Moved the cli app to use commander.
* Enabled tab completions using tabtab.

## 0.6.0 (March 9, 2018)

* Add suggestion in case there is no result for get action.

## 0.5.1 (March 8, 2018)

* Improve error message when nothing was found.
* Add support for `--match` option.

## 0.4.0 (March 7, 2018)

* Add support for scoped packages.
* Add the `list`/`ls` command which gives you a list of all installed modules.

## 0.3.0 (March 7, 2018)

* Support running commands from a module's subdirectory.
* Improve error handling and show `error.stack` only when `--verbose` option is used.
* Show nested occurences of the module you search with and their source module.

## 0.2.0 (March 6, 2018)

* Add lazy loading for `package.json`.

## 0.1.0 (March 6, 2018)

First version
