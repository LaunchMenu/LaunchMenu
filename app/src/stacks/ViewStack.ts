import {IdentifiedStack} from "./IdentifiedStack";
import {IViewStackItem} from "./_types/IViewStackItem";

/**
 * A class for maintaining a stack of views
 */
export class ViewStack extends IdentifiedStack<IViewStackItem> {}
