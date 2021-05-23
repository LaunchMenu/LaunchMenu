import {
    createFolderMenuItem,
    IField,
    IIOContext,
    IMenu,
    IMenuItem,
} from "@launchmenu/core";
import {DataCacher, DataLoader, IDataRetriever, isDataListener} from "model-react";
import {promises as FS, existsSync} from "fs";
import {createVideoRecorderItems} from "./createVideoRecorderItems";
import Path from "path";
import hmr, {HMRWatcher} from "@launchmenu/hmr";

/**
 * Creates a new menu item used for recording audio
 * @param recordingScriptsDir The directory of scripts to be recording
 * @returns The folder menu item storing the recording scripts, and a function to dispose the watcher
 */
export function createVideoRecordersFolderItem(
    recordingScriptsDir: IField<string>
): {item: IMenuItem; destroy: () => void} {
    const dirContentsSource = new DataCacher<{
        dirPath: string;
        files: DataLoader<string[]>;
        watcher: undefined | HMRWatcher;
    }>((hook, prev) => {
        const dirPath = recordingScriptsDir.get(hook);

        if (prev && prev.watcher) prev.watcher.destroy();

        return {
            dirPath,
            files: new DataLoader<string[]>(async () => {
                const files = dirPath ? await FS.readdir(dirPath) : [];
                return files;
            }, []),
            watcher: existsSync(dirPath)
                ? hmr(dirPath, () => isDataListener(hook) && hook.call())
                : undefined,
        };
    });

    return {
        item: createFolderMenuItem({
            name: "Video recording scripts",
            children: hook => {
                const {dirPath, files} = dirContentsSource.get(hook);
                return files
                    .get(hook)
                    .filter(file => Path.parse(file).ext == ".js")
                    .flatMap(name => createVideoRecorderItems({name, dir: dirPath}));
            },
        }),
        destroy: () => {
            dirContentsSource.get().watcher?.destroy();
            dirContentsSource.destroy();
        },
    };
}
