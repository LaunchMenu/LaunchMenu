import {createHighlightTokens, HighlightParser, highlightTags} from "@launchmenu/core";
import {Lexer} from "@launchmenu/core/build/textFields/syntax/HighlightParser";
import {factorial} from "./MathHelpers";

const {tokens, tokenList} = createHighlightTokens({
    lBracket: {
        pattern: /\(/,
        tags: [highlightTags.bracket, highlightTags.left],
    },
    rBracket: {
        pattern: /\)/,
        tags: [highlightTags.bracket, highlightTags.right],
    },
    add: {pattern: /\+/, tags: [highlightTags.operator]},
    sub: {pattern: /\-/, tags: [highlightTags.operator]},
    mul: {pattern: /\*/, tags: [highlightTags.operator]},
    div: {pattern: /\//, tags: [highlightTags.operator]},
    pow: {pattern: /\^|\*\*/, tags: [highlightTags.operator]},
    percent: {pattern: /\%/, tags: [highlightTags.operator]},
    equals: {
        pattern: /\=/,
        tags: [highlightTags.operator],
    },
    factorial: {pattern: /\!/, tags: [highlightTags.operator]},
    paramSeperator: {pattern: /\,/, tags: [highlightTags.operator]},
    functionName: {pattern: /[a-zA-Z_]\w+/, tags: [highlightTags.variable]},
    value: {
        pattern: /\-?(\d*\.)?\d+/,
        tags: [highlightTags.literal, highlightTags.number],
    },
    whiteSpace: {
        pattern: /\s+/,
        tags: [highlightTags.whiteSpace],
        group: Lexer.SKIPPED,
    },
});

//assign longer_alt
tokens.mul.LONGER_ALT = tokens.pow;
tokens.sub.LONGER_ALT = tokens.value;

export default class MathInterpreter extends HighlightParser<number> {
    private flags: {approx: boolean};
    constructor() {
        super(tokenList);
        this.performSelfAnalysis();
        this.flags = {approx: false};
    }
    public variables = {};
    public functions = {
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        sinh: Math.sinh,
        cosh: Math.cosh,
        tanh: Math.tanh,
        asin: Math.asin,
        acos: Math.acos,
        atan: Math.atan,
        atan2: Math.atan2,
        asinh: Math.asinh,
        acosh: Math.acosh,
        atanh: Math.atanh,
        cbrt: Math.cbrt,
        hypot: Math.hypot,
        round: Math.round,
        sign: Math.sign,
        min: Math.min,
        max: Math.max,
        ceil: Math.ceil,
        floor: Math.floor,
        abs: Math.abs,
        exp: Math.exp,
        ln: Math.log,
        log: Math.log,
        log10: Math.log10,
        rnd: Math.random,
        modulo: (a: number, b: number): number => a - b * Math.floor(a / b),
        remainder: (a: number, b: number): number => a % b,
        sum: (...args: number[]): number => args.reduce((a, b) => a + b),
        avg: (...args: number[]): number => {
            return args.reduce((a, b) => a + b) / args.length;
        },
    } as {[key: string]: any};
    public get isApproximation(): boolean {
        return this.flags.approx;
    }

    public evaluate(query: string): number | undefined {
        this.flags = {approx: false};
        var {errors, result} = super.execute(query);
        if (errors?.length) {
            let unbalancedParens = errors.filter(e =>
                /expecting EOF but found: \)$/.test(e.message)
            );
            if (unbalancedParens.length == errors.length) {
                if (unbalancedParens.length == 1) {
                    let error = unbalancedParens[0];
                    // //@ts-ignore
                    // console.log("poopy", error, this, this.gastProductionsCache);
                    // //@ts-ignore
                    // console.log(this.computeContentAssist("expression", this.tokVector));
                }
            }
            return;
        }
        if (result) {
            return result;
        }
    }

    // Note that by default the first defined rule becomes the start rule
    // (this can be change by passing a config to the constructor)
    protected calculation = this.RULE("calculation", () => {
        this.OPTION(() => {
            this.CONSUME(tokens.equals);
        });
        return this.SUBRULE(this.expression);
    });

    protected expression = this.RULE("expression", () => {
        let result: number = this.SUBRULE(this.term);
        this.MANY(() => {
            const {tokenType} = this.OR([
                {ALT: () => this.CONSUME(tokens.add)},
                {ALT: () => this.CONSUME(tokens.sub)},
            ]);
            const value = this.SUBRULE2(this.term);
            result = tokenType == tokens.add ? result + value : result - value;
        });
        return result;
    });
    protected term = this.RULE("term", () => {
        let result = this.SUBRULE(this.powTerm);
        this.MANY(() => {
            const {tokenType} = this.OR([
                {ALT: () => this.CONSUME(tokens.mul)},
                {ALT: () => this.CONSUME(tokens.div)},
            ]);
            const value = this.SUBRULE2(this.powTerm);
            result = tokenType == tokens.mul ? result * value : result / value;
        });
        return result;
    });
    protected powTerm = this.RULE("powTerm", () => {
        let result = this.SUBRULE(this.factorialTerm);
        this.MANY(() => {
            this.CONSUME(tokens.pow);
            const value = this.SUBRULE2(this.factorialTerm);
            result = result ** value;
        });
        return result;
    });
    protected factorialTerm = this.RULE("factorialTerm", () => {
        var result = this.SUBRULE(this.factor);
        this.MANY(() => {
            this.OR([
                {
                    ALT: () => {
                        this.CONSUME(tokens.factorial);
                        let data = factorial(result);
                        this.ACTION(() => {
                            //Set approximation flag
                            this.flags.approx = data.approx;
                        });
                        result = data.result;
                    },
                },
                {
                    ALT: () => {
                        this.CONSUME(tokens.percent);
                        result = result / 100;
                    },
                },
            ]);
        });
        return result;
    });
    protected params = this.RULE("params", () => {
        this.CONSUME(tokens.lBracket);
        let params: number[] = [];
        this.OPTION(() => {
            params.push(this.SUBRULE(this.expression));
            this.MANY(() => {
                this.CONSUME(tokens.paramSeperator);
                params.push(this.SUBRULE2(this.expression));
            });
        });
        this.CONSUME(tokens.rBracket);
        return params;
    });
    protected factor = this.RULE("factor", () =>
        this.OR([
            {
                ALT: () => {
                    let functionName = this.CONSUME(tokens.functionName).image.toString();
                    let params = this.SUBRULE(this.params);
                    if (typeof this.functions[functionName] == "function") {
                        return this.functions[functionName](...params);
                    }
                },
            },
            {
                ALT: () => {
                    this.CONSUME2(tokens.lBracket);
                    const value = this.SUBRULE3(this.expression);
                    this.CONSUME2(tokens.rBracket);
                    return value;
                },
            },
            {
                ALT: () => {
                    const {image} = this.CONSUME(tokens.value);
                    return parseFloat(image); //
                },
            },
        ])
    );
}

// const parser = new MathInterpreter();
// const res = parser.execute("1*5!/10^3");
// if (res.result) alert(res.result);
// else alert("Parsing error!");
