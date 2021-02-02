import {baseSettings, Box, LFC, useIOContext} from "@launchmenu/core";
import {useDataHook} from "model-react";
import React from "react";
import {createHelpItem} from "../../createHelpItem";
import {KeyPatternTable} from "./KeyPatternDescription";

export const NavigationItemContent: LFC = () => {
    const [h] = useDataHook();
    const context = useIOContext();
    const controls = context?.settings.get(baseSettings).controls;
    if (!controls) return <Box style={{color: "red"}}>Control's couldn't be loaded</Box>;

    return (
        <Box>
            <Box marginBottom="medium">
                The following keys can be used for navigation:
            </Box>
            <KeyPatternTable
                patterns={[
                    {
                        pattern: [controls.menu.up.get(h), controls.menu.down.get(h)],
                        description: "Move the cursor up and down",
                    },
                    {
                        pattern: [controls.menu.execute.get(h)],
                        description: "Execute the selected items",
                    },
                    {
                        pattern: [controls.menu.selectItem.get(h)],
                        description: "Select item (combinable with up/down)",
                    },
                    {
                        pattern: [controls.menu.openContextMenu.get(h)],
                        description: "Open the context menu",
                    },
                    null,
                    {
                        pattern: [controls.back.get(h)],
                        description: "Clear search/exit layer",
                    },
                    {
                        pattern: [
                            controls.content.contentUp.get(h),
                            controls.content.contentDown.get(h),
                        ],
                        description: "Scroll content up and down",
                    },
                ]}
            />
        </Box>
    );
};

export const navigationItem = createHelpItem({
    name: "Navigation",
    content: <NavigationItemContent />,
});
