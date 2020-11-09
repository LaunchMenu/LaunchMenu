import {IDataRetriever} from "model-react";
import {actionGetter} from "./actionGraph/actionGetter";
import {IAction} from "./_types/IAction";
import {IActionBinding} from "./_types/IActionBinding";
import {IActionTransformer} from "./_types/IActionTransformer";
import {IBindingCreator, IBindingCreatorConfig} from "./_types/IBindingCreator";
import {TPureAction} from "./_types/TPureAction";

/**
 * Creates an action that conforms to all constraints of a proper action
 * @param actionInput The data to construct the action from
 * @returns The created action
 */
export function createAction<
    /** The input data type */
    I,
    /** The result data type */
    O = never,
    /** The parent actions types (union of parents) */
    P extends IAction = IAction<never, never, any>,
    /** The possible resulting bindings of this action */
    K extends IActionBinding<TPureAction<P>> = never,
    /** The create binding function, which may want to specify generic types for more elaborate interfaces */
    CB = IBindingCreator<I, O, P>,
    /** The remaining functions specified on the object */
    REST = unknown
>(
    actionInput: {
        /** The name of the action */
        name: string;
        /** The parent actions of this action */
        parents?: P[];
        /** The core transformer of the action */
        core: IActionTransformer<I, O, K>;
        /** A custom binding creator in case generic types are needed */
        createBinding?: CB;
    } & REST
): /** The action as well as an interface to create bindings for this action with */
IAction<I, O, P> & {
    createBinding: CB;
} & Omit<REST, "name" | "parents" | "core" | "createBinding"> {
    const {name, parents, core, createBinding, ...rest} = actionInput;

    parents?.forEach(parent => {
        if (parent === undefined)
            throw Error(
                "Undefined was passed as a parent, this could be caused by dependency cycles"
            );
    });

    return {
        name,
        parents: parents || [],
        transform: core as any,
        get: actionGetter,
        createBinding: createBinding || (createStandardBinding as any),
        ...rest,
    };
}

// The standard binding creator type and function

export function createStandardBinding(
    this: IAction,
    config: any | IBindingCreatorConfig<any>
): IActionBinding {
    if (config instanceof Object && ("subscribableData" in config || "data" in config))
        return {action: this, ...config} as any;
    return {action: this, data: config, index: config?.index} as any;
}
