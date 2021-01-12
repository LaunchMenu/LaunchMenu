import React, {ReactNode} from "react";
import {Field, IDataHook, ManualSourceHelper, Observer} from "model-react";
import {IIOContext} from "../../../context/_types/IIOContext";
import {plaintextLexer} from "../../../textFields/syntax/plaintextLexer";
import {IHighlighter} from "../../../textFields/syntax/_types/IHighlighter";
import {TextField} from "../../../textFields/TextField";
import {IField} from "../../../_types/IField";
import {AbstractUILayer} from "../../AbstractUILayer";
import {IUILayerFieldData} from "../../_types/IUILayerFieldData";
import {v4 as uuid} from "uuid";
import {TextFieldView} from "../../../components/fields/TextFieldView";
import {ITextField} from "../../../textFields/_types/ITextField";
import {IViewStackItem} from "../../_types/IViewStackItem";
import {IInputConfig} from "./_types/IInputConfig";
import {IKeyEventListener} from "../../../keyHandler/_types/IKeyEventListener";
import {createTextFieldKeyHandler} from "../../../textFields/interaction/keyHandler/createTextFieldKeyHandler";
import {IInputError} from "./_types/IInputError";
import {IUILayerContentData} from "../../_types/IUILayerContentData";
import {createContentError} from "../../../components/content/error/createContentError";
import {mergeKeyListeners} from "../../../keyHandler/mergeKeyListeners";
import {baseSettings} from "../../../application/settings/baseSettings/baseSettings";
import {SetFieldCommand} from "../../../undoRedo/commands/SetFieldCommand";

export class Input<T> extends AbstractUILayer {
    protected target: IField<T>;
    protected config: IInputConfig<T>;

    protected fieldData = new Field(null as null | IUILayerFieldData);
    protected contentData = new Field(null as null | IUILayerContentData);

    protected error = new Field(null as null | IInputError);
    protected errorListeners = new ManualSourceHelper();

    /**
     * Creates a new input field
     * @param field The field to target
     */
    public constructor(field: T extends string ? IField<T> : never);

    /**
     * Creates a new input field
     * @param field The field to target
     * @param config The configuration for the field
     */
    public constructor(field: IField<T>, config: IInputConfig<T>);
    public constructor(field: IField<T>, config?: IInputConfig<T>) {
        super();
        this.target = field;
        this.config = config ?? ({liveUpdate: true} as any);
        this.validateConfig();
    }

    /**
     * Checks whether the given config fulfills all the requirements
     */
    protected validateConfig() {
        if (
            typeof this.target.get() != "string" &&
            (!this.config.serialize || !this.config.serialize)
        )
            throw Error(
                "Non-string fields require a serializer and deserializer to be configured"
            );
    }

    /** @override */
    public getFieldData(hook?: IDataHook): IUILayerFieldData[] {
        const fieldData = this.fieldData.get(hook);
        return super.getFieldData(hook, fieldData ? [fieldData] : []);
    }

    /** @override */
    public getContentData(hook?: IDataHook): IUILayerContentData[] {
        const contentData = this.contentData.get(hook);
        return super.getContentData(hook, contentData ? [contentData] : []);
    }

    /** @override */
    protected initialize(context: IIOContext, close: () => void): () => void {
        if (this.fieldData.get()) throw Error("An input can only be opened in 1 context");

        // Create the field data model
        const value = this.getInitialTextValue();
        const field = new TextField(value, {start: value.length, end: value.length});

        // Obtain the field data
        const fieldData: IUILayerFieldData = {
            ID: uuid(),
            field,
            fieldView: this.getFieldView(field),
            fieldHandler: this.getFieldHandler(field, context, close),
        };

        // Listen to field changes
        const fieldObserver = new Observer(h => field.get(h)).listen(() => {
            if (this.config.liveUpdate) this.updateField();
            this.updateError();
        });

        // Open the field UI
        this.fieldData.set(fieldData);

        // Return a disposer
        return () => {
            fieldObserver.destroy();
            this.fieldData.set(null);
            this.contentData.set(null);
        };
    }

    /**
     * Retrieves the initial textual value of the field
     * @returns The initial text field value
     */
    protected getInitialTextValue(): string {
        const rawValue = this.target.get();
        return this.config.serialize?.(rawValue) ?? ((rawValue as any) as string);
    }

    /**
     * Retrieves the field view given a field
     * @param field The field to create a view for
     * @returns The created view
     */
    protected getFieldView(field: ITextField): IViewStackItem {
        return (
            <TextFieldView
                field={field}
                icon={this.config.icon}
                highlighter={this.getHighlighterWithError(this.config.highlighter)}
            />
        );
    }

    /**
     * Retrieves the key handler for a field
     * @param field The field to create the handler for
     * @param context The context to be used for the key settings
     * @param close The function that can be used to close this layer
     * @returns The key listener
     */
    protected getFieldHandler(
        field: ITextField,
        context: IIOContext,
        close: () => void
    ): IKeyEventListener {
        return mergeKeyListeners(
            createTextFieldKeyHandler(field, context, close),
            key => {
                if (
                    context.settings
                        .get(baseSettings)
                        .controls.menu.execute.get()
                        .matches(key)
                ) {
                    this.submit(context);
                    return true;
                }
            }
        );
    }

    /**
     * Submits the current value
     * @param context The context to execute the command with (if specified in config)
     */
    protected submit(context: IIOContext): void {
        // Check whether exiting is allowed
        if (this.config?.allowSubmitExitOnError == false && this.checkError()) return;

        // Set the new value
        if (!this.checkError()) {
            const value = this.getValue() as T;
            if (this.config.onSubmit) this.config.onSubmit(value);
            else if (this.config.undoable)
                context.undoRedo.execute(new SetFieldCommand(this.target, value));
            else this.target.set(value);
        }

        // Close the UI
        this.closeAll();
    }

    // Value helpers
    /**
     * Retrieves the text input of the field
     * @param hook THe data hook to subscribe to changes
     * @returns The text input
     */
    protected getText(hook?: IDataHook): string | undefined {
        return this.fieldData.get(hook)?.field?.get(hook) ?? undefined;
    }

    /**
     * Retrieves the resulting value if valid, or an error otherwise
     * @param hook The data hook to subscribe to changes
     * @returns The resulting value, or error
     */
    public getValue(hook?: IDataHook): T | IInputError {
        const inp = this.getText(hook);
        const error = inp !== undefined && this.config.checkValidity?.(inp);
        if (error) return error;
        else {
            if (inp === undefined) return this.target.get();
            return (this.config.deserialize ? this.config.deserialize(inp) : inp) as T;
        }
    }

    /**
     * Commits the current text value to the target field, if the input value is valid
     * @returns Whether the input was valid
     */
    public updateField(): boolean {
        // Check whether the input is valid, and return if it isn't
        if (this.checkError()) return false;

        // Update the value
        let value = this.getValue();
        this.target.set(value as T);
        return true;
    }

    // Error handling
    /**
     * Retrieves the input error if any
     * @param hook The hook to subscribe to changes
     * @returns The error with the current input if any
     */
    public getError(hook?: IDataHook): IInputError | null {
        return this.error.get(hook);
    }

    /**
     * Retrieves the error message for the current input if any
     * @param text The text to retrieve the error for
     * @returns The error
     */
    protected checkError(text?: string): IInputError | null {
        const inpText = text ?? this.getText();
        return (inpText && this.config.checkValidity?.(inpText)) || null;
    }

    /**
     * Updates the error and shows the UI
     * @returns The new error if any
     */
    protected updateError(): IInputError | null {
        const error = this.checkError();
        this.error.set(error);

        const context = this.context.get();
        if (error && context) {
            let errorView: ReactNode;
            if ("view" in error) errorView = error.view;
            else errorView = error.message;
            this.contentData.set(createContentError(errorView, context));
        } else {
            this.contentData.set(null);
        }

        return error;
    }

    /**
     * Augments a given highlighter with the input error range
     * @param highlighter The highlighter to extend, or the plain text highlighter if left out
     * @returns The augmented highlighter
     */
    protected getHighlighterWithError(
        highlighter: IHighlighter = plaintextLexer
    ): IHighlighter {
        return {
            highlight: (syntax, h) => {
                const {nodes, errors} = highlighter.highlight(syntax);
                const fieldError = this.checkError(syntax);
                this.errorListeners.addListener(h); // Such that we can force updates, even if the text hasn't changed
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
