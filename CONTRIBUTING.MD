# Instructions for contributing code

We welcome any code contributions to the project!
If you have any questions, feel free to reach out to us at one of the following channels:

-   [Github discussions](https://github.com/LaunchMenu/LaunchMenu/discussions)
-   [Element](https://app.element.io/#/group/+launchmenu:matrix.org)

To get started developing on LaunchMenu, you will need the following:

-   A Mac or Windows computer (Eventually we want Linux support, but right now Linux will probably experience many bugs)
-   An installation of [node](https://nodejs.org/en/)
-   [Yarn](https://classic.yarnpkg.com/en/) (this may not strictly be necessary, but we've only tested things with yarn)
-   A code editor, preferably one capable of TypeScript intellisense, such as [VSCode](https://code.visualstudio.com/)

After you have cloned the repo and are good to go, you can install all dependencies by running the following command in the root:

```
yarn
```

Afterwards you can run the core program, by running the following command from `packages/core`:

```
yarn dev
```

Similarly to make changes to any of the applets in `packages/applets` or `packages/core-applets`, the same command can be ran from the applet's directory:

```
yarn dev
```

LaunchMenu has a rather unique/specific architecture. In case you're confused about anything, the online docs cover the most important aspects:
[LaunchMenu.github.io/docs](https://launchmenu.github.io/docs/)

## Branches/merging

This repo 2 permanent branches, and 5 more branch types:

-   master: This branch is up to date with the latest release.
-   development: This branch contains all finished features for the next release.
-   feature/\[featureName]: Branches matching this pattern contain a unfinished new feature
-   fix/\[bugName]: Branches matching this pattern contain a unfinished fix for a bug
-   docs/\[change]: Branches matching this pattern contain documentation improvements
-   other/\[change]: Branches matching this pattern contain changes not fitting under `feature`, `fix` or `docs`, such as code refactors
-   release/\[versionNumber]: Branches matching this pattern contain commits for alpha, beta and final releases before merging them to master

All of the feature and bug names follow the camelCase convention. Additionally, we try to keep branch names as explicit as possible, without adding irrelevant information. E.g.:
`fix/caretAlwaysFlashing`

Any new branches must be created from the development branch, and should be merged back into development before getting moved to master when development is released.
So in case you want to contribute, always pull from development and make PRs to development.

## Changelog.md

Whenever a fix or feature is merged to the development branch, it should be added to the changelog.
The changelog contains a history of changes of previous versions, as well as a `vNext` at the top. Any new changes should be added under `vNext` and this title will be replaced by the new version number when it's released from development into master.

If any of the API changed in a non-backwards compatible manor the change should be listed under `breaking`, everything else goes under `non-breaking`. Next, every change should fall under a change type header corresponding with the branch type: feature, fix, or other. Finally the change should fall under the name of the package that got changed (the `@launchmenu/` can be omitted). The actual change itself should mention a very concise description, and a link to the PR.

For instance, if I were to add `mnemonics` support to LM in a way that's fully opt-in and backwards compatible, I would add something like this to the [`CHANGELOG.md`](https://github.com/LaunchMenu/LaunchMenu/blob/development/CHANGELOG.md) file:

```markdown
# vNext

## Non-breaking

### Feature

#### core

-   Added mnemonics support [#142](https://github.com/LaunchMenu/LaunchMenu/pull/142)
```
