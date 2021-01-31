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
    P extends IAction | void = void,
    /** The possible resulting bindings of this action */
    K extends P extends IAction ? IActionBinding<TPureAction<P>> : void = never,
    /** The create binding function, which may want to specify generic types for more elaborate interfaces */
    CB = IBindingCreator<I, O, P>,
    /** The remaining functions specified on the object */
    EXTRAS = unknown
>(actionInput: {
    /** The name of the action */
    name: string;
    /** The parent actions of this action */
    parents?: P[];
    /** The core transformer of the action */
    core: IActionTransformer<I, O, K>;
    /** A custom binding creator in case generic types are needed */
    createBinding?: CB;
    /** Extra data to set on the created action */
    extras?: EXTRAS;
}): /** The action as well as an interface to create bindings for this action with */
IAction<I, O, P> & {
    createBinding: CB;
} & (/** For whatever reason, in some contexts EXTRAS becomes never */
    EXTRAS extends never
        ? unknown
        : EXTRAS) {
    const {name, parents, core, createBinding, extras = {}} = actionInput;

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
        ...(extras as any),
    };
}

// The standard binding creator type and function

export function createStandardBinding(
    this: IAction,
    config: any | IBindingCreatorConfig<any>
): IActionBinding {
    if (
        config instanceof Object &&
        ("subscribableData" in config || "data" in config) &&
        // A special case to prevent meta bindings (bindings of bindings) from being flattened
        (!("action" in config) || config.action == this)
    )
        return {action: this, ...config} as any;
    return {action: this, data: config};
}
