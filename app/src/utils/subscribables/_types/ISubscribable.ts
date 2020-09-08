import {IDataHook} from "model-react";

/** A data type that can possibly be subscribed to */
export type ISubscribable<T> = T | ((hook?: IDataHook) => T);
