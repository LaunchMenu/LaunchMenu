import {baseSettings} from "../../../../application/settings/baseSettings/baseSettings";
import {createContextAction} from "../../../contextMenuAction/createContextAction";
import {addBindingCreatorRequirement} from "../../../utils/addBindingCreatorRequirement";
import {IActionBinding} from "../../../_types/IActionBinding";
import {copyExecuteHandler} from "./copyExecuteHandler";

/**
 * A dedicated context menu copy action
 */
export const copyAction = addBindingCreatorRequirement(
    createContextAction({
        name: "Copy",
        contextItem: {
            icon: "copy",
            shortcut: context =>
                context.settings.get(baseSettings).controls.shortcuts.copy.get(),
        },
        core: (actionBindings: IActionBinding[]) => ({
            actionBindings,
        }),
    }),
    copyExecuteHandler
);
