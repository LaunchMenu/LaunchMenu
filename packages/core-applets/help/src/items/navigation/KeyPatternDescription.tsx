import React from "react";
import {Box, KeyPattern, LFC} from "@launchmenu/core";
import {KeyPatternIcon} from "./KeyPatternIcon";

/**
 * A component to show the description of a keyboard shortcut
 */
export const KeyPatternDescription: LFC<{
    description: string;
    patterns: KeyPattern[] | KeyPattern;
    first?: boolean;
}> = ({patterns, description, first}) => (
    <Box
        marginY="small"
        as="tr"
        borderTop={first ? undefined : "normal"}
        borderColor="bgTertiary">
        <td style={{minWidth: 90, maxWidth: 160}}>
            {(patterns instanceof Array ? patterns : [patterns])
                .map((pattern, i) => <KeyPatternIcon patterns={pattern} key={i} />)
                .reduce(
                    (items, pattern) =>
                        items.length > 0 ? [...items, ", ", pattern] : [pattern],
                    []
                )}
        </td>
        <td>{description}</td>
    </Box>
);

/**
 * A component to show multiple key patterns
 */
export const KeyPatternTable: LFC<{
    patterns: ({pattern: KeyPattern | KeyPattern[]; description: string} | null)[];
}> = ({patterns}) => (
    <table style={{borderCollapse: "collapse"}}>
        <tbody>
            {patterns.map((pattern, i) =>
                pattern ? (
                    <KeyPatternDescription
                        patterns={pattern.pattern}
                        description={pattern.description}
                        first={i == 0}
                        key={i}
                    />
                ) : (
                    <tr style={{height: 20}} key={i} />
                )
            )}
        </tbody>
    </table>
);
