import {
    Box,
    Button,
    IField,
    IPosition,
    Observer,
    useDataHook,
    WindowManager,
} from "@launchmenu/core";
import React, {FC, useEffect} from "react";

/**
 * A component for showing content to control the window position
 */
export const PositionInputContent: FC<{
    windowManager: IField<null | WindowManager>;
    field: IField<IPosition>;
}> = ({windowManager, field}) => {
    const [h] = useDataHook();
    const manager = windowManager.get(h);
    useEffect(() => {
        if (!manager) return;
        const observer = new Observer(h => manager.getPosition(h)).listen(position =>
            field.set(position)
        );
        return () => observer.destroy();
    }, [manager]);

    const setPosition = (position: IPosition) => {
        if (!manager) return;
        // Find the display to put the window in
        const displays = manager.getDisplays();
        const {x, y} = field.get();
        const display =
            displays.all.find(
                display =>
                    display.x <= x &&
                    display.x + display.width > x &&
                    display.y <= y &&
                    display.y + display.height > y
            ) || displays.primary;

        // Find the exact coordinates
        const windowWidth = window.document.body.clientWidth;
        const windowHeight = window.document.body.clientHeight;
        const newX = display.x + (display.width - windowWidth) * position.x;
        const newY = display.y + (display.height - windowHeight) * position.y;

        // Update the position
        field.set({x: newX, y: newY});
    };

    const positions = [
        [
            {x: 0, y: 0, name: "top left"},
            {x: 0.5, y: 0, name: "top"},
            {x: 1, y: 0, name: "top right"},
        ],
        [
            {x: 0, y: 0.5, name: "left"},
            {x: 0.5, y: 0.5, name: "middle"},
            {x: 1, y: 0.5, name: "right"},
        ],
        [
            {x: 0, y: 1, name: "bottom left"},
            {x: 0.5, y: 1, name: "bottom"},
            {x: 1, y: 1, name: "bottom right"},
        ],
    ];
    return (
        <Box>
            <Box
                padding="medium"
                background="secondary"
                borderRadius="small"
                css={{WebkitAppRegion: "drag", WebkitUserSelect: "none"} as any}>
                Click and drag here to move the window
            </Box>
            <Box>
                <Box marginY="medium">
                    Or click one of the buttons below to snap to a position
                </Box>
                <Box display="flex" flexDirection="column" gap="small">
                    {positions.map((row, i) => (
                        <Box display="flex" gap="small" key={i}>
                            {row.map(({x, y, name}, j) => (
                                <Button
                                    flexGrow={1}
                                    onClick={() => setPosition({x, y})}
                                    key={j}>
                                    {name}
                                </Button>
                            ))}
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};
