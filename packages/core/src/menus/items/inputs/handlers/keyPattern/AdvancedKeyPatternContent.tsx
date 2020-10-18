import React from "react";
import {IDataRetriever, useDataHook} from "model-react";
import {KeyPattern} from "../../../../../keyHandler/KeyPattern";
import {Box} from "../../../../../styling/box/Box";
import {Truncated} from "../../../../../components/Truncated";
import {LFC} from "../../../../../_types/LFC";

// TODO: add proper styling
/**
 * The content to summary a key pattern
 */
export const AdvancedKeyPatternContent: LFC<{pattern: IDataRetriever<KeyPattern>}> = ({
    pattern: patternGetter,
}) => {
    const [h] = useDataHook();
    const pattern = patternGetter(h);
    return (
        <Box padding="small">
            <Box font="header">Key Pattern</Box>
            {pattern.patterns.map((pattern, i) => {
                const extra =
                    pattern.allowExtra &&
                    pattern.allowExtra.length > 0 &&
                    pattern.allowExtra.join(", ");
                return (
                    <Box key={i} marginTop="medium">
                        {KeyPattern.toStringPattern(pattern.pattern)} on {pattern.type}
                        {extra && (
                            <Box font="paragraph">
                                {" "}
                                with optionally{" "}
                                <Truncated title={extra}>{extra}</Truncated>
                            </Box>
                        )}
                    </Box>
                );
            })}
        </Box>
    );
};
