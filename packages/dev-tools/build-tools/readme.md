# @launchmenu/build-tools

This package contains some build tools with a CLI interface that can be used to work on launchmenu itself, or applets of launchmenu.

It consists of mostly light wrappers around existing tools.
The process has 3 main stages:

-   Building the application (if `--build` is set)
-   Launching the application (if `--launch` is set)
-   Watching for changes, and rebuilding relevant parts (if `--watch` is set)

The build process consists of 3 main parts:

-   Typescript transpiling to javascript
-   Copying of resources (html, jpg, ttf, etc)
-   Creating an api access structure (if `--reexport` is set, see chapter below)

Properties such as the source and build directory can be altered using cmd line arguments.
Below is a full list of options:

```
 Usage: lm build-tools.js [options] [command]

  Commands:
    help     Display help
    version  Display version

  Options:
    -a, --apiDir [value]            The directory path, relative to build, to put the exports in (only if using reexport) (defaults to "api")
    -b, --build                     Whether to build the code (disabled by default)
    -B, --buildDir [value]          The build folder with js files (defaults to "build")
    -c, --cleanup                   Whether to cleanup the previous build (disabled by default)
    -C, --copyExtensions <list>     The extensions of files that should be copied (defaults to ["html","css","jpg","png","ttf","js"])
    -E, --emitDeclarations          Whether to include the declaration files (enabled by default)
    -e, --entry [value]             The entry file to be launched (if launch is set to true) (defaults to "index.js")
    -E, --exportToFileName [value]  The filename of the file to read directory export mapping locations from (only if using reexport) (defaults to ".exportTo")
    -h, --help                      Output usage information
    -i, --indexPath [value]         The path to the index to export the flattened export hierarchy to (only if using reexport, make falsy to disable, don't include extension) (defaults to "index")
    -l, --launch                    Whether to launch the app after build (disabled by default)
    -L, --launchElectron            Whether to use electron to launch the app (enabled by default)
    -L, --launchParams [value]      Parameters to pass with the build (defaults to "{}")
    -n, --noExportText [value]      The export text (instead of file path) to indicate this export shouldn't be exposed (only if using reexport) (defaults to "noExport")
    -p, --production                Whether to launch and or build in production mode (disabled by default)
    -r, --reexport                  Whether to generate a reexport structure (disabled by default)
    -s, --srcDir [value]            The source folder with ts files (defaults to "src")
    -S, --srcEntry [value]          The entry file in the src dir (has to be specified to transpile without tsconfig) (defaults to "index.ts")
    -S, --srcMaps                   Whether to include source maps (enabled by default)
    -t, --tsConfig [value]          The path towards a ts config file (defaults to tsConfig in the running process dir) (defaults to "I:\\projects\\Github\\LaunchMenu\\packages\\core-applets\\settings\\tsconfig.json")
    -T, --typesDir [value]          The directory path, relative to build, to put the export types in (only if using reexport) (defaults to "types")
    -v, --verbose                   Whether to show messages for files being deleted (enabled by default)
    -V, --version                   Output the version number
    -w, --watch                     Whether to watch for file changes (disabled by default)
```

# Building of api access structure

## Goal

The directory structure of a project may be pretty complex (and may make sense that way for development). But usually when trying to import from a package, you don't want to get your imports from deeply nested paths like that.

This tool provides a way to translate your directory structure into a nice to use api structure when the project is being built.

### Disclaimer

I made the system as general as I could without having to put in a lot of extra effort, but it is designed for quite a specific purpose none the less. It is made in accordance to what I want for LaunchMenu's api, and is not completely flexible.
I did expose all functions through js such that people might be able to extend it themselves if it doesn't fit their needs, but the code is rather messy. This code wasn't made to be completely future proof, but rather to be good enough for the moment.

## Features

### Directory mapping

Every directory can indicate what api directory to export its contents to by means of an ".exportTo" file (this name is configurable).
Lets imagine having a module "myModule", which has a build directory, with a file structure that looks like this:

```
- root
    - myDir1
        - myFile1
        - myFile2
    - myDir2
        - myFile3
        - myFile4
```

where each file has 1 export that's equivalent to the files name (it could be any export though, except for default exports).

Then a typical import would by default look like this:

```js
import {myFile2} from "myModule/build/myDir1/myFile2";
import {myFile3} from "myModule/build/myDir2/myFile3";
```

but by enabling `--reexport` and adding a `.exportTo` to myDir1 with contents: `./something`, I.E.:

```
- root
    - myDir1
        - myFile1
        - myFile2
        - .exportTo                   // contains: ./something
    - myDir2
        - myFile3
        - myFile4
```

we would suddenly be able to use the api as follows:

```js
import {myFile2} from "myModule/build/api/something";
import {myFile3} from "myModule/build/api"; // defaults the root
```

The specified export target also applier to deeper descendants, not only direct children.

### Type exports

Type and interface exports are automatically exported to the `/types` directory.
For instance, if myFile2 contains `export type stuff = boolean` we could import that as follows:

```js
import {stuff} from "myModule/build/types/something";
```

### Individual export mapping

Finally, we can also control individual exports using jsdoc.
Imagine we have the same structure as given above, but now myFile4 contains this code:

```ts
/** @exportTo "./something" */
export const myFile4 = 4;
```

Then we are able to import this from `something`:

```js
import {myFile4} from "myModule/build/api/something";
```

### Base index file

Of course the export paths are still rather nasty as you can see. I am waiting for typescript to support module exports like nodejs introduced: https://nodejs.org/api/esm.html#esm_package_entry_points. I would automatically generate such a structure in the config (or it would be even better to have glob support in the config if that ever happens) to get rid of `build/ap` in the paths.

For now, as a compromise, this system also generates a flattened index file. It will preserve the contents of your index file, but reexport all files from the api and types in addition to that.
That way, given the examples from above, you can import data like this:

```js
import {myFile4, stuff, myFile1} from "myModule";
```

### Export objects

In order to still retain the hierarchy in some form (since a hierarchy is useful for navigating the contents of a project) the system also generates objects containing the structure.
Every api directory will contain this object as a default export to represent its substructure. Exports have their normal name in this object, and child directories are prefixed with a `$`.

Unfortunately this structure obviously can't contain interface and type exports, since that data doesn't exist at runtime.

Some usage examples given the file structures from above:

```js
import api from "myModule";
const myFile3 = api.myFile3;
const myFile2 = api.$something.myFile2;
```

```js
import api from "myModule/build/api";
import something from "myModule/build/api/something";
const myFile3 = api.myFile3;
const myFile2 = api.$something.myFile2;
const myFile2Again = something.myFile2; // something == api.$something
```
