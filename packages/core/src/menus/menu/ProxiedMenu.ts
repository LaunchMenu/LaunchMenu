import {IDataHook, IDataRetriever, isDataLoadRequest} from "model-react";
import {IIOContext} from "../../context/_types/IIOContext";
import {ManualSourceHelper} from "../../utils/modelReact/ManualSourceHelper";
import {Observer} from "../../utils/modelReact/Observer";
import {IMenuItem} from "../items/_types/IMenuItem";
import {Menu} from "./Menu";
import {IMenuCategoryConfig} from "./_types/IMenuCategoryConfig";

/**
 * A menu that wraps around an item source retriever, automatically updating its contents when the source updates.
 * Note that every single update will require O(n^2) time (n being the number of items in the menu), and is thus rather intensive.
 */
export class ProxiedMenu extends Menu {
    protected itemSource: IDataRetriever<IMenuItem[]>;
    protected itemsObserver: Observer<IMenuItem[]>;
    protected state = new ManualSourceHelper();

    /**
     * Creates a new proxied menu
     * @param context The context to be used by menu items
     * @param itemSource The menu items source
     * @param categoryConfig The configuration for category options
     */
    public constructor(
        context: IIOContext,
        itemSource: IDataRetriever<IMenuItem[]>,
        categoryConfig?: IMenuCategoryConfig
    ) {
        super(context, categoryConfig);

        this.itemSource = itemSource;
        this.setupListener();
    }

    /**
     * Sets up the listener for the source menu
     */
    protected setupListener() {
        this.itemsObserver = new Observer(h => this.itemSource(h)).listen(
            (items, state, prevItems) => {
                this.state.setLoading(state.isLoading);
                this.state.setExceptions(state.exceptions);

                const added = items.filter(item => !prevItems.includes(item));
                const removed = prevItems.filter(item => !items.includes(item));

                added.forEach(item => this.addItem(item));
                removed.forEach(item => this.removeItem(item));
            }
        );
        this.itemSource(null).forEach(item => this.addItem(item));
    }

    /** @override */
    public getItems(hook?: IDataHook): IMenuItem[] {
        if (isDataLoadRequest(hook)) this.state.addListener(hook);
        return super.getItems(hook);
    }

    /**
     * Destroys the menu, getting rid of any hooks and persistent data
     */
    public destroy(): boolean {
        if (super.destroy()) {
            this.itemsObserver.destroy();
            return true;
        }
        return false;
    }
}
