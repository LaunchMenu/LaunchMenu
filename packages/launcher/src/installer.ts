import npm from "npm";
import Path from "path";

/**
 * Install the core LM module
 * @param packageName The package to install
 * @param packages Additional packages to install
 */
export function install(packageName: string, ...packages: string[]): Promise<void> {
    packages = [packageName, ...packages];
    packages = packages.filter(p => !isInstalled(getPackageNameWithoutVersion(p)));
    if (packages.length == 0) return Promise.resolve();

    const prefix = process.cwd();
    return new Promise((res, rej) => {
        npm.load(
            {
                prefix,
                save: true,
                global: false,
            },
            function (err) {
                if (err) {
                    rej(err);
                } else {
                    let Installer = require("npm/lib/install.js").Installer;
                    let oInstaller = new Installer(prefix, false, packages, {
                        global: false,
                    });
                    oInstaller.run((err: any) => {
                        if (err) {
                            console.error("failed to install", packages);
                            rej(err);
                        } else {
                            console.log("installed", packages);
                            npm.commands.dedupe([], err => {
                                if (err) {
                                    console.error("failed to dedupe", packages);
                                    rej(err);
                                } else {
                                    res();
                                }
                            });
                        }
                    });
                    npm.on("log", function (message) {
                        console.log(message);
                    });
                }
            }
        );
    });
}

/**
 * Checks whether a package with the specified name is installed
 * @param packageName The package to check for
 * @param external Whether to only check for external packages
 * @returns Whether the specified package is installed
 */
export function isInstalled(packageName: string, external: boolean = true): boolean {
    try {
        if (external) console.log(`Found ${getExternalInstallPath(packageName)}`);
        else console.log(`Found ${getInstalledPath(packageName)}`);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Retrieves the name of the package without version number
 * @param packageName The name of the package possibly including version number
 * @returns The name of the package
 */
export function getPackageNameWithoutVersion(packageName: string): string {
    const match = packageName.match(/^(.+)@/);
    if (match) return match[1];
    return packageName;
}

/**
 * Retrieves the absolute path to a package with the given name
 * @param packageName The package to get the path of
 * @returns The path to the package
 * @throw Throws an error if no such path exists
 */
export function getInstalledPath(packageName: string): string {
    try {
        return require.resolve(packageName);
    } catch (e) {
        try {
            return getExternalInstallPath(packageName);
        } catch (e) {}
        throw e;
    }
}

/**
 * Retrieves the absolute path to a package with the given name, if externally installed
 * @param packageName The package to get the path of
 * @returns The path to the package
 * @throw Throws an error if no such path exists
 */
export function getExternalInstallPath(packageName: string): string {
    return require.resolve(Path.join(process.cwd(), "node_modules", packageName));
}
