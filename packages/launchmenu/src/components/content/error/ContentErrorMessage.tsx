import React, {FC} from "react";
import {usePreviousStackItem} from "../../../stacks/viewStack/usePreviousStackItem";
import {FillBox} from "../../FillBox";
import {ErrorMessage} from "./ErrorMessage";
import {Box} from "../../../styling/box/Box";

export const ContentErrorMessage: FC = ({children, ...rest}) => {
    const prevItem = usePreviousStackItem(rest);
    return (
        <FillBox display="flex" flexDirection="column">
            <ErrorMessage>{children}</ErrorMessage>
            <Box flexGrow={1}>{prevItem}</Box>
        </FillBox>
    );
};
