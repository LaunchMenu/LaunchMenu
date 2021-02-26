import {Command} from "../Command";
import {IField} from "../../_types/IField";

/**
 * A command to change field values
 */
export class SetFieldCommand<T> extends Command {
    protected revertValue: T | undefined;
    protected prev: T;
    protected newValue: T;
    protected field: IField<T>;

    /** @override */
    public metadata = {name: "Set field"};

    /**
     * Creates a new set field command
     * @param field The field to be changed
     * @param value The value to change the field to
     * @param revertValue An optional value to revert the field to if specified, auto infered if left out
     */
    public constructor(field: IField<T>, value: T, revertValue?: T);

    /**
     * Creates a new set field command
     * @param name The name of the change
     * @param field The field to be changed
     * @param value The value to change the field to
     * @param revertValue An optional value to revert the field to if specified, auto infered if left out
     */
    public constructor(name: string, field: IField<T>, value: T, revertValue?: T);
    public constructor(name: IField<T> | string, field: IField<T> | T, value?: T, revertValue?: T) {
        super();
        if (typeof name == "string") {
            this.metadata.name = name;
            this.field = field as any;
            this.newValue = value as any;
            this.revertValue = revertValue;
        } else {
            this.field = name;
            this.newValue = field as any;
            this.revertValue = revertValue;
        }
    }

    /** @override */
    protected async onExecute() {
        this.prev = this.field.get();
        this.field.set(this.newValue);
    }
    
    /** @override */
    protected async onRevert() {
        if(this.revertValue) this.field.set(this.revertValue);
        else this.field.set(this.prev);
    }
}
