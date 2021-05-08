import {IMenuItem} from "@launchmenu/core";
import Path from "path";
import {createVideoRecorderItem} from "./createVideoRecorderItem";
import {referencelessRequire} from "@launchmenu/hmr";

/**
 * Creates menu items used for recording videos found in the given file
 * @param config The recording script config
 * @returns The video recorder items
 */
export function createVideoRecorderItems({
    name,
    dir,
}: {
    name: string;
    dir: string;
}): IMenuItem[] {
    const filePath = Path.join(dir, name);

    try {
        const recordings = referencelessRequire(filePath);
        return Object.keys(recordings)
            .map(name => createVideoRecorderItem({propName: name, path: filePath}))
            .filter((item): item is IMenuItem => !!item);
    } catch (e) {
        console.error(`Failed to load "${filePath}"`);
        console.error(e);
    }

    return [];
}
