import React from "react";
import Path from "path";
import {remote} from "electron";
import {createFieldMenuItem} from "../createFieldMenuItem";
import {IFieldMenuItem} from "../_types/IFieldMenuItem";
import {Field, Loader} from "model-react";
import {adjustSubscribable} from "../../../../utils/subscribables/adjustSubscribable";
import {adjustBindings} from "../../adjustBindings";
import {ISettingConfigurer} from "../../../../settings/_types/ISettingConfigurer";
import {IFileMenuItemData} from "./_types/IFileMenuItemData";
import {fileInputExecuteHandler} from "../handlers/file/fileInputExecuteHandler";
import {createCallbackHook} from "../../../../utils/createCallbackHook";

/**
 * Creates a new file menu item
 * @param data The configuration data of the field
 * @returns The menu item
 */
export function createFileMenuItem({
    init,
    name,
    liveUpdate,
    undoable,
    folder,
    actionBindings = [],
    tags = [],
    resetUndoable = undoable,
    ...rest
}: IFileMenuItemData): IFieldMenuItem<string> & ISettingConfigurer {
    const initPath = Path.join(remote.app.getPath("documents"), init);
    const field = new Field(initPath);

    // Listen for the field value being changed
    let changed = false;
    const [hook] = createCallbackHook(() => {
        changed = true;
    });
    field.get(hook);

    return {
        ...createFieldMenuItem({
            field,
            data: field => ({
                name,
                valueView: (
                    <Loader>{h => abbreviatePath(field.get(h).toString())}</Loader>
                ),
                tags: adjustSubscribable(tags, (tags, h) => [
                    "field",
                    ...tags,
                    field.get(h).toString(),
                ]),
                resetUndoable,
                actionBindings: adjustBindings(actionBindings, [
                    fileInputExecuteHandler.createBinding({
                        field,
                        folder,
                        undoable,
                    }),
                ]),
                ...rest,
            }),
        }),
        // Allow configuration of the absolute base path
        configure: (data: {[fileInputBasePathConfigurationSymbol]?: string}) => {
            const basePath = data[fileInputBasePathConfigurationSymbol];
            if (!changed && basePath && !Path.isAbsolute(init))
                field.set(Path.join(basePath, init));
        },
    };
}

/** The symbol that the base path of files for field configuration is stored under*/
export const fileInputBasePathConfigurationSymbol = Symbol("File base path");

/**
 * A function to abbreviate a file path
 * @param path The path to be abbreviated
 * @returns THe abbreviated path
 */
export function abbreviatePath(path: string, length: number = 15): string {
    if (path.length <= length) return path;
    const pl = length - 3;
    return `...${path.substr(path.length - pl, pl)}`;
}
