import {IDataRetriever} from "model-react";
import {IIOContext} from "../../context/_types/IIOContext";
import {Observer} from "../../utils/modelReact/Observer";
import {PrioritizedMenu} from "./PrioritizedMenu";
import {IPrioritizedMenuCategoryConfig} from "./_types/IAsyncMenuCategoryConfig";
import {IPrioritizedMenuItem} from "./_types/IPrioritizedMenuItem";

/**
 * A menu that automatically synchronizes with the specified prioritized item source
 */
export class ProxiedPrioritizedMenu extends PrioritizedMenu {
    protected itemSource: IDataRetriever<IPrioritizedMenuItem[]>;
    protected itemObserver: Observer<IPrioritizedMenuItem[]>;

    public constructor(
        context: IIOContext,
        itemSource: IDataRetriever<IPrioritizedMenuItem[]>,
        config?: IPrioritizedMenuCategoryConfig
    ) {
        super(context, config);
        this.itemSource = itemSource;
        this.setupObserver();
    }

    /**
     * Sets up the observer to listen to the item source
     */
    protected setupObserver(): void {
        this.itemObserver = new Observer(hook => this.itemSource(hook)).listen(
            (items, _, oldItems = []) => {
                this.removeItems(oldItems);
                this.addItems(items);
            },
            true
        );
    }

    /** @override */
    public destroy(): boolean {
        if (super.destroy()) {
            this.itemObserver.destroy();
            return true;
        }
        return false;
    }
}