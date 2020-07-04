import {IPrioritizedMenuItem} from "../../_types/IPrioritizedMenuItem";
import {createMenuItem} from "./MenuItem.helper";
import {Menu} from "../Menu";
import {IMenuItemCallback} from "../_types/IMenuItemCallback";
import {createPrioritizedMenuItem} from "./PrioritizedMenuItem.helper";
import {wait} from "../../../_tests/wait.helper";
import {ICategory} from "../../category/_types/ICategory";

describe("Menu", () => {
    describe("new Menu", () => {
        it("Properly creates a new menu", () => {
            new Menu();
        });
        it("Can be initialized with an item array", () => {
            const items = [createMenuItem(), createMenuItem(), createMenuItem()];
            const menu = new Menu(items);
            expect(menu.getItems().length).toBe(3);
            expect(menu.getItems()).toEqual(items);
        });
    });

    describe("Menu.addItem / Menu.getItems", () => {
        let menu: Menu;
        const items = [createMenuItem(), createMenuItem(), createMenuItem()];
        beforeEach(() => {
            menu = new Menu(items);
        });

        it("Can add an item", () => {
            const item = createMenuItem();
            menu.addItem(item);
            expect(menu.getItems()).toEqual([...items, item]);
        });
        it("Can add an item at the specified index", () => {
            const item = createMenuItem();
            menu.addItem(item, 1);
            expect(menu.getItems()).toEqual([items[0], item, items[1], items[2]]);
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
                createMenuItem(),
                createMenuItem(),
                createMenuItem(someCategory),
                createMenuItem(someCategory2),
            ];

            it("Inserts the correct category in the menu", () => {
                const menu = new Menu();
                menu.addItem(items[0]);
                menu.addItem(items[1]);
                menu.addItem(items[2]);
                expect(menu.getItems()).toEqual([
                    items[0],
                    items[1],
                    someCategory.item,
                    items[2],
                ]);

                const menu2 = new Menu();
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
                const menu = new Menu();
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

                const menu2 = new Menu();
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
    });

    describe("Menu.addItems", () => {
        it("Can add items", () => {
            const items = [createMenuItem(), createMenuItem(), createMenuItem()];
            const menu = new Menu(items);
            const item = createMenuItem();
            const item2 = createMenuItem();
            menu.addItems([item, item2]);
            expect(menu.getItems()).toEqual([...items, item, item2]);
        });
        describe("Considers categories", () => {
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
                createMenuItem(),
                createMenuItem(),
                createMenuItem(someCategory),
                createMenuItem(someCategory2),
            ];

            it("Inserts the correct category in the menu", () => {
                const menu = new Menu();
                menu.addItems(items.slice(0, 3));
                expect(menu.getItems()).toEqual([
                    items[0],
                    items[1],
                    someCategory.item,
                    items[2],
                ]);

                const menu2 = new Menu();
                menu2.addItems(items.slice(0, 3).reverse());
                expect(menu2.getItems()).toEqual([
                    items[1],
                    items[0],
                    someCategory.item,
                    items[2],
                ]);
            });
            it("Adds categories in the order items of said categories were added", () => {
                const menu = new Menu();
                menu.addItems(items);
                expect(menu.getItems()).toEqual([
                    items[0],
                    items[1],
                    someCategory.item,
                    items[2],
                    someCategory2.item,
                    items[3],
                ]);

                const menu2 = new Menu();
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
        });
    });

    describe("Menu.removeItem", () => {
        const items = [createMenuItem(), createMenuItem(), createMenuItem()];
        let menu: Menu;
        beforeEach(() => {
            menu = new Menu(items);
        });

        it("Can remove items", () => {
            menu.removeItem(items[1]);
            expect(menu.getItems()).toEqual([items[0], items[2]]);
        });

        it("Correctly informs whether the item was removed", () => {
            expect(menu.removeItem(items[1])).toBeTruthy();
            expect(menu.removeItem(createMenuItem())).toBeFalsy();
            expect(menu.getItems()).toEqual([items[0], items[2]]);
        });
        describe("Considers categories", () => {
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
            const item = createMenuItem(someCategory);
            const item2 = createMenuItem(someCategory2);
            const item3 = createMenuItem(someCategory2);

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
    });

    describe("Menu.removeItems", () => {
        const items = [createMenuItem(), createMenuItem(), createMenuItem()];
        let menu: Menu;
        beforeEach(() => {
            menu = new Menu(items);
        });

        it("Can remove items", () => {
            menu.removeItems([items[1], items[0]]);
            expect(menu.getItems()).toEqual([items[2]]);
        });

        it("Correctly informs whether any of the items were removed", () => {
            expect(menu.removeItems([items[1], createMenuItem()])).toBeTruthy();
            expect(menu.removeItems([createMenuItem(), createMenuItem()])).toBeFalsy();
            expect(menu.getItems()).toEqual([items[0], items[2]]);
        });
        describe("Considers categories", () => {
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
            const item = createMenuItem(someCategory);
            const item2 = createMenuItem(someCategory2);
            const item3 = createMenuItem(someCategory2);

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
    });

    describe("Menu.setSelected / Menu.getSelected", () => {
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
            createMenuItem(),
            createMenuItem(),
            createMenuItem(someCategory),
            createMenuItem(someCategory2),
        ];
        it("Can select items", () => {
            const menu = new Menu(items);
            menu.setSelected(items[0], true);
            expect(menu.getSelected()).toEqual([items[0]]);
            menu.setSelected(items[3], true);
            expect(menu.getSelected()).toEqual([items[0], items[3]]);
        });
        it("Can deselect items", () => {
            const menu = new Menu(items);
            menu.setSelected(items[0], true);
            menu.setSelected(items[3], true);
            expect(menu.getSelected()).toEqual([items[0], items[3]]);
            menu.setSelected(items[3], false);
            expect(menu.getSelected()).toEqual([items[0]]);
            menu.setSelected(items[0], false);
            expect(menu.getSelected()).toEqual([]);
        });
    });

    describe("Menu.setCursor / Menu.getCursor", () => {
        const someCategory: ICategory = {
            name: "Bob",
            description: "some category for Bob",
            item: createMenuItem(),
        };
        const items = [createMenuItem(), createMenuItem(), createMenuItem(someCategory)];
        it("Has the correct initial cursor", () => {
            expect(new Menu().getCursor()).toEqual(undefined);
            expect(new Menu(items).getCursor()).toEqual(items[0]);
        });
        it("Properly updates the cursor", () => {
            const menu = new Menu(items);
            menu.setCursor(items[2]);
            expect(menu.getCursor()).toEqual(items[2]);
        });
    });

    describe("Getters can be subscribed to", () => {
        let menu: Menu;
        const items = [createMenuItem(), createMenuItem(), createMenuItem()];
        beforeEach(() => {
            menu = new Menu(items);
        });
        describe("Menu.getItems", () => {
            it("Correctly subscribes to changes", () => {
                const item = createMenuItem();
                const item2 = createMenuItem();
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
    });

    describe("categoryConfig", () => {
        describe("categoryConfig.maxCategoryItemCount", ()=>{
            it("Allows the number of items for each category to be limited", ()=>{
                const menu = new Menu({maxCategoryItemCount: 2});
                const items = [createMenuItem(), createMenuItem(), createMenuItem()];
                menu.addItems(items);
                expect(menu.getItems()).toEqual(items.slice(0, 2));
            });
            it("Considers separate categories", ()=>{
                const someCategory: ICategory = {
                    name: "Bob",
                    description: "some category for Bob",
                    item: createMenuItem(),
                };
                const menu = new Menu({maxCategoryItemCount: 2});
                const items = [createMenuItem(), createMenuItem(), createMenuItem()];
                const items2 = [createMenuItem(someCategory), createMenuItem(someCategory), createMenuItem(someCategory)];
                menu.addItems(items);
                menu.addItems(items2);
                expect(menu.getItems()).toEqual([...items.slice(0, 2), someCategory.item, ...items2.slice(0, 2)]);
            });
        });

        describe("categoryConfig.getCategory", ()=>{
            it("Allows categories to be ignored", ()=>{
                const someCategory: ICategory = {
                    name: "Bob",
                    description: "some category for Bob",
                    item: createMenuItem(),
                };
                const menu = new Menu({getCategory: ()=>undefined});
                const items = [createMenuItem(), createMenuItem(), createMenuItem()];
                const items2 = [createMenuItem(someCategory), createMenuItem(someCategory), createMenuItem(someCategory)];
                menu.addItems(items);
                menu.addItems(items2);
                expect(menu.getItems()).toEqual([...items, ...items2]);
            });
            it("Allows categories to be altered", ()=>{
                const someCategory: ICategory = {
                    name: "Bob",
                    description: "some category for Bob",
                    item: createMenuItem(),
                };
                const menu = new Menu({getCategory: ()=>someCategory});
                const items = [createMenuItem(), createMenuItem(), createMenuItem()];
                const items2 = [createMenuItem(someCategory), createMenuItem(someCategory), createMenuItem(someCategory)];
                menu.addItems(items);
                menu.addItems(items2);
                expect(menu.getItems()).toEqual([someCategory.item, ...items, ...items2]);
            });
        });

        describe("categoryConfig.sortCategories", ()=>{
            it("Allows category orders to be changed", ()=>{
                const someCategory: ICategory = {
                    name: "Bob",
                    description: "some category for Bob",
                    item: createMenuItem(),
                };
                const menu = new Menu({sortCategories: (categories)=>categories.map(({category})=>category).reverse()});
                const items = [createMenuItem(), createMenuItem(), createMenuItem()];
                const items2 = [createMenuItem(someCategory), createMenuItem(someCategory), createMenuItem(someCategory)];
                menu.addItems(items);
                menu.addItems(items2);
                expect(menu.getItems()).toEqual([someCategory.item, ...items2, ...items]);
            });
            it("Allows categories to be left out", ()=>{
                const someCategory: ICategory = {
                    name: "Bob",
                    description: "some category for Bob",
                    item: createMenuItem(),
                };
                const menu = new Menu({sortCategories: ()=>[undefined]});
                const items = [createMenuItem(), createMenuItem(), createMenuItem()];
                const items2 = [createMenuItem(someCategory), createMenuItem(someCategory), createMenuItem(someCategory)];
                menu.addItems(items);
                menu.addItems(items2);
                expect(menu.getItems()).toEqual(items);
            });
        });
    });
});
