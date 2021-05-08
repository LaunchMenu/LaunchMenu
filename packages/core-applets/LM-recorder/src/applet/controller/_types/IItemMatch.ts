import {IMenuItem} from "@launchmenu/core";
import {IDataHook} from "model-react";

/** A description of an item to be found */
export type IItemMatch = RegExp | ((item: IMenuItem, hook: IDataHook) => boolean);
