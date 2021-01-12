import {useDataHook} from "model-react";
import React from "react";
import {useIOContext} from "../../context/react/useIOContext";
import {IShortcutInput} from "../../menus/items/_types/IShortcutInput";
import {LFC} from "../../_types/LFC";
import {Note} from "../Note";

/**
 * A label for a given shortcut
 */
export const ShortcutLabel: LFC<{
    shortcut: IShortcutInput;
    /** Whether to explicitly show that the pattern is empty */
    explicitEmpty?: boolean;
}> = ({shortcut, explicitEmpty}) => {
    const ioContext = useIOContext();
    const [h] = useDataHook();
    const sc =
        shortcut instanceof Function
            ? ioContext
                ? shortcut(ioContext, h)
                : undefined
            : shortcut;
    return (
        <Note>
            {sc?.patterns.length == 0
                ? explicitEmpty
                    ? "None"
                    : ""
                : sc?.toString() ?? ""}
        </Note>
    );
};
