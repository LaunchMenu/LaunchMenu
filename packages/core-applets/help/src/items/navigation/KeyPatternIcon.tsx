import React, {Fragment} from "react";
import {Box, KeyPattern, LFC} from "@launchmenu/core";

/**
 * A component to visualize a key pattern
 */
export const KeyPatternIcon: LFC<{patterns: KeyPattern | string | string[]}> = ({
    patterns,
}) => {
    const normalizedPatterns =
        patterns instanceof KeyPattern
            ? patterns.patterns.map(({pattern}) => pattern)
            : patterns instanceof Array
            ? patterns.map(k => k.split("+"))
            : [patterns.split("+")];

    const uis = normalizedPatterns.map((pattern, i) => (
        <Fragment key={i}>
            {pattern
                .map((key, j) => (
                    <Box
                        display="inline-block"
                        key={j}
                        padding="extraSmall"
                        paddingX="small"
                        background="bgPrimary"
                        borderColor="bgTertiary"
                        border="thick"
                        borderTopWidth={0}>
                        {key}
                    </Box>
                ))
                .reduce(
                    (items, item) => (items.length > 0 ? [...items, "+", item] : [item]),
                    []
                )}
        </Fragment>
    ));

    if (uis.length > 1) {
        return (
            <>
                {uis.reduce((patterns, pattern) => {
                    const wrappedPattern = (
                        <Box
                            display="inline-block"
                            background="bgTertiary"
                            padding="extraSmall">
                            {pattern}
                        </Box>
                    );
                    return patterns.length > 0
                        ? [...patterns, " / ", wrappedPattern]
                        : [wrappedPattern];
                }, [])}
            </>
        );
    } else {
        return uis[0];
    }
};
