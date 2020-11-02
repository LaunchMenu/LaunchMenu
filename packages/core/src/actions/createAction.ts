import {ISubscribable} from "../utils/subscribables/_types/ISubscribable";
import {actionGetter} from "./actionGraph/actionGetter";
import {IAction} from "./_types/IAction";
import {IActionBinding} from "./_types/IActionBinding";
import {IActionTransformer} from "./_types/IActionTransformer";

/**
 * Extracts purely the action interface of some type that extends the action interface
 */
type TPureAction<A extends IAction> = A extends IAction<infer I, infer O, infer P>
    ? IAction<I, O, P>
    : never;

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
    }
>(actionInput: {
    /** The name of the action */
    name: string;
    /** The parent actions of this action */
    parents?: P[];
    /** The core transformer of the action */
    core: IActionTransformer<I, O, K>;
    /** A custom binding creator in case generic types are needed */
    createBinding?: CB;
}): /** The action as well as an interface to create bindings for this action with */
IAction<I, O, P> & {
    createBinding: CB;
} {
    return {
        name: actionInput.name,
        parents: actionInput.parents || [],
        transform: actionInput.core as any,
        get: actionGetter,
        createBinding:
            actionInput.createBinding ||
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
