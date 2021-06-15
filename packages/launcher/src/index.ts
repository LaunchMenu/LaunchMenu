import {app} from "electron";
import {
    install,
    getInstalledPath,
    isInstalled,
    getPackageNameWithoutVersion,
} from "./installer";
import FS from "fs";
import Path from "path";
import {promisify} from "util";
import {handleMacPermissionsDialog} from "./permissions/handleMacPermissionsDialog";
import {InstallerWindow} from "./installerWindow/InstallerWindow";
import OS from "os";
import {handleWindowsPermissionsDialog} from "./permissions/handleWindowsPermissionsDialog";

launch();

/**
 * The launch process is currently a bit messy and hacky in order to get later installed applets to share the same packages with LM.
 * Launching the application will actually install a number of packages beforehand - in the same directory as the exe is in - if they aren't there yet. Afterwards it will run the launcher of core to start LM.
 */
async function launch(): Promise<void> {
    // Some setup
    setupWorkingDir();
    app.commandLine.appendSwitch("ignore-certificate-errors", "true"); // https://github.com/electron/electron/issues/25354#issuecomment-739804891
    global.DEV = process.env.NODE_ENV == "dev";

    // Specify program directory and launch function
    const installDir =
        process.platform == "darwin"
            ? `${OS.homedir()}/Library/Application Support/LaunchMenu`
            : process.cwd();
    const launchLM = () =>
        require(getInstalledPath(
            installDir,
            "@launchmenu/core/build/windowController/launcher"
        )).launch({root: installDir});

    // Install LM if necessary, and launch it
    if (!isInstalled(installDir, "@launchmenu/core"))
        await firstTimeSetup(installDir, launchLM);
    else launchLM();
}

/**
 * Sets up LM for the first launch:
 * + Prompts user to install applets
 * - Installs packages
 * - Adds required initial settings files
 * @param installDir The directory that the modules as well as all LM data should be stored in
 * @param launchLM The function to LM after installation
 */
async function firstTimeSetup(
    installDir: string,
    launchLM: () => Promise<{
        show: () => void;
        shown: Promise<void>;
    }>
): Promise<void> {
    await app.whenReady();
    const window = new InstallerWindow();

    try {
        // Perform some initialization
        await Promise.all([setupDirs(installDir), window.init()]);

        // Present the user with some first time setup stuff
        const chosenApplets = await window.getInitialApplets();
        const applets = [
            "@launchmenu/applet-applet-manager",
            "@launchmenu/applet-session-manager",
            "@launchmenu/applet-settings-manager",
            "@launchmenu/applet-window-manager",
            "@launchmenu/applet-help",
            ...chosenApplets,
        ] as string[];
        const packages = ["@launchmenu/core", ...applets];

        // Create an initial package
        await initPackage(installDir);
        for (let p of packages) {
            window.setState({type: "loading", name: `Installing ${p}`});
            await install(installDir, p);
        }

        // Ask for permissions on mac if needed
        if (process.platform == "darwin") await handleMacPermissionsDialog(window);
        if (process.platform == "win32") await handleWindowsPermissionsDialog(window);

        // Finalize
        window.setState({type: "loading", name: `Finishing up`});
        await initAppletsFile(installDir, applets);

        // Launch LM
        const {show, shown} = await launchLM();
        window.setState({type: "finished", name: "Finished"});

        // Wait for the user to open LM
        await shown;
    } catch (e) {
        // Handle failures by showing the user something went wrong, and shitting the error message to some file
        window.setState({
            type: "loading",
            name: `Something went wrong during installation`,
        });
        await promisify(FS.writeFile)(
            Path.join(installDir, "errorReport.txt"),
            e.toString() + "\n" + (e instanceof Error ? e.stack : ""),
            "utf8"
        );
        console.error(e);
        await new Promise(res => setTimeout(res, 5000));
    }

    // Close the window
    window.close();
}

/*********************************************
 * Some helpers to perform the initial setup *
 *********************************************/
async function setupDirs(root: string): Promise<void> {
    const dirs = ["node_modules", "data/settings"];
    for (let dir of dirs) {
        const dirPath = Path.join(root, dir);
        if (!FS.existsSync(dirPath))
            await promisify(FS.mkdir)(dirPath, {recursive: true});
    }
}

async function initPackage(root: string): Promise<void> {
    const path = Path.join(root, "package.json");
    if (FS.existsSync(path)) return;

    const file = {
        name: "launchmenu",
        private: true,
        description: "The launchmenu program thing",
        dependencies: {},
    };
    await promisify(FS.writeFile)(path, JSON.stringify(file, null, 4), "utf8");
}

async function initAppletsFile(root: string, applet: string[]): Promise<void> {
    if (DEV) return;

    const path = Path.join(root, "data/settings/applets.json");
    if (FS.existsSync(path)) return;

    const file = {} as Record<string, string>;
    applet.forEach(module => {
        const match = module.match(/(([^\/@\s]*)\/)?([^\/@\s]+)(\@[^\/\s]*)?$/);
        if (!match) {
            console.error(`${module} doesn't fit regex pattern`);
            return;
        }
        const namespace = match[2];
        const name = match[3];
        const path = namespace ? `${namespace}@${name}` : name;
        try {
            file[path] = getInstalledPath(root, getPackageNameWithoutVersion(module));
        } catch (e) {
            console.error(e);
        }
    });
    await promisify(FS.writeFile)(path, JSON.stringify(file, null, 4), "utf8");
}

/**
 * Fixes the working directory. Window's auto startup doesn't use the file location as the working dir by default.
 */
function setupWorkingDir(): void {
    const regex = /workingDir=(.*)/;
    const dir = process.argv.reduce((cur, arg) => {
        const match = regex.exec(arg);
        if (match) return match[1];
        return cur;
    }, Path.dirname(process.argv[0]));
    process.chdir(dir);
}
