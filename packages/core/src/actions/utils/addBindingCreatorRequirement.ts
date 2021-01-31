import {IAction} from "../_types/IAction";
import {IActionBinding} from "../_types/IActionBinding";
import {
    IBindingCreatorConfig,
    IBindingCreatorConfigOrData,
} from "../_types/IBindingCreator";
import {TIsBindingForAction} from "./_types/TIsBindingForAction";

/**
 * Adds a requirement to createBinding such that it only accepts bindings that are directly or indirectly for the specified target action
 * @param action The action to add the createBinding requirement to
 * @param targetAction The action that the meta bindings should be fore
 * @returns The same input action with the additional input requirement
 */
export function addBindingCreatorRequirement<A extends IAction, T extends IAction>(
    action: A,
    targetAction: T
): A extends {createBinding(binding: infer BI, ...rest: infer I): infer O}
    ? Omit<A, "createBinding"> & {
          /**
           * Creates a new action binding
           * @param config The data for the binding, and optionally extra configuration
           * @returns The created binding
           */
          createBinding<B extends BI>(
              binding: B &
                  (B extends IActionBinding
                      ? TIsBindingForAction<B, T>
                      : B extends IBindingCreatorConfigOrData<infer K>
                      ? K extends IActionBinding
                          ? IBindingCreatorConfig<TIsBindingForAction<K, T>>
                          : unknown
                      : unknown),
              ...rest: I
          ): O;
      }
    : A {
    return action as any;
}
