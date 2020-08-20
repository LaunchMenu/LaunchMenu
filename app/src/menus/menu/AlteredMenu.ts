import {Menu} from "./Menu";
import {IMenu} from "./_types/IMenu";
import {IMenuCategoryConfig} from "./_types/IMenuCategoryConfig";
import {IMenuChanges} from "./_types/IMenuChanges";
import {IMenuCategoryData} from "./_types/IMenuCategoryData";
import {Observer} from "../../utils/modelReact/Observer";
import {ICategory} from "../actions/types/category/_types/ICategory";
import {IMenuItem} from "../items/_types/IMenuItem";
import {onMenuChangeAction} from "../actions/types/onMenuChange/onMenuChangeAction";

/**
 * A menu class that can be used to copy a menu and add items to it, or remove items from it
 */
export class AlteredMenu extends Menu {
    protected menuObserver: Observer<IMenuCategoryData[]>;
    protected parentMenu: IMenu;
    protected changes?: IMenuChanges;

    // Items to be inserted at the start of the menu
    protected rawCategoriesBefore = [
        {items: [], category: undefined},
    ] as IMenuCategoryData[];

    /**
     * Creates a new menu
     * @param menu The menu to be augmented
     * @param changes The initial changes to make to the menu
     * @param categoryConfig The configuration for category options
     */
    public constructor(
        menu: IMenu,
        changes?: IMenuChanges,
        categoryConfig?: IMenuCategoryConfig
    ) {
        super(categoryConfig);
        this.changes = changes;
        this.parentMenu = menu;
        if (this.changes?.addBefore) this.insertItems(this.changes.addBefore);
        if (this.changes?.addAfter) this.addItems(this.changes.addAfter);
        this.setupMenuListener();
        menu.getSelected().forEach(item => this.setSelected(item, true));
        this.setCursor(menu.getCursor());
    }

    /**
     * Sets up the listener for the source menu
     */
    protected setupMenuListener() {
        this.menuObserver = new Observer(h =>
            this.parentMenu.getCategories(h)
        ).listen(() => this.updateItemsList());
        this.updateItemsList();
    }

    // Item management
    /**
     * Adds an item to the start of the menu
     * @param item The item to add
     * @param index The index to add the item at within its category (defaults to the last index; Infinity)
     */
    public insertItem(item: IMenuItem, index: number = Infinity): void {
        const added = this.addItemWithoutUpdate(item, this.rawCategoriesBefore, index);
        this.updateItemsList();

        // Call the menu change listener
        if (added) onMenuChangeAction.get([item]).onMenuChange(this, true);
    }

    /**
     * Adds all the items from the given array at once to the start of the menu (slightly more efficient than adding one by one)
     * @param items The generator to get items from
     */
    public insertItems(items: IMenuItem[]): void {
        const addedItems = items.filter(item =>
            this.addItemWithoutUpdate(item, this.rawCategoriesBefore)
        );
        this.updateItemsList();

        // Call the menu change listener
        onMenuChangeAction.get(addedItems).onMenuChange(this, true);
    }

    /**
     * Removes an item from the menu
     * @param item The item to remove
     * @returns Whether the item was in the menu (and now removed)
     */
    public removeItem(item: IMenuItem): boolean {
        return super.removeItem(item) || this.removeItems([item]);
    }

    /**
     * Removes all the items from the given array at once (slightly more efficient than removing one by one)
     * @param item The item to remove
     * @returns Whether any item was in the menu (and now removed)
     */
    public removeItems(items: IMenuItem[]): boolean {
        const removedBefore = super.removeItems(items);
        let removed = [] as IMenuItem[];
        const selectedItems = this.selected.get(null);

        items.forEach(item => {
            const category = this.categoryConfig.getCategory(item);
            const categoryIndex = this.rawCategoriesBefore.findIndex(
                ({category: c}) => c == category
            );

            // Add the item to a new or existing category
            if (categoryIndex != -1) {
                const {items} = this.rawCategoriesBefore[categoryIndex];
                const index = items.indexOf(item);
                if (index != -1) {
                    items.splice(index, 1);
                    if (items.length == 0)
                        this.rawCategoriesBefore.splice(categoryIndex, 1);
                    removed.push(item);

                    // Make sure the item isn't the selected and or cursor item
                    if (selectedItems.includes(item)) this.setSelected(item, false);
                }
            }
        });

        if (removed.length > 0) {
            this.updateItemsList();

            // Call the menu change listener
            onMenuChangeAction.get(items).onMenuChange(this, false);
            return true;
        }
        return removedBefore;
    }

    /**
     * Synchronizes the item list to be up to date with the categories data
     */
    protected updateItemsList(): void {
        // Collect all items into one category list
        const combinedCategories = this.parentMenu
            .getCategories()
            .map(({category, items}) => ({category, items: [...items]}));
        const getCategoryData = (category: ICategory | undefined) => {
            let categoryData = combinedCategories.find(
                ({category: combinedCategory}) => combinedCategory == category
            );
            if (!categoryData) {
                categoryData = {category, items: []};
                combinedCategories.push(categoryData);
            }
            return categoryData;
        };
        this.rawCategoriesBefore.forEach(({category, items}) =>
            getCategoryData(category).items.unshift(...items)
        );
        this.rawCategories.forEach(({category, items}) =>
            getCategoryData(category).items.push(...items)
        );

        // Sort the order
        const order = this.categoryConfig.sortCategories(combinedCategories);

        // Combine the items and categories into a single list
        let items = [] as IMenuItem[];
        const categories = [] as IMenuCategoryData[];
        order.forEach(category => {
            const categoryData = combinedCategories.find(
                ({category: c}) => c == category
            );
            if (categoryData) {
                let catItems = categoryData.items;

                const filter = this.changes?.filter;
                if (filter) catItems = catItems.filter(item => filter(item, category));
                if (catItems.length == 0) return;

                if (category) items.push(category.item, ...catItems);
                else items.push(...catItems);
            }
        });
        this.categories.set(categories);
        this.items.set(items);

        // Sets the current cursor if there isn't any yet
        this.deselectRemovedCursor();
    }

    /**
     * Destroys the menu, getting rid of any hooks and persistent data
     */
    public destroy() {
        this.menuObserver.destroy();
        super.destroy();
    }
}
