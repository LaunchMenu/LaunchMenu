import {createDummyMenuItem} from "./MenuItem.helper";
import {Menu} from "../Menu";
import {Observer} from "../../../utils/modelReact/Observer";
import {wait} from "../../../_tests/wait.helper";
import {dummyContext} from "../../../_tests/context.helper";
import {Field} from "model-react";
import {onMenuChangeAction} from "../../../actions/types/onMenuChange/onMenuChangAction";
import {onSelectAction} from "../../../actions/types/onSelect/onSelectAction";
import {onCursorAction} from "../../../actions/types/onCursor/onCursorAction";
import {getCategoryAction} from "../../../actions/types/category/getCategoryAction";
import {ICategory} from "../../../actions/types/category/_types/ICategory";

describe("Menu", () => {
    describe("new Menu", () => {
        it("Properly creates a new menu", () => {
            new Menu(dummyContext);
        });
        it("Can be initialized with an item array", () => {
            const items = [
                createDummyMenuItem(),
                createDummyMenuItem(),
                createDummyMenuItem(),
            ];
            const menu = new Menu(dummyContext, items);
            expect(menu.getItems().length).toBe(3);
            expect(menu.getItems()).toEqual(items);
        });
    });

    describe("Menu.addItem / Menu.getItems", () => {
        let menu: Menu;
        const items = [
            createDummyMenuItem(),
            createDummyMenuItem(),
            createDummyMenuItem(),
        ];
        beforeEach(() => {
            menu = new Menu(dummyContext, items);
        });

        it("Can add an item", () => {
            const item = createDummyMenuItem();
            menu.addItem(item);
            expect(menu.getItems()).toEqual([...items, item]);
        });
        it("Can add an item at the specified index", () => {
            const item = createDummyMenuItem();
            menu.addItem(item, 1);
            expect(menu.getItems()).toEqual([items[0], item, items[1], items[2]]);
        });
        describe("Uses categories", () => {
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
                createDummyMenuItem(),
                createDummyMenuItem(),
                createDummyMenuItem({category: someCategory}),
                createDummyMenuItem({category: someCategory2}),
            ];

            it("Inserts the correct category in the menu", () => {
                const menu = new Menu(dummyContext);
                menu.addItem(items[0]);
                menu.addItem(items[1]);
                menu.addItem(items[2]);
                expect(menu.getItems()).toEqual([
                    items[0],
                    items[1],
                    someCategory.item,
                    items[2],
                ]);

                const menu2 = new Menu(dummyContext);
                menu2.addItem(items[2]);
                menu2.addItem(items[1]);
                menu2.addItem(items[0]);
                expect(menu2.getItems()).toEqual([
                    items[1],
                    items[0],
                    someCategory.item,
                    items[2],
                ]);
            });
            it("Adds categories in the order items of said categories were added", () => {
                const menu = new Menu(dummyContext);
                menu.addItem(items[0]);
                menu.addItem(items[1]);
                menu.addItem(items[2]);
                menu.addItem(items[3]);
                expect(menu.getItems()).toEqual([
                    items[0],
                    items[1],
                    someCategory.item,
                    items[2],
                    someCategory2.item,
                    items[3],
                ]);

                const menu2 = new Menu(dummyContext);
                menu2.addItem(items[1]);
                menu2.addItem(items[3]);
                menu2.addItem(items[2]);
                menu2.addItem(items[0]);
                expect(menu2.getItems()).toEqual([
                    items[1],
                    items[0],
                    someCategory2.item,
                    items[3],
                    someCategory.item,
                    items[2],
                ]);
            });
        });
        it("Calls onMenuChange actions", () => {
            const onMenuChange = jest.fn();
            const item = createDummyMenuItem({
                actionBindings: [onMenuChangeAction.createBinding(onMenuChange)],
            });
            const menu = new Menu(dummyContext, items);
            menu.addItem(item);
            expect(onMenuChange.mock.calls.length).toBe(1);
            expect(onMenuChange.mock.calls[0]).toEqual([menu, true]);

            const onMenuChange2 = jest.fn();
            const item2 = createDummyMenuItem({
                actionBindings: [onMenuChangeAction.createBinding(onMenuChange2)],
            });
            const menu2 = new Menu(dummyContext, [...items, item2]);
            expect(onMenuChange2.mock.calls.length).toBe(1);
            expect(onMenuChange2.mock.calls[0]).toEqual([menu2, true]);
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
            createDummyMenuItem(),
            createDummyMenuItem(),
            createDummyMenuItem({category: someCategory}),
            createDummyMenuItem({category: someCategory2}),
        ];
        it("Correctly retrieves the categories", () => {
            const menu = new Menu(dummyContext);
            menu.addItem(items[0]);
            menu.addItem(items[1]);
            menu.addItem(items[2]);
            menu.addItem(items[3]);
            expect(menu.getCategories()).toEqual([
                {category: undefined, items: [items[0], items[1]]},
                {category: someCategory, items: [items[2]]},
                {category: someCategory2, items: [items[3]]},
            ]);
        });
        it("Can be subscribed to", async () => {
            const menu = new Menu(dummyContext);
            menu.addItem(items[0]);
            menu.addItem(items[1]);
            menu.addItem(items[2]);
            menu.addItem(items[3]);

            const cb = jest.fn();
            new Observer(h => menu.getCategories(h)).listen(cb);

            const newItem = createDummyMenuItem({category: someCategory2});
            menu.addItem(newItem);
            await wait(0);
            expect(cb.mock.calls.length).toBe(1);
            expect(cb.mock.calls[0][0]).toEqual([
                {category: undefined, items: [items[0], items[1]]},
                {category: someCategory, items: [items[2]]},
                {category: someCategory2, items: [items[3], newItem]},
            ]);
        });
    });

    describe("Menu.addItems", () => {
        it("Can add items", () => {
            const items = [
                createDummyMenuItem(),
                createDummyMenuItem(),
                createDummyMenuItem(),
            ];
            const menu = new Menu(dummyContext, items);
            const item = createDummyMenuItem();
            const item2 = createDummyMenuItem();
            menu.addItems([item, item2]);
            expect(menu.getItems()).toEqual([...items, item, item2]);
        });
        describe("Considers categories", () => {
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
                createDummyMenuItem(),
                createDummyMenuItem(),
                createDummyMenuItem({category: someCategory}),
                createDummyMenuItem({category: someCategory2}),
            ];

            it("Inserts the correct category in the menu", () => {
                const menu = new Menu(dummyContext);
                menu.addItems(items.slice(0, 3));
                expect(menu.getItems()).toEqual([
                    items[0],
                    items[1],
                    someCategory.item,
                    items[2],
                ]);

                const menu2 = new Menu(dummyContext);
                menu2.addItems(items.slice(0, 3).reverse());
                expect(menu2.getItems()).toEqual([
                    items[1],
                    items[0],
                    someCategory.item,
                    items[2],
                ]);
            });
            it("Adds categories in the order items of said categories were added", () => {
                const menu = new Menu(dummyContext);
                menu.addItems(items);
                expect(menu.getItems()).toEqual([
                    items[0],
                    items[1],
                    someCategory.item,
                    items[2],
                    someCategory2.item,
                    items[3],
                ]);

                const menu2 = new Menu(dummyContext);
                menu2.addItems([...items].reverse());
                expect(menu2.getItems()).toEqual([
                    items[1],
                    items[0],
                    someCategory2.item,
                    items[3],
                    someCategory.item,
                    items[2],
                ]);
            });
            it("Moves items to their new category when its category changes", async () => {
                const menu = new Menu(dummyContext);
                const category = new Field(someCategory);
                const item = createDummyMenuItem({
                    actionBindings: h => [
                        getCategoryAction.createBinding(category.get(h ?? null)),
                    ],
                });
                menu.addItems([...items, item]);
                expect(menu.getItems()).toEqual([
                    items[0],
                    items[1],
                    someCategory.item,
                    items[2],
                    item,
                    someCategory2.item,
                    items[3],
                ]);
                category.set(someCategory2);
                await wait();
                expect(menu.getItems()).toEqual([
                    items[0],
                    items[1],
                    someCategory.item,
                    items[2],
                    someCategory2.item,
                    items[3],
                    item,
                ]);
                category.set(someCategory);
                await wait();
                expect(menu.getItems()).toEqual([
                    items[0],
                    items[1],
                    someCategory.item,
                    items[2],
                    item,
                    someCategory2.item,
                    items[3],
                ]);
            });
        });
        it("Calls onMenuChange actions", () => {
            const onMenuChange = jest.fn();
            const item = createDummyMenuItem({
                actionBindings: [onMenuChangeAction.createBinding(onMenuChange)],
            });
            const onMenuChange2 = jest.fn();
            const item2 = createDummyMenuItem({
                actionBindings: [onMenuChangeAction.createBinding(onMenuChange2)],
            });

            const menu = new Menu(dummyContext);
            menu.addItems([item, item2]);
            expect(onMenuChange.mock.calls.length).toBe(1);
            expect(onMenuChange.mock.calls[0]).toEqual([menu, true]);
            expect(onMenuChange2.mock.calls.length).toBe(1);
            expect(onMenuChange2.mock.calls[0]).toEqual([menu, true]);
        });
    });

    describe("Menu.removeItem", () => {
        const items = [
            createDummyMenuItem(),
            createDummyMenuItem(),
            createDummyMenuItem(),
        ];
        let menu: Menu;
        beforeEach(() => {
            menu = new Menu(dummyContext, items);
        });

        it("Can remove items", () => {
            menu.removeItem(items[1]);
            expect(menu.getItems()).toEqual([items[0], items[2]]);
        });

        it("Correctly informs whether the item was removed", () => {
            expect(menu.removeItem(items[1])).toBeTruthy();
            expect(menu.removeItem(createDummyMenuItem())).toBeFalsy();
            expect(menu.getItems()).toEqual([items[0], items[2]]);
        });
        describe("Considers categories", () => {
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
            const item = createDummyMenuItem({category: someCategory});
            const item2 = createDummyMenuItem({category: someCategory2});
            const item3 = createDummyMenuItem({category: someCategory2});

            it("Removes items from their category", () => {
                menu.addItems([item, item3, item2]);
                expect(menu.getItems()).toEqual([
                    ...items,
                    someCategory.item,
                    item,
                    someCategory2.item,
                    item3,
                    item2,
                ]);
                menu.removeItem(item3);
                expect(menu.getItems()).toEqual([
                    ...items,
                    someCategory.item,
                    item,
                    someCategory2.item,
                    item2,
                ]);
            });
            it("Removes empty categories", () => {
                menu.addItems([item3, item2, item]);
                expect(menu.getItems()).toEqual([
                    ...items,
                    someCategory2.item,
                    item3,
                    item2,
                    someCategory.item,
                    item,
                ]);
                menu.removeItem(item3);
                menu.removeItem(item2);
                expect(menu.getItems()).toEqual([...items, someCategory.item, item]);
            });
        });
        it("Calls onMenuChange actions", () => {
            const onMenuChange = jest.fn();
            const item = createDummyMenuItem({
                actionBindings: [onMenuChangeAction.createBinding(onMenuChange)],
            });
            const menu = new Menu(dummyContext, [...items, item]);
            expect(onMenuChange.mock.calls.length).toBe(1);
            menu.removeItem(item);
            expect(onMenuChange.mock.calls.length).toBe(2);
            expect(onMenuChange.mock.calls[0]).toEqual([menu, true]);
            expect(onMenuChange.mock.calls[1]).toEqual([menu, false]);
        });
    });

    describe("Menu.removeItems", () => {
        const items = [
            createDummyMenuItem(),
            createDummyMenuItem(),
            createDummyMenuItem(),
        ];
        let menu: Menu;
        beforeEach(() => {
            menu = new Menu(dummyContext, items);
        });

        it("Can remove items", () => {
            menu.removeItems([items[1], items[0]]);
            expect(menu.getItems()).toEqual([items[2]]);
        });

        it("Correctly informs whether any of the items were removed", () => {
            expect(menu.removeItems([items[1], createDummyMenuItem()])).toBeTruthy();
            expect(
                menu.removeItems([createDummyMenuItem(), createDummyMenuItem()])
            ).toBeFalsy();
            expect(menu.getItems()).toEqual([items[0], items[2]]);
        });
        describe("Considers categories", () => {
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
            const item = createDummyMenuItem({category: someCategory});
            const item2 = createDummyMenuItem({category: someCategory2});
            const item3 = createDummyMenuItem({category: someCategory2});

            it("Removes items from their category", () => {
                menu.addItems([item, item3, item2]);
                expect(menu.getItems()).toEqual([
                    ...items,
                    someCategory.item,
                    item,
                    someCategory2.item,
                    item3,
                    item2,
                ]);
                menu.removeItems([item3, item]);
                expect(menu.getItems()).toEqual([...items, someCategory2.item, item2]);
            });
            it("Removes empty categories", () => {
                menu.addItems([item, item3, item2]);
                expect(menu.getItems()).toEqual([
                    ...items,
                    someCategory.item,
                    item,
                    someCategory2.item,
                    item3,
                    item2,
                ]);
                menu.removeItems([item2, item3]);
                expect(menu.getItems()).toEqual([...items, someCategory.item, item]);
            });
        });
        it("Calls onMenuChange actions", () => {
            const onMenuChange = jest.fn();
            const item = createDummyMenuItem({
                actionBindings: [onMenuChangeAction.createBinding(onMenuChange)],
            });
            const item2 = createDummyMenuItem();
            const menu = new Menu(dummyContext, [...items, item, item2]);
            expect(onMenuChange.mock.calls.length).toBe(1);
            menu.removeItems([item, item2]);
            expect(onMenuChange.mock.calls.length).toBe(2);
            expect(onMenuChange.mock.calls[0]).toEqual([menu, true]);
            expect(onMenuChange.mock.calls[1]).toEqual([menu, false]);
        });
    });

    describe("Menu.setSelected / Menu.getSelected", () => {
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
            createDummyMenuItem(),
            createDummyMenuItem(),
            createDummyMenuItem({category: someCategory}),
            createDummyMenuItem({category: someCategory2}),
        ];
        it("Can select items", () => {
            const menu = new Menu(dummyContext, items);
            menu.setSelected(items[0], true);
            expect(menu.getSelected()).toEqual([items[0]]);
            menu.setSelected(items[3], true);
            expect(menu.getSelected()).toEqual([items[0], items[3]]);
        });
        it("Can deselect items", () => {
            const menu = new Menu(dummyContext, items);
            menu.setSelected(items[0], true);
            menu.setSelected(items[3], true);
            expect(menu.getSelected()).toEqual([items[0], items[3]]);
            menu.setSelected(items[3], false);
            expect(menu.getSelected()).toEqual([items[0]]);
            menu.setSelected(items[0], false);
            expect(menu.getSelected()).toEqual([]);
        });
        it("Calls onSelect actions", () => {
            let selectCount = 0;
            let deselectCount = 0;
            const item = createDummyMenuItem({
                actionBindings: [
                    onSelectAction.createBinding(selected => {
                        if (selected) selectCount++;
                        else deselectCount++;
                    }),
                ],
            });
            const menu = new Menu(dummyContext, [...items, item]);
            expect(selectCount).toBe(0);
            expect(deselectCount).toBe(0);
            menu.setSelected(item, true);
            expect(selectCount).toBe(1);
            expect(deselectCount).toBe(0);
            menu.setSelected(item, false);
            expect(selectCount).toBe(1);
            expect(deselectCount).toBe(1);
        });
        it("Can't select items that aren't in the menu", () => {
            const menu = new Menu(dummyContext, items);
            const item = createDummyMenuItem();
            menu.setSelected(item, true);
            expect(menu.getSelected()).toEqual([]);
        });
        it("Automatically deselects items when removed", () => {
            const item = createDummyMenuItem();
            const menu = new Menu(dummyContext, [...items, item]);
            menu.setSelected(item, true);
            expect(menu.getSelected()).toEqual([item]);
            menu.removeItem(item);
            expect(menu.getSelected()).toEqual([]);
        });
    });

    describe("Menu.setCursor / Menu.getCursor", () => {
        const someCategory: ICategory = {
            name: "Bob",
            description: "some category for Bob",
            item: createDummyMenuItem(),
        };
        const items = [
            createDummyMenuItem({noSelect: true}),
            createDummyMenuItem(),
            createDummyMenuItem({category: someCategory}),
        ];
        it("Has the correct initial cursor", () => {
            expect(new Menu(dummyContext).getCursor()).toEqual(null);
            // It won't select unselectable items
            expect(new Menu(dummyContext, items).getCursor()).toEqual(items[1]);
        });
        it("Properly updates the cursor", () => {
            const menu = new Menu(dummyContext, items);
            menu.setCursor(items[2]);
            expect(menu.getCursor()).toEqual(items[2]);
        });
        it("Calls onCursor actions", () => {
            let selectCount = 0;
            let deselectCount = 0;
            const item = createDummyMenuItem({
                actionBindings: [
                    onCursorAction.createBinding((selected, m) => {
                        if (selected) selectCount++;
                        else deselectCount++;
                        expect(m).toEqual(menu);
                    }),
                ],
            });
            const menu = new Menu(dummyContext, [...items, item]);
            expect(selectCount).toBe(0);
            expect(deselectCount).toBe(0);
            menu.setCursor(item);
            expect(selectCount).toBe(1);
            expect(deselectCount).toBe(0);
            menu.setCursor(null);
            expect(selectCount).toBe(1);
            expect(deselectCount).toBe(1);
        });
        it("Can't set item as cursor if not in the menu", () => {
            const menu = new Menu(dummyContext, items);
            const item = createDummyMenuItem();
            menu.setCursor(item);
            expect(menu.getCursor()).not.toEqual(item);
        });
        it("Automatically selects another cursor when cursor is removed", () => {
            const item = createDummyMenuItem();
            const menu = new Menu(dummyContext, [...items, item]);
            menu.setCursor(item);
            expect(menu.getCursor()).toEqual(item);
            menu.removeItem(item);
            expect(menu.getCursor()).not.toEqual(item);
            expect(menu.getCursor()).not.toEqual(null);

            menu.removeItems(items);
            expect(menu.getCursor()).toEqual(null);
        });
    });
    describe("Menu.getAllSelected", () => {
        const items = [
            createDummyMenuItem(),
            createDummyMenuItem(),
            createDummyMenuItem(),
        ];
        it("Combines the selection and cursor if present", () => {
            const item = createDummyMenuItem();
            const item2 = createDummyMenuItem();
            const menu = new Menu(dummyContext, [...items, item, item2]);
            menu.setCursor(item);
            expect(menu.getAllSelected()).toEqual([item]);
            menu.setSelected(item2);
            expect(menu.getAllSelected()).toEqual([item2, item]);
        });
        it("Returns the selection if no cursor is present", () => {
            const item = createDummyMenuItem();
            const item2 = createDummyMenuItem();
            const menu = new Menu(dummyContext, [...items, item, item2]);
            menu.setCursor(null);
            menu.setSelected(item2);
            expect(menu.getAllSelected()).toEqual([item2]);
        });
        it("Only includes items once", () => {
            const item = createDummyMenuItem();
            const item2 = createDummyMenuItem();
            const menu = new Menu(dummyContext, [...items, item, item2]);
            menu.setCursor(item);
            expect(menu.getAllSelected()).toEqual([item]);
            menu.setSelected(item);
            expect(menu.getAllSelected()).toEqual([item]);
        });
    });
    describe("Menu.destroy", () => {
        const someCategory: ICategory = {
            name: "Bob",
            description: "some category for Bob",
            item: createDummyMenuItem(),
        };
        const items = [
            createDummyMenuItem(),
            createDummyMenuItem(),
            createDummyMenuItem({category: someCategory}),
        ];
        let menu: Menu;
        beforeEach(() => {
            menu = new Menu(dummyContext, items);
        });
        it("Deselects all items", () => {
            let deselectCount = 0;
            const item = createDummyMenuItem({
                actionBindings: [
                    onSelectAction.createBinding((selected, m) => {
                        if (!selected) deselectCount++;
                        expect(m).toEqual(menu);
                    }),
                ],
            });
            menu.addItem(item);
            menu.setSelected(item, true);
            expect(menu.getSelected()).toEqual([item]);
            expect(deselectCount).toBe(0);
            menu.destroy();
            expect(menu.getSelected()).toEqual([]);
            expect(deselectCount).toBe(1);
        });
        it("Deselects the cursor", () => {
            let deselectCount = 0;
            const item = createDummyMenuItem({
                actionBindings: [
                    onCursorAction.createBinding((selected, m) => {
                        if (!selected) deselectCount++;
                        expect(m).toEqual(menu);
                    }),
                ],
            });
            menu.addItem(item);
            menu.setCursor(item);
            expect(menu.getCursor()).toEqual(item);
            expect(deselectCount).toBe(0);
            menu.destroy();
            expect(menu.getCursor()).toEqual(null);
            expect(deselectCount).toBe(1);
        });
        it("Removes all items", () => {
            // Logically the items are removed, but for rendering purposes they are still obtainable
            // One shouldn't logically rely on these items if the menu indicates it has been destroyed however
            const ci = [items[0], items[1], someCategory.item, items[2]];
            expect(menu.getItems()).toEqual(ci);
            menu.destroy();
            expect(menu.getItems()).toEqual(ci);
        });
        it("Blocks changing the cursor", () => {
            let selectCount = 0;
            const item = createDummyMenuItem({
                actionBindings: [
                    onCursorAction.createBinding((selected, m) => {
                        if (selected) selectCount++;
                        expect(m).toEqual(menu);
                    }),
                ],
            });
            menu.addItem(item);
            expect(menu.getCursor()).not.toEqual(null);
            menu.destroy();
            menu.setCursor(items[0]);
            expect(menu.getCursor()).toEqual(null);
            expect(selectCount).toBe(0);
        });
        it("Blocks selecting of items", () => {
            let selectCount = 0;
            const item = createDummyMenuItem({
                actionBindings: [
                    onSelectAction.createBinding((selected, m) => {
                        if (selected) selectCount++;
                        expect(m).toEqual(menu);
                    }),
                ],
            });
            menu.addItem(item);
            menu.destroy();
            menu.setSelected(items[0], true);
            expect(menu.getSelected()).toEqual([]);
            expect(selectCount).toBe(0);
        });
    });
    describe("Getters can be subscribed to", () => {
        let menu: Menu;
        const items = [
            createDummyMenuItem(),
            createDummyMenuItem(),
            createDummyMenuItem(),
        ];
        beforeEach(() => {
            menu = new Menu(dummyContext, items);
        });
        describe("Menu.getItems", () => {
            it("Correctly subscribes to changes", () => {
                const item = createDummyMenuItem();
                const item2 = createDummyMenuItem();
                const callback = jest.fn(() => {});
                expect(
                    menu.getItems({call: callback, registerRemover: () => {}})
                ).toEqual(items);
                expect(callback.mock.calls.length).toBe(0);
                menu.addItems([item, item2]);
                expect(callback.mock.calls.length).toBe(1);
            });
        });
        describe("Menu.getSelected", () => {
            it("Correctly subscribes to changes", () => {
                const callback = jest.fn(() => {});
                expect(
                    menu.getSelected({call: callback, registerRemover: () => {}})
                ).toEqual([]);
                expect(callback.mock.calls.length).toBe(0);
                menu.setSelected(items[2], true);
                expect(callback.mock.calls.length).toBe(1);
            });
        });
        describe("Menu.getCursor", () => {
            it("Correctly subscribes to changes", () => {
                const callback = jest.fn(() => {});
                expect(
                    menu.getCursor({call: callback, registerRemover: () => {}})
                ).toEqual(items[0]);
                expect(callback.mock.calls.length).toBe(0);
                menu.setCursor(items[2]);
                expect(callback.mock.calls.length).toBe(1);
            });
        });
        describe("Menu.getAllSelected", () => {
            it("Correctly subscribes to changes", () => {
                const callback = jest.fn(() => {});
                expect(
                    menu.getAllSelected({call: callback, registerRemover: () => {}})
                ).toEqual([items[0]]);
                expect(callback.mock.calls.length).toBe(0);
                menu.setCursor(items[2]);
                expect(callback.mock.calls.length).toBe(1);
                menu.setSelected(items[1], true);
                expect(callback.mock.calls.length).toBe(2);
            });
        });
    });

    describe("categoryConfig", () => {
        describe("categoryConfig.maxCategoryItemCount", () => {
            let menu: Menu;
            const items = [
                createDummyMenuItem(),
                createDummyMenuItem(),
                createDummyMenuItem(),
            ];
            beforeEach(() => {
                menu = new Menu(dummyContext, {maxCategoryItemCount: 2});
            });
            it("Allows the number of items for each category to be limited", () => {
                menu.addItems(items);
                expect(menu.getItems()).toEqual(items.slice(0, 2));
            });
            it("Considers separate categories", () => {
                const someCategory: ICategory = {
                    name: "Bob",
                    description: "some category for Bob",
                    item: createDummyMenuItem(),
                };
                const items2 = [
                    createDummyMenuItem({category: someCategory}),
                    createDummyMenuItem({category: someCategory}),
                    createDummyMenuItem({category: someCategory}),
                ];
                menu.addItems(items);
                menu.addItems(items2);
                expect(menu.getItems()).toEqual([
                    ...items.slice(0, 2),
                    someCategory.item,
                    ...items2.slice(0, 2),
                ]);
            });

            it("Doesn't call onMenuChange if the item wasn't added", () => {
                menu.addItems(items);
                const onMenuChange = jest.fn();
                const item = createDummyMenuItem({
                    actionBindings: [onMenuChangeAction.createBinding(onMenuChange)],
                });
                menu.addItem(item);
                expect(onMenuChange.mock.calls.length).toBe(0);
            });
        });

        describe("categoryConfig.getCategory", () => {
            it("Allows categories to be ignored", () => {
                const someCategory: ICategory = {
                    name: "Bob",
                    description: "some category for Bob",
                    item: createDummyMenuItem(),
                };
                const menu = new Menu(dummyContext, {getCategory: () => undefined});
                const items = [
                    createDummyMenuItem(),
                    createDummyMenuItem(),
                    createDummyMenuItem(),
                ];
                const items2 = [
                    createDummyMenuItem({category: someCategory}),
                    createDummyMenuItem({category: someCategory}),
                    createDummyMenuItem({category: someCategory}),
                ];
                menu.addItems(items);
                menu.addItems(items2);
                expect(menu.getItems()).toEqual([...items, ...items2]);
            });
            it("Allows categories to be altered", () => {
                const someCategory: ICategory = {
                    name: "Bob",
                    description: "some category for Bob",
                    item: createDummyMenuItem(),
                };
                const menu = new Menu(dummyContext, {getCategory: () => someCategory});
                const items = [
                    createDummyMenuItem(),
                    createDummyMenuItem(),
                    createDummyMenuItem(),
                ];
                const items2 = [
                    createDummyMenuItem({category: someCategory}),
                    createDummyMenuItem({category: someCategory}),
                    createDummyMenuItem({category: someCategory}),
                ];
                menu.addItems(items);
                menu.addItems(items2);
                expect(menu.getItems()).toEqual([someCategory.item, ...items, ...items2]);
            });
        });

        describe("categoryConfig.sortCategories", () => {
            it("Allows category orders to be changed", () => {
                const someCategory: ICategory = {
                    name: "Bob",
                    description: "some category for Bob",
                    item: createDummyMenuItem(),
                };
                const menu = new Menu(dummyContext, {
                    sortCategories: categories =>
                        categories.map(({category}) => category).reverse(),
                });
                const items = [
                    createDummyMenuItem(),
                    createDummyMenuItem(),
                    createDummyMenuItem(),
                ];
                const items2 = [
                    createDummyMenuItem({category: someCategory}),
                    createDummyMenuItem({category: someCategory}),
                    createDummyMenuItem({category: someCategory}),
                ];
                menu.addItems(items);
                menu.addItems(items2);
                expect(menu.getItems()).toEqual([someCategory.item, ...items2, ...items]);
            });
            it("Allows categories to be left out", () => {
                const someCategory: ICategory = {
                    name: "Bob",
                    description: "some category for Bob",
                    item: createDummyMenuItem(),
                };
                const menu = new Menu(dummyContext, {sortCategories: () => [undefined]});
                const items = [
                    createDummyMenuItem(),
                    createDummyMenuItem(),
                    createDummyMenuItem(),
                ];
                const items2 = [
                    createDummyMenuItem({category: someCategory}),
                    createDummyMenuItem({category: someCategory}),
                    createDummyMenuItem({category: someCategory}),
                ];
                menu.addItems(items);
                menu.addItems(items2);
                expect(menu.getItems()).toEqual(items);
            });
        });
    });
});
