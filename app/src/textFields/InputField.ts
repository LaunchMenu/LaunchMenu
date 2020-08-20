import {TextField} from "./TextField";
import {Field, IDataHook} from "model-react";
import {IInputFieldConfig} from "./_types/IInputFieldConfig";
import {IIOContext} from "../context/_types/IIOContext";
import {IMenu} from "../menus/menu/_types/IMenu";
import {AlteredMenu} from "../menus/menu/AlteredMenu";
import {IInputFieldError} from "./_types/IInputFieldError";
import {IMenuItem} from "../menus/items/_types/IMenuItem";
import {createStandardMenuItem} from "../menus/items/createStandardMenuItem";
import {openUI} from "../context/openUI/openUI";
import {IHighlighter} from "./syntax/_types/IHighlighter";
import {plaintextLexer} from "./syntax/plaintextLexer";

/**
 * A text field that displays error messages if the user input doesn't match a specified constraint
 */
export class InputField<T> extends TextField {
    protected target: Field<T>;
    protected context: IIOContext | undefined;
    protected menu: IMenu | undefined;
    protected config: IInputFieldConfig<T>;

    protected error = new Field(null as null | IInputFieldError);
    protected errorItem?: IMenuItem;
    protected errorMenu?: AlteredMenu;
    protected closeErrorMenu?: () => void;

    /**
     * Creates a new input field
     * @param field The field to target
     * @param context The context to open the menu with error in
     * @param menu The menu to augment with the error message
     * @param config The configuration for the field
     */
    public constructor(
        field: Field<T>,
        context: IIOContext,
        menu: IMenu,
        config: IInputFieldConfig<T> & {checkValidity: any}
    );

    /**
     * Creates a new input field
     * @param field The field to target
     * @param config The configuration for the field
     */
    public constructor(
        field: Field<T>,
        config: IInputFieldConfig<T> & {checkValidity?: undefined}
    );
    public constructor(
        field: Field<T>,
        context?: IIOContext | IInputFieldConfig<T>,
        menu?: IMenu,
        config?: IInputFieldConfig<T>
    ) {
        super();
        this.target = field;

        if (menu) {
            this.context = context as any;
            this.menu = menu;
            this.config = (config || {liveUpdate: true}) as any;
            this.setupMenu();
        } else {
            this.config = (context || {liveUpdate: true}) as any;
        }

        const value = this.target.get(null);
        this.set(this.config.toString?.(value) ?? ((value as any) as string));
    }

    /**
     * Sets the new value of the input
     * @param value The value to set
     */
    public set(value: string): void {
        super.set(value);
        if (this.config.liveUpdate) this.updateTarget();

        this.showError(this.config.checkValidity?.(value) || null);
    }

    /**
     * Shows the error in a menu
     * @param error The error to display
     */
    protected showError(error: IInputFieldError | null): void {
        if (this.error.get(null) == error) return;

        this.error.set(error);
        if (this.errorMenu) {
            if (this.errorItem) this.errorMenu.removeItem(this.errorItem);

            if (error) {
                if ("menuItem" in error) this.errorItem = error.menuItem;
                else
                    this.errorItem = createStandardMenuItem({
                        name: "error",
                        description: error.message,
                    }); // TODO: make nice error message UI

                this.errorMenu.insertItem(this.errorItem);
            }
        }
    }

    /**
     * Creates the menu to show any possible error messages in
     */
    protected setupMenu() {
        if (this.menu && this.context) {
            this.errorMenu = new AlteredMenu(this.menu);

            if (this.config.openMenu)
                this.closeErrorMenu = this.config.openMenu(this.errorMenu, this.context);
            else this.closeErrorMenu = openUI(this.context, {menu: this.errorMenu});
        }
    }

    /**
     * Commits the current text value to the target field, if the input value is valid
     * @returns Whether the input was valid
     */
    public updateTarget(): boolean {
        // Check whether the input is valid, and return if it isn't
        const inp = this.get();
        if (this.config.checkValidity?.(inp)) return false;

        // Update the value
        let value = this.config.fromString ? this.config.fromString(inp) : inp;
        this.target.set(value as T);
        return true;
    }

    /**
     * Disposes all hooks and persistent data of this input field
     */
    public destroy(): void {
        this.closeErrorMenu?.();
    }

    /**
     * Retrieves the input error if any
     * @param hook The hook to subscribe to changes
     * @returns The error with the current input if any
     */
    public getError(hook: IDataHook = null): IInputFieldError | null {
        return this.error.get(hook);
    }

    /**
     * Augments a given highlighter with the input error range
     * @param highlighter The highlighter to extend, or the plain text highlighter if left out
     * @returns The augmented highlighter
     */
    public getHighlighterWithError(
        highlighter: IHighlighter = plaintextLexer
    ): IHighlighter {
        return {
            highlight: syntax => {
                const {nodes, errors} = highlighter.highlight(syntax);
                const fieldError = this.config.checkValidity?.(syntax);
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
