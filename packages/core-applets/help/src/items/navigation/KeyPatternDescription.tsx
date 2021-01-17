import React from "react";
import {Box, KeyPattern, LFC} from "@launchmenu/core";
import {KeyPatternIcon} from "./KeyPatternIcon";

/**
 * A component to show the description of a keyboard shortcut
 */
export const KeyPatternDescription: LFC<{
    description: string;
    patterns: KeyPattern[] | KeyPattern;
}> = ({patterns, description}) => (
    <Box marginBottom="small" as="tr">
        <td style={{minWidth: 90, maxWidth: 140}}>
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
    <table>
        <tbody>
            {patterns.map((pattern, i) =>
                pattern ? (
                    <KeyPatternDescription
                        patterns={pattern.pattern}
                        description={pattern.description}
                        key={i}
                    />
                ) : (
                    <tr style={{height: 20}} key={i} />
                )
            )}
        </tbody>
    </table>
);
