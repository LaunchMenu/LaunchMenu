import React from "react";
import {parse, compile, evaluate, format, MathNode} from "mathjs";
import {IEvaluationResult} from "./_types/IEvaluationResult";
import {IPrettyPrintResult} from "./_types/IPrettyPrintResult";
import {
    IHighlightError,
    IHighlightNode,
    ReactMarkdown,
    SettingsContext,
} from "@launchmenu/core";
import {settings} from ".";
import {IDataHook} from "model-react";
import {Latex} from "./Latex";
import {isSyntaxError} from "./_types/errors/ISyntaxError";

/** A wrapper around mathjs */
export namespace Interpreter {
    /**
     * Extracts the highlight data from the given syntax
     * @param syntax The syntax to highlight
     * @param hook The hook to subscribe to changes
     * @returns The highlight nodes and possibly syntax and or semantic errors
     */
    export function highlight(
        syntax: string,
        hook?: IDataHook
    ): {nodes: IHighlightNode[]; errors: IHighlightError[]} {
        // TODO: perform proper highlighting, also figure out parsing errors and highlight them

        return {nodes: [], errors: []};
    }

    /**
     * Pretty prints the given input to a result
     * @param input The input to be pretty printed
     * @returns The result
     */
    export function prettyPrint(input: string): IPrettyPrintResult {
        try {
            const resultTex = parse(input).toTex({});
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
     * @param precision The precision for the calculation
     * @param hook The data hook to subscribe to changed
     * @returns The result or an error
     */
    export function evaluate(
        expression: string,
        settingsContext?: SettingsContext,
        hook?: IDataHook
    ): IEvaluationResult {
        const s = settingsContext?.get(settings);
        let roundTo = s?.roundTo.get(hook) ?? 10;

        // TODO: add percentage support
        // TODO: add date manipulation functions (now(), subtract, etc.)
        // TODO: add feet/inch pattern support
        // TODO: add scope parameter passing
        // TODO: monetary units

        try {
            let node: MathNode;
            ({node, expression} = getBracketCorrectedNode(expression));
            const result = node.compile().evaluate({shit: 4});
            const formatted = format(result, {precision: roundTo});
            const resultTex = parse(formatted).toTex({}); //parenthesis: "keep", implicit: "hide"?

            return {
                expression,
                result: {
                    raw: result,
                    text: formatted,
                    formatted: <Latex latex={resultTex} fallback={formatted} />,
                },
            };
        } catch (e) {
            return {error: e};
        }
    }

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
                return {node: parse(expression), expression};
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
//options: {parenthesis: 'keep', implicit: 'hide'}
