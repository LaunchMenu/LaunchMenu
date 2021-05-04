import {createStandardMenuItem, IMenuItem} from "@launchmenu/core";
import Path from "path";
import {videoScriptSymbol} from "./declareVideoScript";
import {recordExecuteHandler} from "./recordExecuteHandler";
import {recordPatternMatcher} from "./recordPatternMatcher";
import {watchRecordAction} from "./watchRecordAction";
import {IRecordScriptDeclaration} from "./_types/IRecordScriptDeclaration";

/**
 * Creates a menu item used for recording videos for the specified property
 * @param config The recording script config
 * @returns The video recorder item
 */
export function createVideoRecorderItem({
    propName,
    path,
}: {
    /** The name of the property to use */
    propName: string;
    /** The file path */
    path: string;
}): IMenuItem | undefined {
    try {
        const recordings = require(path);
        const declaration = recordings[propName] as IRecordScriptDeclaration | null;
        const script = declaration?.script;
        if (!script || declaration?.type != videoScriptSymbol) return;

        const name =
            propName == "default" ? Path.parse(Path.basename(path)).name : propName;
        const spacedName = name.replace(
            /(?!^.)([A-Z])(?=[a-z])|(?<=[a-z])(?=[A-Z])/g,
            c => ` ${c.toLowerCase()}`
        );

        return createStandardMenuItem({
            name: `Record: ${spacedName}`,
            searchPattern: recordPatternMatcher,
            actionBindings: [
                recordExecuteHandler.createBinding(script),
                watchRecordAction.createBinding({
                    path,
                    propName,
                    name: spacedName,
                    watchDir: declaration.watchDir,
                }),
            ],
        });
    } catch (e) {
        console.error(`Failed to load "${path}"`);
        console.error(e);
    }
}
