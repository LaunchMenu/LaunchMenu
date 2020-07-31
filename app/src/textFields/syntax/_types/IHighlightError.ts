/**
 * Error message information
 */
export type IHighlightError = {
    /** The human readable error message */
    message: string;
    /** An identifier type that can be used to recognize the kind of error */
    type: any;
    /** The range of the text that caused the error */
    syntaxRange: {
        start: number;
        end: number;
        text: string;
    };
};
