import React, {cloneElement, FC, useMemo} from "react";

import {
    Box,
    copyAction,
    copyExitPasteHandler,
    copyTextHandler,
    createAction,
    createNumberSetting,
    createOptionSetting,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    createStandardSearchPatternMatcher,
    declare,
    FillBox,
    Priority,
    ErrorMessage,
    useIOContext,
} from "@launchmenu/core";
import {BiCalculator} from "react-icons/bi";
import {useDataHook} from "model-react";
import {Interpreter} from "./Interpreter";
import {useResizeDetector} from "react-resize-detector";
import {info} from "./info";

export const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {
                roundTo: createNumberSetting({
                    name: "Round to",
                    description: "Number of decimal places to round to.",
                    init: 10,
                    tags: ["calculator", "round", "decimal places"],
                }),
                parenthesis: createOptionSetting({
                    name: "Parenthesis display mode",
                    init: "keep" as "keep" | "auto" | "all",
                    options: ["keep", "auto", "all"] as const,
                    createOptionView: option =>
                        createStandardMenuItem({
                            name: option,
                            description: {
                                keep: "Keep the parentheses from the input and display them as is.",
                                auto: "Only display parentheses that are necessary. Mathjs tries to get rid of as much parentheses as possible.",
                                all: "Display all parentheses that are given by the structure of the node tree. This makes the output precedence unambiguous.",
                            }[option],
                        }),
                }),
                multiplicationDot: createOptionSetting({
                    name: "Multiplication display mode",
                    init: "hide" as "show" | "hide",
                    options: ["show", "hide"] as const,
                    createOptionView: option =>
                        createStandardMenuItem({
                            name: option,
                            description: {
                                show: "Display multiplication like 2 • a.",
                                hide: "Display multiplication like 2a.",
                            }[option],
                        }),
                }),
                // TODO: add scope setting that allows for editing and testing of scope variables
            },
        }),
});

const Content: FC<{query: string; result: JSX.Element}> = ({query, result}) => {
    const {ref: resizeRef, width} = useResizeDetector();

    const context = useIOContext();
    const prettyPrintResult = useMemo(
        () => Interpreter.prettyPrint(query, context?.settings),
        [query]
    );
    const prettyPrint = useMemo(
        () =>
            "formatted" in prettyPrintResult
                ? cloneElement(prettyPrintResult.formatted, {key: Math.random()})
                : query,
        [prettyPrintResult, width]
    );
    const resultEl = useMemo(() => cloneElement(result), [result, width]); // Forces react to rerender result when width changes

    return (
        <FillBox
            display="flex"
            justifyContent="center"
            alignItems="center"
            padding="extraLarge"
            elRef={resizeRef}>
            <Box flexGrow={1} css={{maxWidth: "100%", fontSize: "25px"}}>
                <Box
                    color="fontBgSecondary"
                    textAlign="center"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    flexWrap="wrap">
                    {prettyPrint}{" "}
                    <Box display="inline-block" marginLeft="small">
                        =
                    </Box>
                </Box>
                <Box
                    borderBottom="normal"
                    borderColor="fontBgSecondary"
                    opacity={0.2}
                    marginY="small"
                />
                <Box textAlign="center" color="primary">
                    {resultEl}
                </Box>
            </Box>
        </FillBox>
    );
};

const searchPatternMatcher = createStandardSearchPatternMatcher({
    name: "Calculator",
    matcher: /^=/,
});

export default declare({
    info,
    settings,
    async search(query, hook) {
        if (query.search == "") return {};

        const patternMatch = searchPatternMatcher(query, hook);

        //Get result as string
        const calculation = patternMatch?.searchText ?? query.search;
        const output = Interpreter.evaluate(calculation);
        if ("result" in output) {
            const {result, expression} = output;
            return {
                patternMatch,
                item: {
                    //Top priority
                    priority: /[0-9\-]+/.test(query.search)
                        ? Priority.HIGH
                        : Priority.EXTRAHIGH,

                    //Create returned item
                    item: createStandardMenuItem({
                        name: `= ${result.text}`,
                        icon: <BiCalculator />,
                        content: <Content query={expression} result={result.formatted} />,
                        actionBindings: [
                            copyExitPasteHandler.createBinding({
                                copy: copyTextHandler.createBinding(result.text),
                            }),
                            copyAction.createBinding(
                                copyTextHandler.createBinding(result.text)
                            ),
                        ],
                        TextHighlighter: null,
                    }),
                },
            };
        } else if (patternMatch) {
            return {
                patternMatch,
                item: {
                    //Top priority
                    priority: /[0-9\-]+/.test(query.search)
                        ? Priority.HIGH
                        : Priority.EXTRAHIGH,
                    item: createStandardMenuItem({
                        name: output.error.name,
                        icon: <BiCalculator />,
                        content: (
                            <ErrorMessage background={undefined}>
                                {output.error.message}
                            </ErrorMessage>
                        ),
                        TextHighlighter: null,
                    }),
                },
            };
        } else {
            return {};
        }
    },
});
