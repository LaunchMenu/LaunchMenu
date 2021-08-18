import React from "react";
import {create, all, format, MathNode} from "mathjs";
import {IEvaluationResult} from "./_types/IEvaluationResult";
import {IPrettyPrintResult} from "./_types/IPrettyPrintResult";
import {constGetter, SettingsContext} from "@launchmenu/core";
import {settings} from ".";
import {IDataHook} from "model-react";
import {Latex} from "./Latex";
import {isSyntaxError} from "./_types/errors/ISyntaxError";

/** A wrapper around mathjs */
export namespace Interpreter {
    const math = constGetter(() => {
        const math = create(all);
        return math;
    });

    /**
     * Pretty prints the given input to a result
     * @param input The input to be pretty printed
     * @param settingsContext The context to get the settings from
     * @param hook The data hook to subscribe to changed
     * @returns The result
     */
    export function prettyPrint(
        input: string,
        settingsContext: SettingsContext = new SettingsContext(),
        hook?: IDataHook
    ): IPrettyPrintResult {
        const s = settingsContext.get(settings);
        try {
            const resultTex = math().parse!(input).toTex({
                implicit: s.multiplicationDot.get(hook),
                parenthesis: s.parenthesis.get(hook),
            });
            return {
                formatted: <Latex maxWidth="100%" latex={resultTex} fallback={input} />,
            };
        } catch (e) {
            return {error: e};
        }
    }

    /**
     * Evaluates the given expression
     * @param expression The expression to evaluate
     * @param settingsContext The context to get the settings from
     * @param hook The data hook to subscribe to changed
     * @returns The result or an error
     */
    export function evaluate(
        expression: string,
        settingsContext: SettingsContext = new SettingsContext(),
        hook?: IDataHook
    ): IEvaluationResult {
        const s = settingsContext.get(settings);
        const roundTo = s.roundTo.get(hook);

        try {
            let node: MathNode;
            ({node, expression} = parse(expression));
            const result = node.compile().evaluate();
            const formatted = format(result, {precision: roundTo});
            const parsedResult = math().parse!(formatted);
            const cleanedParsedResult = parsedResult;
            const resultTex = cleanedParsedResult.toTex({
                implicit: s.multiplicationDot.get(hook),
                parenthesis: s.parenthesis.get(hook),
            });

            return {
                expression,
                result: {
                    raw: result,
                    text: formatted,
                    formatted: <Latex latex={resultTex} fallback={formatted} />,
                },
            };
        } catch (e) {
            // console.error(e);
            return {error: e};
        }
    }

    // Manual improvements
    /**
     * Parses the input, and takes care of any required preprocessing steps
     * @param expression The expression to parse
     * @returns The parsed expression
     */
    function parse(expression: string): {
        node: MathNode;
        expression: string;
    } {
        return getBracketCorrectedNode(expression);
    }

    // Bracket recovery preprocessing
    /**
     * Retrieves the expression node, and applies bracket correction if needed
     * @param expression The expression to get the node for
     * @returns The obtained node, and the corrected suggestion
     * @throws Exceptions if failed to parse
     */
    function getBracketCorrectedNode(expression: string): {
        node: MathNode;
        expression: string;
    } {
        while (true) {
            try {
                return {node: math().parse!(expression), expression};
            } catch (e) {
                if (isSyntaxError(e)) {
                    const char = expression[e.char - 1];
                    if (char == ")") expression = "(" + expression;
                    else if (e.message.includes("Parenthesis ) expected"))
                        expression = expression + ")";
                    else throw e;
                } else {
                    throw e;
                }
            }
        }
    }
}
