import {Command} from "../Command";
import {Field} from "model-react";

/**
 * A command to change field values
 */
export class SetFieldCommand<T> extends Command {
    protected prev: T;
    protected newValue: T;
    protected field: Field<T>;

    /** @override */
    public metadata = {name: "Set field"};

    /**
     * Creates a new set field command
     * @param field The field to be changed
     * @param value The value to change the field to
     */
    public constructor(field: Field<T>, value: T);

    /**
     * Creates a new set field command
     * @param name The name of the change
     * @param field The field to be changed
     * @param value The value to change the field to
     */
    public constructor(name: string, field: Field<T>, value: T);
    public constructor(name: Field<T> | string, field: Field<T> | T, value?: T) {
        super();
        if (typeof name == "string") {
            this.metadata.name = name;
            this.field = field as any;
            this.newValue = value as any;
        } else {
            this.field = name;
            this.newValue = field as any;
        }
    }

    protected async onExecute() {
        this.prev = this.field.get(null);
        this.field.set(this.newValue);
    }
    protected async onRevert() {
        this.field.set(this.prev);
    }
}
