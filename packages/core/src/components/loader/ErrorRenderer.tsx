import React from "react";
import {Box} from "../../styling/box/Box";
import {IBoxProps} from "../../styling/box/_types/IBoxProps";
import {mergeStyles} from "../../utils/mergeStyles";
import {LFC} from "../../_types/LFC";

/**
 * Displays the given error with some error styling
 */
export const ErrorRenderer: LFC<{error: any} & IBoxProps> = ({error, ...rest}) => {
    if (error instanceof Error && error.stack) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                {...rest}
                css={mergeStyles({color: "red"}, rest.css)}>
                {error.stack.split("\n").map((item, i) => (
                    <Box
                        key={i}
                        css={
                            i > 0
                                ? theme => ({
                                      marginLeft: 2 * theme.spacing.medium,
                                      textIndent: -theme.spacing.medium,
                                  })
                                : undefined
                        }>
                        {item}
                    </Box>
                ))}
            </Box>
        );
    }

    return (
        <Box {...rest} css={mergeStyles({color: "red"}, rest.css)}>
            {error}
        </Box>
    );
};
