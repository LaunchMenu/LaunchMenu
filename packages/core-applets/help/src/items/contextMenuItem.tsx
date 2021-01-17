import React from "react";
import {baseSettings, Box, LFC, useIOContext} from "@launchmenu/core";
import {createHelpItem} from "../createHelpItem";
import {KeyPatternIcon} from "./navigation/KeyPatternIcon";
import {useDataHook} from "model-react";

export const ContextMenuItemContent: LFC = () => {
    const [h] = useDataHook();
    const context = useIOContext();
    const controls = context?.settings.get(baseSettings).controls;

    const openContextMenuPattern = controls?.menu.openContextMenu.get(h);
    const executePattern = controls?.menu.execute.get(h);
    const selectPattern = controls?.menu.selectItem.get(h);

    return (
        <Box>
            <Box marginBottom="medium">
                Every item in LaunchMenu has a context menu. This menu can be opened using{" "}
                {openContextMenuPattern && (
                    <KeyPatternIcon patterns={openContextMenuPattern} />
                )}
                .
            </Box>
            <Box marginBottom="medium">
                Pressing {executePattern && <KeyPatternIcon patterns={executePattern} />}{" "}
                will perform the same action as the "execute" action that shows in the
                context menu. Depending on the selected item, the name might be different
                to be more appropriate, such as "open".
            </Box>
            <Box marginBottom="medium">
                Multiple items can be selected at once, by pressing{" "}
                {selectPattern && <KeyPatternIcon patterns={selectPattern} />} to toggle
                the selection at the cursor, or holding it while moving the cursor up and
                down. When the context menu is opened, it will consider the full item
                selection, and each action will execute for all items.
            </Box>
        </Box>
    );
};

export const contextMenuItem = createHelpItem({
    name: "Context menu",
    content: <ContextMenuItemContent />,
});
