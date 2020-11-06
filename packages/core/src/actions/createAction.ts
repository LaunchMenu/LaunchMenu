import {ISubscribable} from "../utils/subscribables/_types/ISubscribable";
import {actionGetter} from "./actionGraph/actionGetter";
import {IAction} from "./_types/IAction";
import {IActionBinding} from "./_types/IActionBinding";
import {IActionTransformer} from "./_types/IActionTransformer";
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
    CB = {
        /**
         * Creates a new binding for this action
         * @param data The binding data
         * @param index The index of the binding
         * @returns The created binding
         */
        (data: ISubscribable<I>, index?: number): IActionBinding<IAction<I, O, P>>;
    },
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

    return {
        name,
        parents: parents || [],
        transform: core as any,
        get: actionGetter,
        createBinding:
            createBinding ||
            (function (data: any, index?: number) {
                return {
                    action: this,
                    index,
                    ...(data instanceof Function
                        ? {subscribableData: data}
                        : {
                              data,
                          }),
                };
            } as any),
        ...rest,
    };
}

// TODO: write the tests in some unit test file
// const b = createAction({
//     core: (inp: number[]) => ({
//         result: 3,
//     }),
// });

// const c = createAction({
//     core: (inp: string[]) => ({
//         result: "oranges",
//     }),
// });
// const a = createAction({
//     parents: [b, c],
//     core: (inp: {orange: any; pot: any}[]) => ({
//         result: 3,
//         children: [
//             b.createBinding(3),
//             // b.createBinding(3),
//             c.createBinding("yes")
//         ],
//     }),
//     // createBinding<V>(shit: {orange: V, pot: V}) {
//     //     return null as any;
//     // }
//     createBinding: <V>(shit: {orange: V; pot: V}) => {
//         return null as any;
//     },
// });

// const s = {
//     createBinding: <V>(shit: {orange: V; pot: V}) => {
//         return null as any;
//     },
// };

// a.get([]);
// a.createBinding({orange: 3, pot: "3"});
