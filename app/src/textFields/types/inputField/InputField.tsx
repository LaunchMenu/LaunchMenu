import React from "react";
import {TextField} from "../../TextField";
import {Field, IDataHook} from "model-react";
import {IInputFieldConfig} from "./_types/IInputFieldConfig";
import {IIOContext} from "../../../context/_types/IIOContext";
import {IInputFieldError} from "./_types/IInputFieldError";
import {openUI} from "../../../context/openUI/openUI";
import {IHighlighter} from "../../syntax/_types/IHighlighter";
import {plaintextLexer} from "../../syntax/plaintextLexer";
import {IField} from "../../../_types/IField";
import {ContentErrorMessage} from "../../../components/content/ContentErrorMessage";
import {IViewStackItem} from "../../../stacks/_types/IViewStackItem";

/**
 * A text field that displays error messages if the user input doesn't match a specified constraint
 */
export class InputField<T> extends TextField {
    protected target: IField<T>;
    protected context: IIOContext | undefined;
    protected config: IInputFieldConfig<T>;

    protected error = new Field(null as null | IInputFieldError);
    protected closeError?: () => void;

    /**
     * Creates a new input field
     * @param field The data field to target
     * @param context The context to open the content with error in
     * @param config The configuration for the field
     */
    public constructor(
        field: IField<T>,
        context: IIOContext,
        config: IInputFieldConfig<T> & {checkValidity: Function}
    );

    /**
     * Creates a new input field
     * @param field The field to target
     * @param config The configuration for the field
     */
    public constructor(
        field: IField<T>,
        config: IInputFieldConfig<T> & {checkValidity?: undefined}
    );
    public constructor(
        field: IField<T>,
        context?: IIOContext | IInputFieldConfig<T>,
        config?: IInputFieldConfig<T>
    ) {
        super();
        this.target = field;

        if (config) {
            this.context = context as any;
            this.config = (config || {liveUpdate: true}) as any;
        } else {
            this.config = (context || {liveUpdate: true}) as any;
        }

        this.setInitialValue();
    }

    /**
     * Sets the initial value of the field
     */
    protected setInitialValue(): void {
        const value = this.target.get(null);
        this.set(this.config.serialize?.(value) ?? ((value as any) as string));
    }

    /**
     * Sets the new value of the input
     * @param value The value to set
     */
    public set(value: string): void {
        super.set(value);
        if (this.config.liveUpdate) this.updateField();

        this.updateError();
    }

    /**
     * Commits the current text value to the target field, if the input value is valid
     * @returns Whether the input was valid
     */
    public updateField(): boolean {
        // Check whether the input is valid, and return if it isn't
        const inp = this.get();
        if (this.checkError(inp)) return false;

        // Update the value
        let value = this.config.deserialize ? this.config.deserialize(inp) : inp;
        this.target.set(value as T);
        return true;
    }

    // Error handling
    /**
     * Retrieves the error message for the current input if any
     * @param text The text to retrieve the error for
     * @returns The error
     */
    protected checkError(text?: string): IInputFieldError | null {
        return this.config.checkValidity?.(text ?? this.get()) || null;
    }

    /**
     * Updates the error and shows the UI
     * @returns The new error if any
     */
    protected updateError(): IInputFieldError | null {
        const error = this.checkError();
        this.error.set(error);

        this.closeError?.();
        if (error && this.context) {
            let errorView: IViewStackItem;
            if ("view" in error) errorView = error.view;
            else
                errorView = {
                    view: <ContentErrorMessage>{error.message}</ContentErrorMessage>,
                    transparent: true,
                };

            this.closeError = openUI(this.context, {content: errorView});
        }
        return error;
    }

    /**
     * Disposes all hooks and persistent data of this input field
     */
    public destroy(): void {
        this.closeError?.();
    }

    // Getters
    /**
     * Retrieves the input error if any
     * @param hook The hook to subscribe to changes
     * @returns The error with the current input if any
     */
    public getError(hook: IDataHook = null): IInputFieldError | null {
        return this.error.get(hook);
    }

    /**
     * Retrieves the resulting value if valid, or an error otherwise
     */
    public getValue(): T | IInputFieldError {
        const inp = this.get();
        const error = this.config.checkValidity?.(inp);
        if (error) return error;
        else return (this.config.deserialize ? this.config.deserialize(inp) : inp) as T;
    }

    // Utils
    /**
     * Augments a given highlighter with the input error range
     * @param highlighter The highlighter to extend, or the plain text highlighter if left out
     * @returns The augmented highlighter
     */
    public getHighlighterWithError(
        highlighter: IHighlighter = plaintextLexer
    ): IHighlighter {
        return {
            highlight: (syntax, h) => {
                const {nodes, errors} = highlighter.highlight(syntax);
                const fieldError = this.checkError(syntax);
                this.addListener(h); // Such that we can force updates, even if the text hasn't changed
                return {
                    nodes,
                    errors: fieldError?.ranges
                        ? [
                              ...errors,
                              ...fieldError.ranges.map(({start, end}) => ({
                                  syntaxRange: {
                                      start,
                                      end,
                                      text: syntax.substring(start, end),
                                  },
                                  message:
                                      "message" in fieldError ? fieldError.message : "",
                                  type: "validity",
                              })),
                          ]
                        : errors,
                };
            },
        };
    }
}