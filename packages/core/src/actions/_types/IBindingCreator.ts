import {IDataRetriever} from "model-react";
import {IAction} from "./IAction";
import {IActionBinding} from "./IActionBinding";

/** The standard binding creator config */
export type IBindingCreatorConfig<I> = {
    /** The index of the binding, for when returned by an action handler */
    index?: number;
} & ({data: I} | {subscribableData: IDataRetriever<I>});

/** The standard binding creator signature */
export type IBindingCreator<I, O, P extends IAction> = {
    /**
     * Creates a new action binding
     * @param config The data for the binding, and optionally extra configuration
     * @returns The created binding
     */
    (config: I | IBindingCreatorConfig<I>): IActionBinding<IAction<I, O, P>>;
};
