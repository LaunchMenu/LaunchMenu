import {IPrioritizedMenuItem} from "../../_types/IPrioritizedMenuItem";
import {createMenuItem} from "./MenuItem.helper";
import {Menu} from "../Menu";
import {IMenuItemCallback} from "../_types/IMenuItemCallback";
import {createPrioritizedMenuItem} from "./PrioritizedMenuItem.helper";
import {wait} from "../../../_tests/wait.helper";

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
        it("Can be initialized with a generator", async () => {
            const items = [
                createPrioritizedMenuItem(2),
                createPrioritizedMenuItem(1),
                createPrioritizedMenuItem(0),
            ];
            const generator = async (callback: IMenuItemCallback) => {
                await callback(items[1]);
                await callback(items[0]);
                await callback(items[2]);
            };
            const menu = new Menu(generator);
            await wait();
            expect(menu.getItems().length).toBe(3);
            expect(menu.getItems()).toEqual(items.map(({item}) => item));
        });
    });

    describe("Menu.addItem", () => {
        let menu: Menu;
        const items = [createMenuItem(), createMenuItem(), createMenuItem()];
        beforeEach(() => {
            menu = new Menu(items);
        });

        it("Can add an item synchronously", () => {
            const item = createMenuItem();
            menu.addItem(item);
            expect(menu.getItems()).toEqual([...items, item]);
        });

        it("Can add an item synchronously at the specified index", () => {
            const item = createMenuItem();
            menu.addItem(item, 1);
            expect(menu.getItems()).toEqual([items[0], item, items[1], items[2]]);
        });
        it("Can add a prioritized item synchronously", () => {
            const item = createPrioritizedMenuItem(1e6);
            const item2 = createPrioritizedMenuItem(-1e6);
            menu.addItem(item);
            expect(menu.getItems()).toEqual([item.item, ...items]);
            menu.addItem(item2);
            expect(menu.getItems()).toEqual([item.item, ...items, item2.item]);
        });
        it("Can add items in batches", () => {
            const item = createMenuItem();
            const item2 = createMenuItem();
            const callback = jest.fn(() => {});
            expect(menu.getItems({call: callback, registerRemover: () => {}})).toEqual([
                ...items,
            ]);
            menu.addItem(item, Infinity, true);
            expect(callback.mock.calls.length).toBe(0);
            menu.addItem(item2, Infinity, true);
            expect(callback.mock.calls.length).toBe(0);
            expect(menu.getItems()).toEqual([...items, item, item2]);
            expect(callback.mock.calls.length).toBe(1); // Only informed when items are requested, or timeout occurred
            menu.addItem(item2, Infinity, false);
            expect(callback.mock.calls.length).toBe(2);
        });
        it("Can add prioritized items in batches", () => {
            const item = createPrioritizedMenuItem(1e6);
            const item2 = createPrioritizedMenuItem(-1e6);
            const item3 = createPrioritizedMenuItem(2e6);
            const callback = jest.fn(() => {});
            expect(menu.getItems({call: callback, registerRemover: () => {}})).toEqual([
                ...items,
            ]);
            menu.addItem(item, true);
            expect(callback.mock.calls.length).toBe(0);
            menu.addItem(item2, true);
            expect(callback.mock.calls.length).toBe(0);
            expect(menu.getItems()).toEqual([item.item, ...items, item2.item]);
            expect(callback.mock.calls.length).toBe(1); // Only informed when items are requested, or timeout occurred
            menu.addItem(item3, false);
            expect(callback.mock.calls.length).toBe(2);
        });
    });
});
