const spawn = require("cross-spawn-promise");
const cpx = require("cpx");
const Path = require("path");
const FS = require("fs");
const rimraf = require("rimraf");
const chalk = require("chalk");

const error = chalk.rgb(200, 0, 0);
const info = chalk.rgb(100, 100, 255);

// Obtain a path to ts
const resolvePackageDir = packageName =>
    Path.dirname(require.resolve(`${packageName}/package.json`));
const tsPath = Path.join(resolvePackageDir("typescript"), "bin/tsc");
const electronPath = Path.join(resolvePackageDir("electron"), "dist/electron.exe");

/**
 * Default values for variables
 */
const defaults = {
    srcDir: "src",
    buildDir: "build",
    cleanup: false,
    build: false,
    watch: false,
    launch: false,
    launchParams: {},
    launchElectron: true,
    production: false,
    srcEntry: "src/index.ts",
    entry: "build/index.js",
    copyExtensions: ["html", "css", "jpg", "png", "ttf", "js"],
    tsConfig: Path.join(process.cwd(), "tsconfig.json"),
    verbose: true,
    srcMaps: true,
    emitDeclarations: true,
};

/**
 * Compiles TS code according to the given configuration
 * @param {object} config The configuration
 * @returns {Promise<void>} A promise that resolves once compilation finishes
 */
function compileTS({
    srcDir = defaults.srcDir,
    buildDir = defaults.buildDir,
    srcMaps = defaults.srcMaps,
    emitDeclarations = defaults.emitDeclarations,
    tsConfig = defaults.tsConfig,
    verbose = defaults.verbose,
    watchMode = defaults.watch,
    srcEntry = defaults.srcEntry,
} = {}) {
    let params = [];
    if (FS.existsSync(tsConfig)) {
        params = [
            ...(watchMode ? ["--watch"] : []),
            ...(verbose && !watchMode ? ["--diagnostics"] : []),
            "--project",
            tsConfig,
        ];
    } else {
        params = [
            ...(watchMode ? ["--watch"] : []),
            ...(srcMaps ? ["--sourceMap"] : []),
            ...(emitDeclarations ? ["--declaration"] : []),
            ...(emitDeclarations && srcMaps ? ["--declarationMap"] : []),
            ...(verbose && !watchMode ? ["--diagnostics"] : []),
            "--esModuleInterop",
            "--tsBuildInfoFile",
            ".tsbuildinfo",
            "--incremental",
            "--outDir",
            buildDir,
            "--rootDir",
            srcDir,
            srcEntry,
        ];
    }
    return spawn("node", [tsPath, ...params], {stdio: "inherit"});
}

/**
 * Moves files of the specified type from the specified source to build directory
 * @param {object} config The configuration
 * @returns {Promise<void>} A promise that resolves once moving finishes
 */
function moveFiles({
    srcDir = defaults.srcDir,
    buildDir = defaults.buildDir,
    extensions = defaults.copyExtensions,
    verbose = defaults.verbose,
    watchMode = defaults.watch,
} = {}) {
    const srcBlob = `${srcDir}/**/*.{${extensions.join(",")}}`;
    if (watchMode) {
        return new Promise(() => {
            const watcher = cpx.watch(srcBlob, buildDir, {
                initialCopy: false,
            });
            if (verbose)
                watcher
                    .on("copy", e => {
                        console.log(`Copied ${e.srcPath} -> ${e.dstPath}`);
                    })
                    .on("remove", e => {
                        console.log(`Removed ${e.path}`);
                    });
        });
    } else {
        return new Promise((res, rej) => {
            cpx.copy(srcBlob, buildDir, err => {
                if (err) rej(err);
                else res();
            });
        });
    }
}

/**
 * Resets the contents of the build dir
 * @param {object} config The configuration
 * @returns {Promise<void>} A promise that resolves once deletion finishes
 */
function resetBuildDir({buildDir = defaults.buildDir} = {}) {
    return new Promise((res, rej) => {
        rimraf(buildDir, {glob: false}, err => {
            if (err) rej(err);
            else res();
        });
    });
}

/**
 * Launches the application that the build is for
 * @param {object} config The configuration
 * @returns {Promise<void>} A promise that resolves once the application closes
 */
function launchApp({
    entry = defaults.entry,
    launchParams = defaults.launchParams,
    launchElectron = defaults.launchElectron,
    production = defaults.production,
} = {}) {
    if (!production) launchParams = {...launchParams, NODE_ENV: "dev"};
    const params = [entry];
    Object.keys(launchParams).forEach(key => {
        params.push("--" + key, launchParams[key]);
    });

    if (launchElectron)
        return spawn(electronPath, params, {stdio: "inherit", env: launchParams});
    else return spawn("node", params, {stdio: "inherit"});
}

/**
 * Runs the build tools
 * @param {object} config The configuration
 * @returns {Promise<void>} A promise that resolves once build finishes
 */
async function run({
    srcDir = defaults.srcDir,
    buildDir = defaults.buildDir,
    cleanup = defaults.cleanup,
    build = defaults.build,
    watch = defaults.watch,
    launch = defaults.launch,
    launchParams = defaults.launchParams,
    launchElectron = defaults.launchElectron,
    entry = defaults.entry,
    srcEntry = defaults.srcEntry,
    copyExtensions = defaults.copyExtensions,
    tsConfig = defaults.tsConfig,
    verbose = defaults.verbose,
    srcMaps = defaults.srcMaps,
    production = defaults.production,
    emitDeclarations = defaults.emitDeclarations,
} = {}) {
    if (typeof copyExtensions == "string") copyExtensions = copyExtensions.split(/,\s*/);
    if (typeof launchParams == "string") launchParams = JSON.parse(launchParams);

    if (cleanup) {
        if (verbose) console.log(info("[Cleanup]: started"));
        await resetBuildDir({buildDir});
        if (verbose) console.log(info("[Cleanup]: finished"));
    }
    if (build) {
        if (verbose) console.log(info("[build]: started copying files"));
        await moveFiles({
            srcDir,
            buildDir,
            extensions: copyExtensions,
            verbose,
            watchMode: false,
        });
        if (verbose) console.log(info("[build]: finished copying files"));
        if (verbose) console.log(info("[build]: started transpiling typescript"));
        await compileTS({
            srcDir,
            buildDir,
            srcMaps,
            emitDeclarations,
            tsConfig,
            verbose,
            srcEntry,
            watchMode: false,
        });
        if (verbose) console.log(info("[build]: finished transpiling typescript"));
    }

    let launchPromise;
    if (launch) {
        if (verbose) console.log(info("[launch]: launching application"));
        launchPromise = launchApp({entry, launchParams, launchElectron, production}).then(
            () => {
                if (verbose) console.log(info("[launch]: quite application"));
            }
        );
    }

    let watchPromise;
    if (watch) {
        if (verbose) console.log(info("[watch]: watching for file changes"));
        watchPromise = Promise.all([
            moveFiles({
                srcDir,
                buildDir,
                extensions: copyExtensions,
                verbose,
                watchMode: true,
            }),
            compileTS({
                srcDir,
                buildDir,
                srcMaps,
                emitDeclarations,
                tsConfig,
                verbose,
                srcEntry,
                watchMode: true,
            }),
        ]).then(() => {
            if (verbose) console.log(info("[watch]: stopped watching for file changes"));
        });
    }

    await launchPromise;
    await watchPromise;
}

module.exports = {compileTS, moveFiles, resetBuildDir, launchApp, run, defaults};
