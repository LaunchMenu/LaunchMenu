#!/usr/bin/env node
const Args = require("args");
const buildTools = require("@launchmenu/build-tools");
const {defaults} = buildTools;
const chalk = require("chalk");
const Path = require("path"); 

const error = chalk.rgb(200, 0, 0);

// Define the arguments
Args.options([
    {
        name: "build",
        description: "Whether to build the code",
        defaultValue: defaults.build,
    },
    {
        name: "watch",
        description: "Whether to watch for file changes",
        defaultValue: defaults.watch,
    },
    {
        name: "srcDir",
        description: "The source folder with ts files",
        defaultValue: defaults.srcDir,
    },
    {
        name: "buildDir",
        description: "The build folder with js files",
        defaultValue: defaults.buildDir,
    },
    {
        name: "cleanup",
        description: "Whether to cleanup the previous build",
        defaultValue: defaults.cleanup,
    },
    {
        name: "verbose",
        description: "Whether to show messages for files being deleted",
        defaultValue: defaults.verbose,
    },
    {
        name: "entry",
        description: "The entry file to be launched (if launch is set to true)",
        defaultValue: defaults.entry,
    },
    {
        name: "srcEntry",
        description:
            "The entry file in the src dir (has to be specified to transpile without tsconfig)",
        defaultValue: defaults.srcEntry,
    },
    {
        name: "launch",
        description: "Whether to launch the app after build",
        defaultValue: defaults.launch,
    },
    {
        name: "launchParams",
        description: "Parameters to pass with the build",
        defaultValue: JSON.stringify(defaults.launchParams),
    },
    {
        name: "launchElectron",
        description: "Whether to use electron to launch the app",
        defaultValue: defaults.launchElectron,
    },
    {
        name: "production",
        description: "Whether to launch and or build in production mode",
        defaultValue: defaults.production,
    },
    {
        name: "tsConfig",
        description:
            "The path towards a ts config file (defaults to tsConfig in the running process dir)",
        defaultValue: defaults.tsConfig,
    },
    {
        name: "copyExtensions",
        description: "The extensions of files that should be copied",
        defaultValue: defaults.copyExtensions,
    },
    {
        name: "srcMaps",
        description: "Whether to include source maps",
        defaultValue: defaults.srcMaps,
    },
    {
        name: "emitDeclarations",
        description: "Whether to include the declaration files",
        defaultValue: defaults.emitDeclarations,
    },
    {
        name: "reexport",
        description: "Whether to generate a reexport structure",
        defaultValue: defaults.reexport,
    },
    {
        name: "apiDir",
        description:
            "The directory path, relative to build, to put the exports in (only if using reexport)",
        defaultValue: defaults.apiDir,
    },
    {
        name: "typesDir",
        description:
            "The directory path, relative to build, to put the export types in (only if using reexport)",
        defaultValue: defaults.typesDir,
    },
    {
        name: "exportToFileName",
        description:
            "The filename of the file to read directory export mapping locations from (only if using reexport)",
        defaultValue: defaults.exportToFileName,
    },
    {
        name: "noExportText",
        description:
            "The export text (instead of file path) to indicate this export shouldn't be exposed (only if using reexport)",
        defaultValue: defaults.noExportText,
    },
    {
        name: "indexPath",
        description:
            "The path to the index to export the flattened export hierarchy to (only if using reexport, make falsy to disable, don't include extension)",
        defaultValue: defaults.indexPath,
    },
]);
const args = Args.parse(process.argv);

buildTools.run(args).catch(e => {
    console.log(error(e));
});
