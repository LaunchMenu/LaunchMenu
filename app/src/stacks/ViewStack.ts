import {IdentifiedStack} from "./IdentifiedStack";
import {IViewStackItem} from "./_types/IViewStackItem";
import {IViewStack} from "./_types/IViewStack";

/**
 * A class for maintaining a stack of views
 */
export class ViewStack extends IdentifiedStack<IViewStackItem> implements IViewStack {}
