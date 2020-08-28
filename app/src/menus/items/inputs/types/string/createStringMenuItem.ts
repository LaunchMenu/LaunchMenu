import {createFieldMenuItem} from "../../createFieldMenuItem";
import {IFieldMenuItem} from "../../_types/IFieldMenuItem";
import {IStringMenuItemData} from "./_types/IStringMenuItemData";
import {inputFieldExecuteHandler} from "../../../../../textFields/types/inputField/InputFieldExecuteHandler";

/**
 * Creates a new string menu item
 * @param data The configuration data of the field
 * @returns The menu item
 */
export function createStringMenuItem({
    default: def,
    name,
    actionBindings = [],
    checkValidity,
    tags = [],
    ...rest
}: IStringMenuItemData): IFieldMenuItem<string> {
    // return createFieldMenuItem({default: def, name, tags: ["field", ...tags], actionBindings: [...actionBindings, inputFieldExecuteHandler.createBinding({context})]});
    return null as any;
}
