import {IAction} from "./_types/IAction";
import {IActionHandlerCore} from "./_types/IActionHandlerCore";
import {IActionHandler} from "./_types/IActionHandler";
import {IActionCore} from "./_types/IActionCore";
import {IMenuItem} from "../_types/IMenuItem";
import {ITagsOverride} from "./_types/ITagsOverride";
import {createActionHandler} from "./createActionHandler";

/**
 * An action that can be executed on menu items
 */
export class Action<I, O> implements IAction<I, O> {
    protected actionCore: IActionCore<I, O>;
    protected defaultTags: any[];

    /**
     * Creates a new action
     * @param actionCore The core function to obtain the action executers given its handlers
     * @param defaultTags The default tags for bindings of handlers for this action
     */
    public constructor(actionCore: IActionCore<I, O>, defaultTags: any[] = []) {
        this.actionCore = actionCore;
        this.defaultTags = defaultTags;
    }

    /** @override */
    public createHandler<T>(
        handlerCore: IActionHandlerCore<T, I>,
        defaultTags: ITagsOverride = tags => tags
    ): IActionHandler<T, I, IAction<I, O>> {
        return createActionHandler(
            this,
            handlerCore,
            defaultTags instanceof Function ? defaultTags(this.defaultTags) : defaultTags
        );
    }

    /** @override */
    public get(items: IMenuItem[]): O {
        const handlersData: {
            handler: IActionHandler<any, I, IAction<I, O>>;
            data: any[];
            items: IMenuItem[];
        }[] = [];

        // Collect all bindings
        items.forEach(item => {
            item.actionBindings.forEach(({handler, data}) => {
                // Make sure the handler is a handler for this action
                if (handler.action != this) return;

                // Add the handler and its data
                let handlerData = handlersData.find(h => h.handler == handler);
                if (!handlerData) {
                    handlerData = {handler: handler as any, data: [], items: []};
                    handlersData.push(handlerData);
                }
                handlerData.data.push(data);
                handlerData.items.push(item);
            });
        });

        // Call action core with the data
        return this.actionCore(handlersData);
    }
}
