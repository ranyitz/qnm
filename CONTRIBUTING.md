# Contributing

Hey! Thanks for your interest in improving `qnm`! There are plenty of ways you can help!

Please take a moment to review this document in order to make the contribution process easy and effective for everyone involved.

## Submiting an issue

Please provide us with an issue in case you've found a bug, want a new feature, have an awesome idea, or there is something you want to discuss.

## Submitting a Pull Request

Good pull requests, such as patches, improvements, and new features, are a fantastic help. They should remain focused in scope and avoid containing unrelated commits.

## Local Setup
Fork the repo, clone, install dependencies and run the tests:

```
git clone git@github.com:<username>/qnm.git
cd qnm
npm install
npm test
```

To test the `qnm` command, run the following from the project root:

```bash
npm link
```

Now you should be able to run `qnm` from anywhare, and it will be linked to your local project.

### Test

In order to run the tests in watch mode ([jest](https://github.com/facebook/jest)), run the following command:

```
npm run test:watch
``` 

### Lint

In order to run the linter ([eslint](https://github.com/eslint/eslint)), run the following command:

```
npm run lint
``` 

* The linter will run before commit on staged files, using [husky](https://github.com/typicode/husky) and [lint-stage](https://github.com/okonet/lint-staged).