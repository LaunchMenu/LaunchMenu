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
    useIOContext,
} from "@launchmenu/core";
import {BiCalculator} from "react-icons/bi";
import {useDataHook} from "model-react";
import {Interpreter} from "./Interpreter";
import {useResizeDetector} from "react-resize-detector";

const info = {
    name: "Calculator",
    description: "Perform simple calculations in LaunchMenu",
    version: "0.0.0",
    icon: <BiCalculator />,
    tags: ["launchmenu-applet", "calculator"],
};

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
                implicit: createOptionSetting({
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

    const prettyPrintResult = useMemo(() => Interpreter.prettyPrint(query), [query]);
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

// const math = new MathInterpreter();

const searchPatternMatcher = createStandardSearchPatternMatcher({
    name: "Calculator",
    matcher: /^=/,
    highlighter: Interpreter,
});

// const res = parser.execute(field.get());
// if (res.result) alert(res.result);
// else alert("Parsing error!");

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
                        name: result.text,
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
        } else {
            return {};
        }
    },
});
