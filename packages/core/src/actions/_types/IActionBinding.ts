import {IDataHook} from "model-react";
import {IAction} from "./IAction";

/**
 * The binding for an action
 */
export type IActionBinding<A extends IAction = IAction> = {
    /** The action that this binding is for */
    action: A;
} & (
    | {
          /** The actual action input data */
          data: A extends IAction<infer I, any, any> ? I : never;
      }
    | {
          /** A function to retrieve the actual action input data */
          subscribableData: (
              hook: IDataHook
          ) => A extends IAction<infer I, any, any> ? I : never;
      }
);
