import chokidar from "chokidar";
import Path from "path";

/**
 * Listens to changes for a module and triggers the callback when data changed
 * @param dir The directory to check for changes in (path should be absolute)
 * @param onChange The callback to perform when data is changed
 * @returns A chokidar watcher
 */
export default function hmr(dir: string, onChange: () => void): chokidar.FSWatcher {
    const watcher = chokidar
        .watch(dir, {
            persistent: true,
            cwd: dir,
        })
        .on("all", (type, path) => {
            const fullPath = Path.join(dir, path);
            delete require.cache[fullPath];
            onChange();
        });
    return watcher;
}
