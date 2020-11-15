import React from "react";
import {useIOContext} from "../../context/react/useIOContext";
import {IShortcutInput} from "../../menus/items/_types/IShortcutInput";
import {LFC} from "../../_types/LFC";
import {Note} from "../Note";

/**
 * A label for a given shortcut
 */
export const ShortcutLabel: LFC<{shortcut: IShortcutInput}> = ({shortcut}) => {
    const ioContext = useIOContext();
    return (
        <Note>
            {(shortcut instanceof Function
                ? ioContext
                    ? shortcut(ioContext)
                    : ""
                : shortcut
            ).toString()}
        </Note>
    );
};
