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
import {InstallerWindow} from "./installerWindow/InstallerWindow";

launch();

/**
 * The launch process is currently a bit messy and hacky, in order to get later installed applets to share the same packages with LM.
 * Launching the application will actually install a number of packages beforehand in the same directory as the exe is in if they aren't there yet. Afterwards it will run the launcher of core to start LM.
 */
async function launch(): Promise<void> {
    if (!isInstalled("@launchmenu/core")) await firstTimeSetup();
    require(getInstalledPath("@launchmenu/core/build/windowManager/launcher")).launch();
}

async function firstTimeSetup(): Promise<void> {
    await app.whenReady();
    const window = new InstallerWindow();

    try {
        // Perform some initialization
        await Promise.all([setupDirs(), window.init()]);

        // Present the user with some first time setup stuff
        const chosenApplets = await window.getInitialApplets();
        const applets = [
            "@launchmenu/applet-applet-manager@alpha",
            "@launchmenu/applet-session-manager@alpha",
            "@launchmenu/applet-settings-manager@alpha",
            ...chosenApplets,
        ] as string[];
        const packages = ["@launchmenu/core@alpha", ...applets];

        // Create an initial package
        await initPackage();
        for (let p of packages) {
            window.setState({type: "loading", name: `Installing ${p}`});

            // TODO: get rid of the fake install once we have real applets
            if (chosenApplets.includes(p))
                await new Promise(res => setTimeout(res, 1500));
            else await install(p);
        }

        window.setState({type: "loading", name: `Finishing up`});
        await initAppletsFile(applets);
    } catch (e) {
        // Handle failures by showing the user something went wrong, and shitting the error message to some file
        window.setState({
            type: "loading",
            name: `Something went wrong during installation`,
        });
        await promisify(FS.writeFile)(
            Path.join(process.cwd(), "errorReport.txt"),
            e.toString(),
            "utf8"
        );
        await new Promise(res => setTimeout(res, 5000));
    }

    // Close the window after a slight delay
    setTimeout(() => window.close(), 3000);
}

/*********************************************
 * Some helpers to perform the initial setup
 *********************************************/
async function setupDirs(): Promise<void> {
    const dirs = ["node_modules", "data/settings"];
    for (let dir of dirs) {
        const dirPath = Path.join(process.cwd(), dir);
        if (!FS.existsSync(dirPath))
            await promisify(FS.mkdir)(dirPath, {recursive: true});
    }
}

async function initPackage(): Promise<void> {
    const path = Path.join(process.cwd(), "package.json");
    if (FS.existsSync(path)) return;

    const file = {
        name: "launchmenu",
        private: true,
        description: "The launchmenu program thing",
        dependencies: {},
    };
    await promisify(FS.writeFile)(path, JSON.stringify(file, null, 4), "utf8");
}

async function initAppletsFile(applet: string[]): Promise<void> {
    const path = Path.join(process.cwd(), "data/settings/applets.json");
    if (FS.existsSync(path)) return;

    const file = {} as Record<string, string>;
    applet.forEach(module => {
        try {
            file[module] = getInstalledPath(getPackageNameWithoutVersion(module));
        } catch (e) {}
    });
    await promisify(FS.writeFile)(path, JSON.stringify(file, null, 4), "utf8");
}
