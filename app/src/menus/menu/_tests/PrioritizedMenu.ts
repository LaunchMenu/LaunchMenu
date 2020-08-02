import {PrioritizedMenu} from "../PrioritizedMenu";
import {createPrioritizedMenuItem} from "./PrioritizedMenuItem.helper";
import {wait} from "../../../_tests/wait.helper";
import {Observer} from "../../../utils/modelReact/Observer";
import {ICategory} from "../../actions/types/category/_types/ICategory";
import {createMenuItem} from "./MenuItem.helper";
import {IPrioritizedMenuItem} from "../_types/IPrioritizedMenuItem";
import {onSelectAction} from "../../actions/types/onSelect/onSelectAction";
import {onCursorAction} from "../../actions/types/onCursor/onCursorAction";
import {onMenuChangeAction} from "../../actions/types/onMenuChange/onMenuChangeAction";

const createMenu = (items?: IPrioritizedMenuItem[]) => {
    const menu = new PrioritizedMenu({
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
            new PrioritizedMenu();
        });
        it("Can be initialized with a config", () => {
            new PrioritizedMenu({
                batchInterval: 200,
            });
        });
    });
    describe("PrioritizedMenu.addItem / PrioritizedMenu.getItems", () => {
        it("Can add an item", async () => {
            const menu = createMenu();
            const item = createPrioritizedMenuItem({priority: 1});
            menu.addItem(item);
            await wait(20);
            expect(menu.getItems()).toEqual([item.item]);
        });
        it("Orders the items by priority", async () => {
            const menu = createMenu();
            const item = createPrioritizedMenuItem({priority: 1});
            const item2 = createPrioritizedMenuItem({priority: 4});
            const item3 = createPrioritizedMenuItem({priority: 3});
            menu.addItem(item);
            menu.addItem(item2);
            menu.addItem(item3);
            await wait(20);
            expect(menu.getItems()).toEqual([item2.item, item3.item, item.item]);
        });
        it("Orders items with equivalent priority in addition order", async () => {
            const menu = createMenu();
            const item = createPrioritizedMenuItem({priority: 1});
            const item2 = createPrioritizedMenuItem({priority: 3});
            const item3 = createPrioritizedMenuItem({priority: 3});
            menu.addItem(item);
            menu.addItem(item2);
            menu.addItem(item3);
            await wait(20);
            expect(menu.getItems()).toEqual([item2.item, item3.item, item.item]);
        });
        it("Doesn't add items with priority 0", async () => {
            const menu = createMenu();
            const item = createPrioritizedMenuItem({priority: 1});
            const item2 = createPrioritizedMenuItem({priority: 0});
            menu.addItem(item);
            menu.addItem(item2);
            await wait(20);
            expect(menu.getItems()).toEqual([item.item]);
        });
        it("Batches additions", async () => {
            const menu = createMenu();
            const item = createPrioritizedMenuItem({priority: 1});
            const item2 = createPrioritizedMenuItem({priority: 4});
            const item3 = createPrioritizedMenuItem({priority: 3});
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
                item: createMenuItem(),
            };
            const someCategory2: ICategory = {
                name: "John",
                description: "some category for John",
                item: createMenuItem(),
            };
            const items = [
                createPrioritizedMenuItem({priority: 5}),
                createPrioritizedMenuItem({priority: 1}),
                createPrioritizedMenuItem({priority: 3, category: someCategory}),
                createPrioritizedMenuItem({priority: 5, category: someCategory}),
                createPrioritizedMenuItem({priority: 6, category: someCategory2}),
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
        });
        it("Calls onMenuChange actions", async () => {
            const item = createPrioritizedMenuItem({priority: 1});
            const onMenuChange = jest.fn();
            item.item.actionBindings.push(
                onMenuChangeAction.createBinding({
                    onMenuChange,
                })
            );
            const menu = createMenu();
            menu.addItem(item);
            await wait(20);
            expect(onMenuChange.mock.calls.length).toBe(1);
            expect(onMenuChange.mock.calls[0]).toEqual([menu, true]);
        });
    });
    describe("PrioritizedMenu.addItems", () => {
        it("Can add items from generators", async () => {
            const menu = createMenu();
            const item = createPrioritizedMenuItem({priority: 1});
            const item2 = createPrioritizedMenuItem({priority: 4});
            const item3 = createPrioritizedMenuItem({priority: 3});
            let finished = false;
            const generator = menu.addItems(async cb => {
                await cb(item);
                await cb(item2);
                await cb(item3);
                finished = true;
            });
            expect(finished).toBeFalsy();
            await generator.start();
            expect(finished).toBeTruthy();
            expect(menu.getItems()).toEqual([]);
            await wait(20);
            expect(menu.getItems()).toEqual([item2.item, item3.item, item.item]);
        });
        it("Allows the added generators to be controlled", async () => {
            const menu = createMenu();
            const item = createPrioritizedMenuItem({priority: 1});
            const item2 = createPrioritizedMenuItem({priority: 4});
            const item3 = createPrioritizedMenuItem({priority: 3});
            const generator = menu.addItems(async cb => {
                await cb(item);
                await cb(item2);
                generator.stop();
                await cb(item3);
            });
            await generator.start();
            await wait(20);
            expect(menu.getItems()).toEqual([item2.item, item.item]);
        });
    });
    describe("PrioritizedMenu.removeItem", () => {
        it("Removes the specified items, based on id", async () => {
            const menu = createMenu();
            const item = createPrioritizedMenuItem({priority: 1});
            const item2 = createPrioritizedMenuItem({priority: 4, generateID: true});
            const item3 = createPrioritizedMenuItem({priority: 3});
            menu.addItem(item);
            menu.addItem(item2);
            menu.addItem(item3);
            await wait(20);
            expect(menu.getItems()).toEqual([item2.item, item3.item, item.item]);
            menu.removeItem(item2);
            await wait(20);
            expect(menu.getItems()).toEqual([item3.item, item.item]);
        });
        it("Batches item removals", async () => {
            const menu = createMenu();
            const item = createPrioritizedMenuItem({priority: 1, generateID: true});
            const item2 = createPrioritizedMenuItem({priority: 4, generateID: true});
            const item3 = createPrioritizedMenuItem({priority: 3, generateID: true});
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
        it("Considers categories", async () => {
            const someCategory: ICategory = {
                name: "Bob",
                description: "some category for Bob",
                item: createMenuItem(),
            };
            const someCategory2: ICategory = {
                name: "John",
                description: "some category for John",
                item: createMenuItem(),
            };
            const items = [
                createPrioritizedMenuItem({priority: 5, generateID: true}),
                createPrioritizedMenuItem({priority: 1, generateID: true}),
                createPrioritizedMenuItem({
                    priority: 3,
                    category: someCategory,
                    generateID: true,
                }),
                createPrioritizedMenuItem({
                    priority: 5,
                    category: someCategory,
                    generateID: true,
                }),
                createPrioritizedMenuItem({
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
            const item = createPrioritizedMenuItem({priority: 1, generateID: true});
            const onMenuChange = jest.fn();
            item.item.actionBindings.push(
                onMenuChangeAction.createBinding({
                    onMenuChange,
                })
            );
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
            const item = createPrioritizedMenuItem({priority: 1, generateID: true});
            const item2 = createPrioritizedMenuItem({priority: 4, generateID: true});
            const item3 = createPrioritizedMenuItem({priority: 3, generateID: true});
            menu.addItem(item);
            menu.addItem(item2);
            menu.addItem(item3);
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item2.item, item3.item, item.item]);
        });
        it("Synchronously flushes item removal changes", async () => {
            const menu = createMenu();
            const item = createPrioritizedMenuItem({priority: 1, generateID: true});
            const item2 = createPrioritizedMenuItem({priority: 4, generateID: true});
            const item3 = createPrioritizedMenuItem({priority: 3, generateID: true});
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
    describe("PrioritizedMenu.updateContents", () => {
        it("Updates item priorities based on the passed filter", async () => {
            const menu = new PrioritizedMenu<string>({
                batchInterval: 10,
            });
            const item = createPrioritizedMenuItem({
                priority: 1,
                generateID: true,
                getUpdatedPriority: async (text: string) => (text.match(/h/) ? 2 : 1),
            });
            const item2 = createPrioritizedMenuItem({
                priority: 4,
                generateID: true,
                getUpdatedPriority: async (text: string) => (text.match(/i/) ? 2 : 1),
            });
            const item3 = createPrioritizedMenuItem({
                priority: 3,
                generateID: true,
                getUpdatedPriority: async (text: string) => (text.match(/j/) ? 2 : 1),
            });
            menu.addItem(item);
            menu.addItem(item2);
            menu.addItem(item3);

            await wait(20);
            expect(menu.getItems()).toEqual([item2.item, item3.item, item.item]);

            menu.updateContents("hi");
            await wait(20);
            expect(menu.getItems()).toEqual([item2.item, item.item, item3.item]);
        });
        it("Removes items with priority 0", async () => {
            const menu = new PrioritizedMenu<string>({
                batchInterval: 10,
            });
            const item = createPrioritizedMenuItem({
                priority: 1,
                generateID: true,
                getUpdatedPriority: async (text: string) => (text.match(/h/) ? 1 : 0),
            });
            const item2 = createPrioritizedMenuItem({
                priority: 4,
                generateID: true,
                getUpdatedPriority: async (text: string) => (text.match(/i/) ? 1 : 0),
            });
            const item3 = createPrioritizedMenuItem({
                priority: 3,
                generateID: true,
                getUpdatedPriority: async (text: string) => (text.match(/j/) ? 1 : 0),
            });
            menu.addItem(item);
            menu.addItem(item2);
            menu.addItem(item3);

            await wait(20);
            expect(menu.getItems()).toEqual([item2.item, item3.item, item.item]);

            menu.updateContents("hi");
            await wait(20);
            expect(menu.getItems()).toEqual([item2.item, item.item]);
        });
    });

    describe("PrioritizedMenu.setSelected / PrioritizedMenu.getSelected", () => {
        const items = [
            createPrioritizedMenuItem({priority: 3}),
            createPrioritizedMenuItem({priority: 1}),
            createPrioritizedMenuItem({priority: 5}),
            createPrioritizedMenuItem({priority: 2}),
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
            const item = createPrioritizedMenuItem({});
            let selectCount = 0;
            let deselectCount = 0;
            item.item.actionBindings.push(
                onSelectAction.createBinding({
                    onSelect: (selected, m) => {
                        if (selected) selectCount++;
                        else deselectCount++;
                        expect(m).toEqual(menu);
                    },
                })
            );
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
            const item = createMenuItem();
            menu.setSelected(item, true);
            expect(menu.getSelected()).toEqual([]);
        });
        it("Automatically deselects items when removed", () => {
            const item = createPrioritizedMenuItem({generateID: true});
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
            item: createMenuItem(),
        };
        const items = [
            createPrioritizedMenuItem({noSelect: true}),
            createPrioritizedMenuItem({}),
            createPrioritizedMenuItem({category: someCategory}),
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
            const item = createPrioritizedMenuItem({});
            let selectCount = 0;
            let deselectCount = 0;
            item.item.actionBindings.push(
                onCursorAction.createBinding({
                    onCursor: (selected, m) => {
                        if (selected) selectCount++;
                        else deselectCount++;
                        expect(m).toEqual(menu);
                    },
                })
            );
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
            const item = createPrioritizedMenuItem({});
            menu.setCursor(item.item);
            expect(menu.getCursor()).not.toEqual(item.item);
        });
        it("Automatically selects another cursor when cursor is removed", () => {
            const item = createPrioritizedMenuItem({generateID: true});
            const menu = createMenu([...items, item]);
            menu.setCursor(item.item);
            expect(menu.getCursor()).toEqual(item.item);
            menu.removeItem(item);
            menu.flushBatch();
            expect(menu.getCursor()).not.toEqual(item.item);
        });
    });
    describe("PrioritizedMenu.getAllSelected", () => {
        const items = [
            createPrioritizedMenuItem({}),
            createPrioritizedMenuItem({}),
            createPrioritizedMenuItem({}),
        ];
        it("Combines the selection and cursor if present", () => {
            const item = createPrioritizedMenuItem({});
            const item2 = createPrioritizedMenuItem({});
            const menu = createMenu([...items, item, item2]);
            menu.setCursor(item.item);
            expect(menu.getAllSelected()).toEqual([item.item]);
            menu.setSelected(item2.item);
            expect(menu.getAllSelected()).toEqual([item2.item, item.item]);
        });
        it("Returns the selection if no cursor is present", () => {
            const item = createPrioritizedMenuItem({});
            const item2 = createPrioritizedMenuItem({});
            const menu = createMenu([...items, item, item2]);
            menu.setCursor(null);
            menu.setSelected(item2.item);
            expect(menu.getAllSelected()).toEqual([item2.item]);
        });
        it("Only includes items once", () => {
            const item = createPrioritizedMenuItem({});
            const item2 = createPrioritizedMenuItem({});
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
            item: createMenuItem(),
        };
        const items = [
            createPrioritizedMenuItem({}),
            createPrioritizedMenuItem({}),
            createPrioritizedMenuItem({category: someCategory}),
        ];
        let menu: PrioritizedMenu;
        beforeEach(() => {
            menu = createMenu(items);
        });
        it("Deselects all items", () => {
            const item = createPrioritizedMenuItem({});
            let deselectCount = 0;
            item.item.actionBindings.push(
                onSelectAction.createBinding({
                    onSelect: (selected, m) => {
                        if (!selected) deselectCount++;
                        expect(m).toEqual(menu);
                    },
                })
            );
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
            const item = createPrioritizedMenuItem({});
            let deselectCount = 0;
            item.item.actionBindings.push(
                onCursorAction.createBinding({
                    onCursor: (selected, m) => {
                        if (!selected) deselectCount++;
                        expect(m).toEqual(menu);
                    },
                })
            );
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
            const item = createPrioritizedMenuItem({});
            let selectCount = 0;
            item.item.actionBindings.push(
                onCursorAction.createBinding({
                    onCursor: (selected, m) => {
                        if (selected) selectCount++;
                        expect(m).toEqual(menu);
                    },
                })
            );
            menu.addItem(item);
            menu.flushBatch();
            expect(menu.getCursor()).not.toEqual(null);
            menu.destroy();
            menu.setCursor(items[0].item);
            expect(menu.getCursor()).toEqual(null);
            expect(selectCount).toBe(0);
        });
        it("Blocks selecting of items", () => {
            const item = createPrioritizedMenuItem({});
            let selectCount = 0;
            item.item.actionBindings.push(
                onSelectAction.createBinding({
                    onSelect: (selected, m) => {
                        if (selected) selectCount++;
                        expect(m).toEqual(menu);
                    },
                })
            );
            menu.addItem(item);
            menu.flushBatch();
            menu.destroy();
            menu.setSelected(items[0].item, true);
            expect(menu.getSelected()).toEqual([]);
            expect(selectCount).toBe(0);
        });
        it("Stops generators", async () => {
            const item = createPrioritizedMenuItem({priority: 1});
            const item2 = createPrioritizedMenuItem({priority: 4});
            const item3 = createPrioritizedMenuItem({priority: 3});
            let reached = 0;
            menu.addItems(async cb => {
                await cb(item);
                reached = 1;
                await wait(20);
                await cb(item2);
                reached = 2;
                await wait(20);
                await cb(item3);
                reached = 3;
            });
            expect(reached).toBe(0);
            await wait(10);
            expect(reached).toBe(1);
            menu.destroy();
            await wait(40);
            expect(reached).not.toBe(3);
        });
    });
    describe("Getters can be subscribed to", () => {
        let menu: PrioritizedMenu;
        const items = [
            createPrioritizedMenuItem({}),
            createPrioritizedMenuItem({}),
            createPrioritizedMenuItem({}),
        ];
        beforeEach(() => {
            menu = createMenu(items);
        });
        describe("Menu.getItems", () => {
            it("Correctly subscribes to changes", () => {
                const item = createPrioritizedMenuItem({});
                const item2 = createPrioritizedMenuItem({});
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
                const item = createPrioritizedMenuItem({priority: 1});
                const item2 = createPrioritizedMenuItem({priority: 4});
                const item3 = createPrioritizedMenuItem({priority: 3});
                const callback = jest.fn(() => {});

                menu.getItems({markIsLoading: callback});
                expect(callback.mock.calls.length).toBe(0);

                menu.addItems(async cb => {
                    await cb(item);
                    await wait(20);
                    await cb(item2);
                    await wait(20);
                    await cb(item3);
                });
                menu.getItems({markIsLoading: callback});
                expect(callback.mock.calls.length).toBe(1);

                await wait(30);
                menu.getItems({markIsLoading: callback});
                expect(callback.mock.calls.length).toBe(2);

                await wait(30);
                menu.getItems({markIsLoading: callback});
                expect(callback.mock.calls.length).toBe(2);
            });
            it("Correctly calls the hook when the loading status changes", async () => {
                const callback = jest.fn(() => {});
                new Observer(h => menu.getItems(h)).listen(callback, true);

                expect(callback.mock.calls.length).toBe(1);
                expect((callback.mock.calls[0] as any)[1]).toEqual({
                    isLoading: false,
                    exceptions: [],
                });

                menu.addItems(async cb => {
                    await wait(20);
                });
                await wait(0);
                expect(callback.mock.calls.length).toBe(2);
                expect((callback.mock.calls[1] as any)[1]).toEqual({
                    isLoading: true,
                    exceptions: [],
                });

                await wait(30);
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
                createPrioritizedMenuItem({priority: 2}),
                createPrioritizedMenuItem({priority: 1}),
                createPrioritizedMenuItem({priority: 3}),
            ];
            let menu: PrioritizedMenu;
            beforeEach(() => {
                menu = new PrioritizedMenu({maxCategoryItemCount: 2});
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
                    item: createMenuItem(),
                };
                const menu = new PrioritizedMenu({maxCategoryItemCount: 2});

                const items2 = [
                    createPrioritizedMenuItem({category: someCategory}),
                    createPrioritizedMenuItem({category: someCategory}),
                    createPrioritizedMenuItem({category: someCategory}),
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
                    const item = createPrioritizedMenuItem({
                        priority: 1,
                        generateID: true,
                    });
                    const onMenuChange = jest.fn();
                    item.item.actionBindings.push(
                        onMenuChangeAction.createBinding({
                            onMenuChange,
                        })
                    );
                    menu.addItem(item);
                    menu.flushBatch();
                    expect(onMenuChange.mock.calls.length).toBe(0);
                });
                it("Does call onMenuChange to inform about removal if an item got pushed off the list", () => {
                    const item = createPrioritizedMenuItem({
                        priority: 1,
                        generateID: true,
                    });
                    const onMenuChange = jest.fn();
                    item.item.actionBindings.push(
                        onMenuChangeAction.createBinding({
                            onMenuChange,
                        })
                    );
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
                    item: createMenuItem(),
                };
                const menu = new PrioritizedMenu({getCategory: () => undefined});
                const items = [
                    createPrioritizedMenuItem({}),
                    createPrioritizedMenuItem({}),
                    createPrioritizedMenuItem({}),
                ];
                const items2 = [
                    createPrioritizedMenuItem({category: someCategory}),
                    createPrioritizedMenuItem({category: someCategory}),
                    createPrioritizedMenuItem({category: someCategory}),
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
                    item: createMenuItem(),
                };
                const menu = new PrioritizedMenu({getCategory: () => someCategory});
                const items = [
                    createPrioritizedMenuItem({}),
                    createPrioritizedMenuItem({}),
                    createPrioritizedMenuItem({}),
                ];
                const items2 = [
                    createPrioritizedMenuItem({category: someCategory}),
                    createPrioritizedMenuItem({category: someCategory}),
                    createPrioritizedMenuItem({category: someCategory}),
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
                    item: createMenuItem(),
                };
                const menu = new PrioritizedMenu({
                    sortCategories: categories =>
                        categories.map(({category}) => category).reverse(),
                });
                const items = [
                    createPrioritizedMenuItem({}),
                    createPrioritizedMenuItem({}),
                    createPrioritizedMenuItem({}),
                ];
                const items2 = [
                    createPrioritizedMenuItem({category: someCategory}),
                    createPrioritizedMenuItem({category: someCategory}),
                    createPrioritizedMenuItem({category: someCategory}),
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
                    item: createMenuItem(),
                };
                const menu = new PrioritizedMenu({sortCategories: () => [undefined]});
                const items = [
                    createPrioritizedMenuItem({}),
                    createPrioritizedMenuItem({}),
                    createPrioritizedMenuItem({}),
                ];
                const items2 = [
                    createPrioritizedMenuItem({category: someCategory}),
                    createPrioritizedMenuItem({category: someCategory}),
                    createPrioritizedMenuItem({category: someCategory}),
                ];
                items.forEach(item => menu.addItem(item));
                items2.forEach(item => menu.addItem(item));
                menu.flushBatch();
                expect(menu.getItems()).toEqual(items.map(({item}) => item));
            });
        });

        describe("categoryConfig.batchInterval", () => {
            it("Correctly flushes batches at this interval", async () => {
                const menu = new PrioritizedMenu({
                    batchInterval: 200,
                });
                const items = [
                    createPrioritizedMenuItem({}),
                    createPrioritizedMenuItem({}),
                    createPrioritizedMenuItem({}),
                    createPrioritizedMenuItem({}),
                    createPrioritizedMenuItem({}),
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
