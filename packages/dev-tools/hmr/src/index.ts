import chokidar from "chokidar";
import Path from "path";

/**
 * Listens to changes for a module and triggers the callback when data changed
 * @param dir The directory to check for changes in (path should be absolute)
 * @param onChange The callback to perform when data is changed
 * @param options Extra options
 * @returns A chokidar watcher
 */
export default function hmr(
    dir: string,
    onChange: (changedFiled: string[], affectedFiles: string[]) => void,
    {
        timeoutTime = 500,
        target,
    }: {
        /** The number of milliseconds to wait for before an update */
        timeoutTime?: number;
        /** The absolute path to a module, such that the onChange is only called if this module was affected */
        target?: string;
    } = {}
): HMRWatcher {
    let timeoutID: NodeJS.Timeout;
    let changed = [];

    const watcher = chokidar
        .watch(dir, {
            persistent: true,
            cwd: dir,
            ignoreInitial: true,
            ignored: ["**/node_modules/**/*", "**/.git/**/*"],
        })
        .on("all", (type, path) => {
            const fullPath = Path.join(dir, path);
            changed.push(fullPath);

            clearTimeout(timeoutID);
            timeoutID = setTimeout(() => {
                const changedFiles = [...changed];
                const affectedFiles = [...changed];

                // Invalid changed cache entries
                while (changed.length > 0) {
                    const path = changed.pop();
                    if (require.cache[path]) {
                        delete require.cache[path];

                        // Find any modules that used this module, and recursively remove those from the cache too
                        Object.values(require.cache).forEach(({filename, children}) => {
                            const usedModule = children.find(
                                child => child.filename == path
                            );
                            if (usedModule) {
                                changed.push(filename);
                                affectedFiles.push(filename);
                            }
                        });
                    }
                }

                // Inform listener about the update
                if (!target || !require.cache[target])
                    onChange(changedFiles, affectedFiles);
            }, timeoutTime);
        });
    return {
        watcher,
        destroy: (fully: boolean = true) => {
            watcher.close();
            if (fully) clearTimeout(timeoutID);
        },
    };
}

/**
 * The FSWatcher returned by chokidar and HMR
 */
export type FSWatcher = chokidar.FSWatcher;

export type HMRWatcher = {
    /** The chokidar watcher */
    watcher: FSWatcher;
    /**
     * Destroys the watcher
     * @param fully Whether to also clear any previously started update timeouts
     */
    destroy(fully?: boolean): void;
};

/**
 * Requires without storing child references, such that HMR doesn't think you're dependent on the module and you should be invalidated
 * @param path The path to be required
 * @returns The output of the require call
 */
export function referencelessRequire(path: string): any {
    try {
        const result = require(path);
        return result;
    } finally {
        module.children = [];
    }
}
