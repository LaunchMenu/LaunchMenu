import {PrioritizedMenu} from "../PrioritizedMenu";
import {createDummyPrioritizedMenuItem} from "./PrioritizedMenuItem.helper";
import {wait} from "../../../_tests/wait.helper";
import {Observer} from "../../../utils/modelReact/Observer";
import {createDummyMenuItem} from "./MenuItem.helper";
import {IPrioritizedMenuItem} from "../_types/IPrioritizedMenuItem";
import {dummyContext} from "../../../_tests/context.helper";
import {Field} from "model-react";
import {Priority} from "../priority/Priority";
import {getCategoryAction} from "../../../actions/types/category/getCategoryAction";
import {onMenuChangeAction} from "../../../actions/types/onMenuChange/onMenuChangAction";
import {onSelectAction} from "../../../actions/types/onSelect/onSelectAction";
import {onCursorAction} from "../../../actions/types/onCursor/onCursorAction";
import {ICategory} from "../../../actions/types/category/_types/ICategory";

const createMenu = (items?: IPrioritizedMenuItem[]) => {
    const menu = new PrioritizedMenu(dummyContext, {
        batchInterval: 10,
    });
    if (items) {
        items.forEach(item => menu.addItem(item));
        menu.flushBatch();
    }
    return menu;
};

describe("PrioritizedMenu", () => {
    describe("new PrioritizedMenu", () => {
        it("Properly creates a new prioritized menu", () => {
            new PrioritizedMenu(dummyContext);
        });
        it("Can be initialized with a config", () => {
            new PrioritizedMenu(dummyContext, {
                batchInterval: 200,
            });
        });
    });
    describe("PrioritizedMenu.addItem(s) / PrioritizedMenu.getItems", () => {
        it("Can add an item", async () => {
            const menu = createMenu();
            const item = createDummyPrioritizedMenuItem({priority: 1});
            menu.addItem(item);
            await wait(20);
            expect(menu.getItems()).toEqual([item.item]);
        });
        it("Can add multiple items at once", async () => {
            const menu = createMenu();
            const item = createDummyPrioritizedMenuItem({priority: 1});
            const item2 = createDummyPrioritizedMenuItem({priority: 1});
            menu.addItems([item, item2]);
            await wait(20);
            expect(menu.getItems()).toEqual([item.item, item2.item]);
        });
        describe("Handles priorities properly", () => {
            it("Orders the items by priority", async () => {
                const menu = createMenu();
                const item = createDummyPrioritizedMenuItem({priority: 1});
                const item2 = createDummyPrioritizedMenuItem({priority: 4});
                const item3 = createDummyPrioritizedMenuItem({priority: 3});
                menu.addItem(item);
                menu.addItem(item2);
                menu.addItem(item3);
                await wait(20);
                expect(menu.getItems()).toEqual([item2.item, item3.item, item.item]);
            });
            it("Considers nested 'nested' priorities", async () => {
                const menu = createMenu();
                const item = createDummyPrioritizedMenuItem({
                    priority: [Priority.MEDIUM, Priority.HIGH],
                });
                const item2 = createDummyPrioritizedMenuItem({
                    priority: [Priority.MEDIUM, Priority.MEDIUM],
                });
                const item3 = createDummyPrioritizedMenuItem({
                    priority: [Priority.MEDIUM, Priority.MEDIUM],
                });
                const item4 = createDummyPrioritizedMenuItem({
                    priority: [Priority.MEDIUM, Priority.LOW],
                });
                const item5 = createDummyPrioritizedMenuItem({priority: Priority.HIGH});
                const item6 = createDummyPrioritizedMenuItem({
                    priority: [Priority.HIGH, Priority.HIGH],
                });
                menu.addItem(item);
                menu.addItem(item2);
                menu.addItem(item3);
                menu.addItem(item4);
                menu.addItem(item5);
                menu.addItem(item6);
                await wait(20);
                expect(menu.getItems()).toEqual([
                    item6.item,
                    item5.item,
                    item.item,
                    item2.item,
                    item3.item,
                    item4.item,
                ]);
            });
            it("Orders items with equivalent priority in addition order", async () => {
                const menu = createMenu();
                const item = createDummyPrioritizedMenuItem({priority: 1});
                const item2 = createDummyPrioritizedMenuItem({priority: 3});
                const item3 = createDummyPrioritizedMenuItem({priority: 3});
                menu.addItem(item);
                menu.addItem(item2);
                menu.addItem(item3);
                await wait(20);
                expect(menu.getItems()).toEqual([item2.item, item3.item, item.item]);
            });
            it("Doesn't add items with priority 0", async () => {
                const menu = createMenu();
                const item = createDummyPrioritizedMenuItem({priority: 1});
                const item2 = createDummyPrioritizedMenuItem({priority: 0});
                menu.addItem(item);
                menu.addItem(item2);
                await wait(20);
                expect(menu.getItems()).toEqual([item.item]);
            });
        });
        it("Batches additions", async () => {
            const menu = createMenu();
            const item = createDummyPrioritizedMenuItem({priority: 1});
            const item2 = createDummyPrioritizedMenuItem({priority: 4});
            const item3 = createDummyPrioritizedMenuItem({priority: 3});
            menu.addItem(item);
            menu.addItem(item2);
            menu.addItem(item3);
            const listener = jest.fn();
            new Observer(h => menu.getItems(h)).listen(listener, true);
            await wait(20);
            // First observer call there weren't any items, second call contains all items
            expect(listener.mock.calls[0][0]).toEqual([]);
            expect(listener.mock.calls[1][0]).toEqual([
                item2.item,
                item3.item,
                item.item,
            ]);
        });
        describe("Uses categories", () => {
            const someCategory: ICategory = {
                name: "Bob",
                description: "some category for Bob",
                item: createDummyMenuItem({name: "c1"}),
            };
            const someCategory2: ICategory = {
                name: "John",
                description: "some category for John",
                item: createDummyMenuItem({name: "c2"}),
            };
            const items = [
                createDummyPrioritizedMenuItem({priority: 5, name: "0"}),
                createDummyPrioritizedMenuItem({priority: 1, name: "1"}),
                createDummyPrioritizedMenuItem({
                    priority: 3,
                    category: someCategory,
                    name: "2",
                }),
                createDummyPrioritizedMenuItem({
                    priority: 5,
                    category: someCategory,
                    name: "3",
                }),
                createDummyPrioritizedMenuItem({
                    priority: 6,
                    category: someCategory2,
                    name: "4",
                }),
            ];

            it("Inserts the correct category in the menu", async () => {
                const menu = createMenu();
                menu.addItem(items[2]);
                menu.addItem(items[3]);
                await wait(20);
                expect(menu.getItems()).toEqual([
                    someCategory.item,
                    items[3].item,
                    items[2].item,
                ]);
            });
            it("Orders the categories properly based on top priority", async () => {
                const menu = createMenu();
                items.forEach(item => menu.addItem(item));
                await wait(20);
                expect(menu.getItems()).toEqual([
                    items[0].item,
                    items[1].item,
                    someCategory2.item,
                    items[4].item,
                    someCategory.item,
                    items[3].item,
                    items[2].item,
                ]);
            });

            it("Moves items to their new category when its category changes", async () => {
                const menu = createMenu();
                const category = new Field(someCategory);

                const item = createDummyPrioritizedMenuItem({
                    generateID: true,
                    actionBindings: h => {
                        return [getCategoryAction.createBinding(category.get(h ?? null))];
                    },
                    name: "item",
                });
                items.forEach(item => menu.addItem(item));
                menu.addItem(item);
                await wait(20);
                expect(menu.getItems()).toEqual([
                    items[0].item,
                    items[1].item,
                    someCategory2.item,
                    items[4].item,
                    someCategory.item,
                    items[3].item,
                    items[2].item,
                    item.item,
                ]);
                category.set(someCategory2);
                await wait();
                expect(menu.getItems()).toEqual([
                    items[0].item,
                    items[1].item,
                    someCategory2.item,
                    items[4].item,
                    item.item,
                    someCategory.item,
                    items[3].item,
                    items[2].item,
                ]);
                category.set(someCategory);
                await wait();
                expect(menu.getItems()).toEqual([
                    items[0].item,
                    items[1].item,
                    someCategory2.item,
                    items[4].item,
                    someCategory.item,
                    items[3].item,
                    items[2].item,
                    item.item,
                ]);
            });
        });
        it("Calls onMenuChange actions", async () => {
            const onMenuChange = jest.fn();
            const item = createDummyPrioritizedMenuItem({
                priority: 1,
                actionBindings: [onMenuChangeAction.createBinding(onMenuChange)],
            });
            const menu = createMenu();
            menu.addItem(item);
            await wait(20);
            expect(onMenuChange.mock.calls.length).toBe(1);
            expect(onMenuChange.mock.calls[0]).toEqual([menu, true]);
        });
    });
    describe("Menu.getCategories", () => {
        const someCategory: ICategory = {
            name: "Bob",
            description: "some category for Bob",
            item: createDummyMenuItem(),
        };
        const someCategory2: ICategory = {
            name: "John",
            description: "some category for John",
            item: createDummyMenuItem(),
        };
        const items = [
            createDummyPrioritizedMenuItem({priority: 5}),
            createDummyPrioritizedMenuItem({priority: 1}),
            createDummyPrioritizedMenuItem({priority: 3, category: someCategory}),
            createDummyPrioritizedMenuItem({priority: 5, category: someCategory}),
            createDummyPrioritizedMenuItem({priority: 6, category: someCategory2}),
        ];
        it("Correctly retrieves the categories", async () => {
            const menu = createMenu();
            items.forEach(item => menu.addItem(item));
            await wait(20);
            expect(menu.getCategories()).toEqual([
                {category: undefined, items: [items[0].item, items[1].item]},
                {category: someCategory2, items: [items[4].item]},
                {category: someCategory, items: [items[3].item, items[2].item]},
            ]);
        });
        it("Can be subscribed to", async () => {
            const menu = createMenu();
            items.forEach(item => menu.addItem(item));
            await wait(20);

            const cb = jest.fn();
            new Observer(h => menu.getCategories(h)).listen(cb);

            const newItem = createDummyPrioritizedMenuItem({
                priority: 4,
                category: someCategory2,
            });
            menu.addItem(newItem);
            await wait(20);
            expect(cb.mock.calls.length).toBe(1);
            expect(cb.mock.calls[0][0]).toEqual([
                {category: undefined, items: [items[0].item, items[1].item]},
                {category: someCategory2, items: [items[4].item, newItem.item]},
                {category: someCategory, items: [items[3].item, items[2].item]},
            ]);
        });
    });
    describe("PrioritizedMenu.removeItem(s)", () => {
        it("Removes the specified items, based on id", async () => {
            const menu = createMenu();
            const item = createDummyPrioritizedMenuItem({priority: 1});
            const item2 = createDummyPrioritizedMenuItem({priority: 4, generateID: true});
            const item3 = createDummyPrioritizedMenuItem({priority: 3, generateID: true});
            const item4 = {
                ...createDummyPrioritizedMenuItem({priority: 6}),
                ID: item3.ID,
            } as IPrioritizedMenuItem;
            menu.addItem(item);
            menu.addItem(item2);
            menu.addItem(item3);
            await wait(20);
            expect(menu.getItems()).toEqual([item2.item, item3.item, item.item]);
            menu.removeItem(item2);
            await wait(20);
            expect(menu.getItems()).toEqual([item3.item, item.item]);

            menu.removeItem(item4);
            await wait(20);
            expect(menu.getItems()).toEqual([item.item]);
        });
        it("Removes the specified items, based on item equivalence (slower)", async () => {
            const menu = createMenu();
            const item = createDummyPrioritizedMenuItem({priority: 1});
            const item2 = createDummyPrioritizedMenuItem({priority: 4});
            const item3 = createDummyPrioritizedMenuItem({priority: 3});
            menu.addItem(item);
            menu.addItem(item2);
            menu.addItem(item3);
            await wait(20);
            expect(menu.getItems()).toEqual([item2.item, item3.item, item.item]);
            menu.removeItem(item2);
            await wait(20);
            expect(menu.getItems()).toEqual([item3.item, item.item]);
        });
        it("Removes multiple items", async () => {
            const menu = createMenu();
            const item = createDummyPrioritizedMenuItem({priority: 1});
            const item2 = createDummyPrioritizedMenuItem({priority: 4});
            const item3 = createDummyPrioritizedMenuItem({priority: 3});
            menu.addItem(item);
            menu.addItem(item2);
            menu.addItem(item3);
            await wait(20);
            expect(menu.getItems()).toEqual([item2.item, item3.item, item.item]);
            menu.removeItems([item, item2]);
            await wait(20);
            expect(menu.getItems()).toEqual([item3.item]);
        });
        it("Batches item removals", async () => {
            const menu = createMenu();
            const item = createDummyPrioritizedMenuItem({priority: 1, generateID: true});
            const item2 = createDummyPrioritizedMenuItem({priority: 4, generateID: true});
            const item3 = createDummyPrioritizedMenuItem({priority: 3, generateID: true});
            menu.addItem(item);
            menu.addItem(item2);
            menu.addItem(item3);
            await wait(20);

            const listener = jest.fn();
            new Observer(h => menu.getItems(h)).listen(listener, true);
            menu.removeItem(item2);
            menu.removeItem(item3);
            await wait(20);
            // First observer call there weren't any items, second call contains all items
            expect(listener.mock.calls[0][0]).toEqual([
                item2.item,
                item3.item,
                item.item,
            ]);
            expect(listener.mock.calls[1][0]).toEqual([item.item]);
        });
        it("Removes the specified items, even if added in the same batch", async () => {
            const menu = createMenu();
            const item = createDummyPrioritizedMenuItem({priority: 1});
            const item2 = createDummyPrioritizedMenuItem({priority: 4, generateID: true});
            const item3 = createDummyPrioritizedMenuItem({priority: 3});
            menu.addItem(item);
            menu.addItem(item2);
            menu.addItem(item3);
            menu.removeItem(item2);
            await wait(20);
            expect(menu.getItems()).toEqual([item3.item, item.item]);
        });
        it("Considers categories", async () => {
            const someCategory: ICategory = {
                name: "Bob",
                description: "some category for Bob",
                item: createDummyMenuItem(),
            };
            const someCategory2: ICategory = {
                name: "John",
                description: "some category for John",
                item: createDummyMenuItem(),
            };
            const items = [
                createDummyPrioritizedMenuItem({priority: 5, generateID: true}),
                createDummyPrioritizedMenuItem({priority: 1, generateID: true}),
                createDummyPrioritizedMenuItem({
                    priority: 3,
                    category: someCategory,
                    generateID: true,
                }),
                createDummyPrioritizedMenuItem({
                    priority: 5,
                    category: someCategory,
                    generateID: true,
                }),
                createDummyPrioritizedMenuItem({
                    priority: 6,
                    category: someCategory2,
                    generateID: true,
                }),
            ];
            const menu = createMenu();
            items.forEach(item => menu.addItem(item));
            await wait(20);
            expect(menu.getItems()).toEqual([
                items[0].item,
                items[1].item,
                someCategory2.item,
                items[4].item,
                someCategory.item,
                items[3].item,
                items[2].item,
            ]);

            menu.removeItem(items[2]);
            menu.removeItem(items[3]);
            menu.removeItem(items[1]);
            await wait(20);
            expect(menu.getItems()).toEqual([
                items[0].item,
                someCategory2.item,
                items[4].item,
            ]);
        });
        it("Calls onMenuChange actions", async () => {
            const onMenuChange = jest.fn();
            const item = createDummyPrioritizedMenuItem({
                priority: 1,
                generateID: true,
                actionBindings: [onMenuChangeAction.createBinding(onMenuChange)],
            });
            const menu = createMenu();
            menu.addItem(item);
            await wait(20);
            expect(onMenuChange.mock.calls.length).toBe(1);
            expect(onMenuChange.mock.calls[0]).toEqual([menu, true]);
            menu.removeItem(item);
            await wait(20);
            expect(onMenuChange.mock.calls.length).toBe(2);
            expect(onMenuChange.mock.calls[1]).toEqual([menu, false]);
        });
    });
    describe("PrioritizedMenu.flushBatch", () => {
        it("Synchronously flushes item addition changes", () => {
            const menu = createMenu();
            const item = createDummyPrioritizedMenuItem({priority: 1, generateID: true});
            const item2 = createDummyPrioritizedMenuItem({priority: 4, generateID: true});
            const item3 = createDummyPrioritizedMenuItem({priority: 3, generateID: true});
            menu.addItem(item);
            menu.addItem(item2);
            menu.addItem(item3);
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item2.item, item3.item, item.item]);
        });
        it("Synchronously flushes item removal changes", async () => {
            const menu = createMenu();
            const item = createDummyPrioritizedMenuItem({priority: 1, generateID: true});
            const item2 = createDummyPrioritizedMenuItem({priority: 4, generateID: true});
            const item3 = createDummyPrioritizedMenuItem({priority: 3, generateID: true});
            menu.addItem(item);
            menu.addItem(item2);
            menu.addItem(item3);
            await wait(20);

            menu.removeItem(item2);
            menu.removeItem(item3);
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item.item]);
        });
    });

    describe("PrioritizedMenu.setSelected / PrioritizedMenu.getSelected", () => {
        const items = [
            createDummyPrioritizedMenuItem({priority: 3}),
            createDummyPrioritizedMenuItem({priority: 1}),
            createDummyPrioritizedMenuItem({priority: 5}),
            createDummyPrioritizedMenuItem({priority: 2}),
        ];
        it("Can select items", () => {
            const menu = createMenu(items);
            menu.setSelected(items[0].item, true);
            expect(menu.getSelected()).toEqual([items[0].item]);
            menu.setSelected(items[3].item, true);
            expect(menu.getSelected()).toEqual([items[0].item, items[3].item]);
        });
        it("Can deselect items", () => {
            const menu = createMenu(items);
            menu.setSelected(items[0].item, true);
            menu.setSelected(items[3].item, true);
            expect(menu.getSelected()).toEqual([items[0].item, items[3].item]);
            menu.setSelected(items[3].item, false);
            expect(menu.getSelected()).toEqual([items[0].item]);
            menu.setSelected(items[0].item, false);
            expect(menu.getSelected()).toEqual([]);
        });
        it("Calls onSelect actions", () => {
            let selectCount = 0;
            let deselectCount = 0;
            const item = createDummyPrioritizedMenuItem({
                actionBindings: [
                    onSelectAction.createBinding((selected, m) => {
                        if (selected) selectCount++;
                        else deselectCount++;
                        expect(m).toEqual(menu);
                    }),
                ],
            });
            const menu = createMenu([...items, item]);
            expect(selectCount).toBe(0);
            expect(deselectCount).toBe(0);
            menu.setSelected(item.item, true);
            expect(selectCount).toBe(1);
            expect(deselectCount).toBe(0);
            menu.setSelected(item.item, false);
            expect(selectCount).toBe(1);
            expect(deselectCount).toBe(1);
        });
        it("Can't select items that aren't in the menu", () => {
            const menu = createMenu(items);
            const item = createDummyMenuItem();
            menu.setSelected(item, true);
            expect(menu.getSelected()).toEqual([]);
        });
        it("Automatically deselects items when removed", () => {
            const item = createDummyPrioritizedMenuItem({generateID: true});
            const menu = createMenu([...items, item]);
            menu.setSelected(item.item, true);
            expect(menu.getSelected()).toEqual([item.item]);
            menu.removeItem(item);
            menu.flushBatch();
            expect(menu.getSelected()).toEqual([]);
        });
    });

    describe("PrioritizedMenu.setCursor / PrioritizedMenu.getCursor", () => {
        const someCategory: ICategory = {
            name: "Bob",
            description: "some category for Bob",
            item: createDummyMenuItem(),
        };
        const items = [
            createDummyPrioritizedMenuItem({noSelect: true, generateID: true}),
            createDummyPrioritizedMenuItem({generateID: true}),
            createDummyPrioritizedMenuItem({category: someCategory, generateID: true}),
        ];
        it("Has the correct initial cursor", () => {
            expect(createMenu().getCursor()).toEqual(null);
            // It won't select unselectable items
            expect(createMenu(items).getCursor()).toEqual(items[1].item);
        });
        it("Properly updates the cursor", () => {
            const menu = createMenu(items);
            menu.setCursor(items[2].item);
            expect(menu.getCursor()).toEqual(items[2].item);
        });
        it("Calls onCursor actions", () => {
            let selectCount = 0;
            let deselectCount = 0;
            const item = createDummyPrioritizedMenuItem({
                actionBindings: [
                    onCursorAction.createBinding((selected, m) => {
                        if (selected) selectCount++;
                        else deselectCount++;
                        expect(m).toEqual(menu);
                    }),
                ],
            });
            const menu = createMenu([...items, item]);
            expect(selectCount).toBe(0);
            expect(deselectCount).toBe(0);
            menu.setCursor(item.item);
            expect(selectCount).toBe(1);
            expect(deselectCount).toBe(0);
            menu.setCursor(null);
            expect(selectCount).toBe(1);
            expect(deselectCount).toBe(1);
        });
        it("Can't set item as cursor if not in the menu", () => {
            const menu = createMenu(items);
            const item = createDummyPrioritizedMenuItem({});
            menu.setCursor(item.item);
            expect(menu.getCursor()).not.toEqual(item.item);
        });
        it("Automatically selects another cursor when cursor is removed", () => {
            const item = createDummyPrioritizedMenuItem({generateID: true});
            const menu = createMenu([...items, item]);
            menu.setCursor(item.item);
            expect(menu.getCursor()).toEqual(item.item);
            menu.removeItem(item);
            menu.flushBatch();
            expect(menu.getCursor()).not.toEqual(item.item);
            expect(menu.getCursor()).not.toEqual(null);

            items.forEach(item => menu.removeItem(item));
            menu.flushBatch();
            expect(menu.getItems().length).toBe(0);
            expect(menu.getCursor()).toEqual(null);
        });
    });
    describe("PrioritizedMenu.getAllSelected", () => {
        const items = [
            createDummyPrioritizedMenuItem({}),
            createDummyPrioritizedMenuItem({}),
            createDummyPrioritizedMenuItem({}),
        ];
        it("Combines the selection and cursor if present", () => {
            const item = createDummyPrioritizedMenuItem({});
            const item2 = createDummyPrioritizedMenuItem({});
            const menu = createMenu([...items, item, item2]);
            menu.setCursor(item.item);
            expect(menu.getAllSelected()).toEqual([item.item]);
            menu.setSelected(item2.item);
            expect(menu.getAllSelected()).toEqual([item2.item, item.item]);
        });
        it("Returns the selection if no cursor is present", () => {
            const item = createDummyPrioritizedMenuItem({});
            const item2 = createDummyPrioritizedMenuItem({});
            const menu = createMenu([...items, item, item2]);
            menu.setCursor(null);
            menu.setSelected(item2.item);
            expect(menu.getAllSelected()).toEqual([item2.item]);
        });
        it("Only includes items once", () => {
            const item = createDummyPrioritizedMenuItem({});
            const item2 = createDummyPrioritizedMenuItem({});
            const menu = createMenu([...items, item, item2]);
            menu.setCursor(item.item);
            expect(menu.getAllSelected()).toEqual([item.item]);
            menu.setSelected(item.item);
            expect(menu.getAllSelected()).toEqual([item.item]);
        });
    });
    describe("PrioritizedMenu.destroy", () => {
        const someCategory: ICategory = {
            name: "Bob",
            description: "some category for Bob",
            item: createDummyMenuItem(),
        };
        const items = [
            createDummyPrioritizedMenuItem({}),
            createDummyPrioritizedMenuItem({}),
            createDummyPrioritizedMenuItem({category: someCategory}),
        ];
        let menu: PrioritizedMenu;
        beforeEach(() => {
            menu = createMenu(items);
        });
        it("Deselects all items", () => {
            let deselectCount = 0;
            const item = createDummyPrioritizedMenuItem({
                actionBindings: [
                    onSelectAction.createBinding((selected, m) => {
                        if (!selected) deselectCount++;
                        expect(m).toEqual(menu);
                    }),
                ],
            });
            menu.addItem(item);
            menu.flushBatch();
            menu.setSelected(item.item, true);
            expect(menu.getSelected()).toEqual([item.item]);
            expect(deselectCount).toBe(0);
            menu.destroy();
            expect(menu.getSelected()).toEqual([]);
            expect(deselectCount).toBe(1);
        });
        it("Deselects the cursor", () => {
            let deselectCount = 0;
            const item = createDummyPrioritizedMenuItem({
                actionBindings: [
                    onCursorAction.createBinding((selected, m) => {
                        if (!selected) deselectCount++;
                        expect(m).toEqual(menu);
                    }),
                ],
            });
            menu.addItem(item);
            menu.flushBatch();
            menu.setCursor(item.item);
            expect(menu.getCursor()).toEqual(item.item);
            expect(deselectCount).toBe(0);
            menu.destroy();
            expect(menu.getCursor()).toEqual(null);
            expect(deselectCount).toBe(1);
        });
        it("Removes all items", () => {
            expect(menu.getItems()).toEqual([
                items[0].item,
                items[1].item,
                someCategory.item,
                items[2].item,
            ]);
            menu.destroy();
            expect(menu.getItems()).toEqual([]);
        });
        it("Blocks changing the cursor", () => {
            let selectCount = 0;
            const item = createDummyPrioritizedMenuItem({
                actionBindings: [
                    onCursorAction.createBinding((selected, m) => {
                        if (selected) selectCount++;
                        expect(m).toEqual(menu);
                    }),
                ],
            });
            menu.addItem(item);
            menu.flushBatch();
            expect(menu.getCursor()).not.toEqual(null);
            menu.destroy();
            menu.setCursor(items[0].item);
            expect(menu.getCursor()).toEqual(null);
            expect(selectCount).toBe(0);
        });
        it("Blocks selecting of items", () => {
            let selectCount = 0;
            const item = createDummyPrioritizedMenuItem({
                actionBindings: [
                    onSelectAction.createBinding((selected, m) => {
                        if (selected) selectCount++;
                        expect(m).toEqual(menu);
                    }),
                ],
            });
            menu.addItem(item);
            menu.flushBatch();
            menu.destroy();
            menu.setSelected(items[0].item, true);
            expect(menu.getSelected()).toEqual([]);
            expect(selectCount).toBe(0);
        });
    });
    describe("Getters can be subscribed to", () => {
        let menu: PrioritizedMenu;
        const items = [
            createDummyPrioritizedMenuItem({}),
            createDummyPrioritizedMenuItem({}),
            createDummyPrioritizedMenuItem({}),
        ];
        beforeEach(() => {
            menu = createMenu(items);
        });
        describe("Menu.getItems", () => {
            it("Correctly subscribes to changes", () => {
                const item = createDummyPrioritizedMenuItem({});
                const item2 = createDummyPrioritizedMenuItem({});
                const callback = jest.fn(() => {});
                expect(
                    menu.getItems({call: callback, registerRemover: () => {}})
                ).toEqual(items.map(({item}) => item));
                expect(callback.mock.calls.length).toBe(0);
                menu.addItem(item);
                menu.addItem(item2);
                menu.flushBatch();
                expect(callback.mock.calls.length).toBe(1);
            });
            it("Correctly indicates the loading state of the menu", async () => {
                const loading = new Field(false);
                const menu = new PrioritizedMenu(dummyContext, {
                    batchInterval: 10,
                    isLoading: loading,
                });

                const callback = jest.fn(() => {});

                menu.getItems({markIsLoading: callback});
                expect(callback.mock.calls.length).toBe(0);

                loading.set(true);
                menu.getItems({markIsLoading: callback});
                expect(callback.mock.calls.length).toBe(1);

                menu.getItems({markIsLoading: callback});
                expect(callback.mock.calls.length).toBe(2);

                loading.set(false);
                menu.getItems({markIsLoading: callback});
                expect(callback.mock.calls.length).toBe(2);
            });
            it("Correctly calls the hook when the loading status changes", async () => {
                const loading = new Field(false);
                const menu = new PrioritizedMenu(dummyContext, {
                    batchInterval: 10,
                    isLoading: loading,
                });

                const callback = jest.fn(() => {});
                new Observer(h => menu.getItems(h)).listen(callback, true);

                expect(callback.mock.calls.length).toBe(1);
                expect((callback.mock.calls[0] as any)[1]).toEqual({
                    isLoading: false,
                    exceptions: [],
                });

                loading.set(true);
                await wait();
                expect(callback.mock.calls.length).toBe(2);
                expect((callback.mock.calls[1] as any)[1]).toEqual({
                    isLoading: true,
                    exceptions: [],
                });

                loading.set(false);
                await wait();
                expect(callback.mock.calls.length).toBe(3);
                expect((callback.mock.calls[2] as any)[1]).toEqual({
                    isLoading: false,
                    exceptions: [],
                });
            });
        });
        describe("Menu.getSelected", () => {
            it("Correctly subscribes to changes", () => {
                const callback = jest.fn(() => {});
                expect(
                    menu.getSelected({call: callback, registerRemover: () => {}})
                ).toEqual([]);
                expect(callback.mock.calls.length).toBe(0);
                menu.setSelected(items[2].item, true);
                expect(callback.mock.calls.length).toBe(1);
            });
        });
        describe("Menu.getCursor", () => {
            it("Correctly subscribes to changes", () => {
                const callback = jest.fn(() => {});
                expect(
                    menu.getCursor({call: callback, registerRemover: () => {}})
                ).toEqual(items[0].item);
                expect(callback.mock.calls.length).toBe(0);
                menu.setCursor(items[2].item);
                expect(callback.mock.calls.length).toBe(1);
            });
        });
        describe("Menu.getAllSelected", () => {
            it("Correctly subscribes to changes", () => {
                const callback = jest.fn(() => {});
                expect(
                    menu.getAllSelected({call: callback, registerRemover: () => {}})
                ).toEqual([items[0].item]);
                expect(callback.mock.calls.length).toBe(0);
                menu.setCursor(items[2].item);
                expect(callback.mock.calls.length).toBe(1);
                menu.setSelected(items[1].item, true);
                expect(callback.mock.calls.length).toBe(2);
            });
        });
    });

    describe("categoryConfig", () => {
        describe("categoryConfig.maxCategoryItemCount", () => {
            const items = [
                createDummyPrioritizedMenuItem({priority: 2}),
                createDummyPrioritizedMenuItem({priority: 1}),
                createDummyPrioritizedMenuItem({priority: 3}),
            ];
            let menu: PrioritizedMenu;
            beforeEach(() => {
                menu = new PrioritizedMenu(dummyContext, {maxCategoryItemCount: 2});
            });
            it("Allows the number of items for each category to be limited", () => {
                items.forEach(item => menu.addItem(item));
                menu.flushBatch();
                expect(menu.getItems()).toEqual([items[2].item, items[0].item]);
            });
            it("Considers separate categories", () => {
                const someCategory: ICategory = {
                    name: "Bob",
                    description: "some category for Bob",
                    item: createDummyMenuItem(),
                };
                const menu = new PrioritizedMenu(dummyContext, {maxCategoryItemCount: 2});

                const items2 = [
                    createDummyPrioritizedMenuItem({category: someCategory}),
                    createDummyPrioritizedMenuItem({category: someCategory}),
                    createDummyPrioritizedMenuItem({category: someCategory}),
                ];
                items.forEach(item => menu.addItem(item));
                items2.forEach(item => menu.addItem(item));
                menu.flushBatch();
                expect(menu.getItems()).toEqual([
                    items[2].item,
                    items[0].item,
                    someCategory.item,
                    ...items2.slice(0, 2).map(({item}) => item),
                ]);
            });
            describe("OnMenuChange", () => {
                it("Doesn't call onMenuChange to inform about addition if the item wasn't added", () => {
                    items.forEach(item => menu.addItem(item));
                    const onMenuChange = jest.fn();
                    const item = createDummyPrioritizedMenuItem({
                        priority: 1,
                        generateID: true,
                        actionBindings: [onMenuChangeAction.createBinding(onMenuChange)],
                    });
                    menu.addItem(item);
                    menu.flushBatch();
                    expect(onMenuChange.mock.calls.length).toBe(0);
                });
                it("Does call onMenuChange to inform about removal if an item got pushed off the list", () => {
                    const onMenuChange = jest.fn();
                    const item = createDummyPrioritizedMenuItem({
                        priority: 1,
                        generateID: true,
                        actionBindings: [onMenuChangeAction.createBinding(onMenuChange)],
                    });
                    menu.addItem(item);
                    menu.flushBatch();

                    // Add higher priority items
                    items.forEach(item => menu.addItem(item));
                    menu.addItem(item);
                    menu.flushBatch();

                    expect(onMenuChange.mock.calls.length).toBe(2);
                    expect(onMenuChange.mock.calls[0]).toEqual([menu, true]);
                    expect(onMenuChange.mock.calls[1]).toEqual([menu, false]);
                });
            });
        });

        describe("categoryConfig.getCategory", () => {
            it("Allows categories to be ignored", () => {
                const someCategory: ICategory = {
                    name: "Bob",
                    description: "some category for Bob",
                    item: createDummyMenuItem(),
                };
                const menu = new PrioritizedMenu(dummyContext, {
                    getCategory: () => undefined,
                });
                const items = [
                    createDummyPrioritizedMenuItem({}),
                    createDummyPrioritizedMenuItem({}),
                    createDummyPrioritizedMenuItem({}),
                ];
                const items2 = [
                    createDummyPrioritizedMenuItem({category: someCategory}),
                    createDummyPrioritizedMenuItem({category: someCategory}),
                    createDummyPrioritizedMenuItem({category: someCategory}),
                ];
                items.forEach(item => menu.addItem(item));
                items2.forEach(item => menu.addItem(item));
                menu.flushBatch();
                expect(menu.getItems()).toEqual([
                    ...items.map(({item}) => item),
                    ...items2.map(({item}) => item),
                ]);
            });
            it("Allows categories to be altered", () => {
                const someCategory: ICategory = {
                    name: "Bob",
                    description: "some category for Bob",
                    item: createDummyMenuItem(),
                };
                const menu = new PrioritizedMenu(dummyContext, {
                    getCategory: () => someCategory,
                });
                const items = [
                    createDummyPrioritizedMenuItem({}),
                    createDummyPrioritizedMenuItem({}),
                    createDummyPrioritizedMenuItem({}),
                ];
                const items2 = [
                    createDummyPrioritizedMenuItem({category: someCategory}),
                    createDummyPrioritizedMenuItem({category: someCategory}),
                    createDummyPrioritizedMenuItem({category: someCategory}),
                ];
                items.forEach(item => menu.addItem(item));
                items2.forEach(item => menu.addItem(item));
                menu.flushBatch();
                expect(menu.getItems()).toEqual([
                    someCategory.item,
                    ...items.map(({item}) => item),
                    ...items2.map(({item}) => item),
                ]);
            });
        });

        describe("categoryConfig.sortCategories", () => {
            it("Allows category orders to be changed", () => {
                const someCategory: ICategory = {
                    name: "Bob",
                    description: "some category for Bob",
                    item: createDummyMenuItem(),
                };
                const menu = new PrioritizedMenu(dummyContext, {
                    sortCategories: categories =>
                        categories.map(({category}) => category).reverse(),
                });
                const items = [
                    createDummyPrioritizedMenuItem({}),
                    createDummyPrioritizedMenuItem({}),
                    createDummyPrioritizedMenuItem({}),
                ];
                const items2 = [
                    createDummyPrioritizedMenuItem({category: someCategory}),
                    createDummyPrioritizedMenuItem({category: someCategory}),
                    createDummyPrioritizedMenuItem({category: someCategory}),
                ];
                items.forEach(item => menu.addItem(item));
                items2.forEach(item => menu.addItem(item));
                menu.flushBatch();
                expect(menu.getItems()).toEqual([
                    someCategory.item,
                    ...items2.map(({item}) => item),
                    ...items.map(({item}) => item),
                ]);
            });
            it("Allows categories to be left out", () => {
                const someCategory: ICategory = {
                    name: "Bob",
                    description: "some category for Bob",
                    item: createDummyMenuItem(),
                };
                const menu = new PrioritizedMenu(dummyContext, {
                    sortCategories: () => [undefined],
                });
                const items = [
                    createDummyPrioritizedMenuItem({}),
                    createDummyPrioritizedMenuItem({}),
                    createDummyPrioritizedMenuItem({}),
                ];
                const items2 = [
                    createDummyPrioritizedMenuItem({category: someCategory}),
                    createDummyPrioritizedMenuItem({category: someCategory}),
                    createDummyPrioritizedMenuItem({category: someCategory}),
                ];
                items.forEach(item => menu.addItem(item));
                items2.forEach(item => menu.addItem(item));
                menu.flushBatch();
                expect(menu.getItems()).toEqual(items.map(({item}) => item));
            });
        });

        describe("categoryConfig.batchInterval", () => {
            it("Correctly flushes batches at this interval", async () => {
                const menu = new PrioritizedMenu(dummyContext, {
                    batchInterval: 200,
                });
                const items = [
                    createDummyPrioritizedMenuItem({}),
                    createDummyPrioritizedMenuItem({}),
                    createDummyPrioritizedMenuItem({}),
                    createDummyPrioritizedMenuItem({}),
                    createDummyPrioritizedMenuItem({}),
                ];
                items.forEach(item => menu.addItem(item));

                await wait(180);
                expect(menu.getItems()).toEqual([]);
                await wait(50);
                expect(menu.getItems()).toEqual(items.map(({item}) => item));
            });
        });
    });
});
