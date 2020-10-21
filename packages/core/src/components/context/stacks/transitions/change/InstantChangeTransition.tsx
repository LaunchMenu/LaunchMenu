import React, {useEffect, FC, useRef} from "react";
import {FillBox} from "../../../../FillBox";
import {IChangeTransitionProps} from "./_types/IChangeTransitionProps";

/**
 * A 'transition' to instantly replace the content
 */
export const InstantChangeTransition: FC<IChangeTransitionProps> = ({
    onComplete,
    children,
    activate = true,
}) => {
    // Trigger an completion directly when the children length increases
    useEffect(() => {
        if (activate && children.length > 1) onComplete?.();
    }, [activate, children.length]);

    // Render the last child only
    return (
        <FillBox overflow="hidden">
            {/* TODO: always render all children, but just change the order to show the correct one on top */}
            {children[activate ? 0 : children.length - 1]}
        </FillBox>
    );
};
