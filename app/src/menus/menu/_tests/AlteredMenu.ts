import {createMenuItem} from "./MenuItem.helper";
import {Menu} from "../Menu";
import {AlteredMenu} from "../AlteredMenu";
import {ICategory} from "../../actions/types/category/_types/ICategory";
import {wait} from "../../../_tests/wait.helper";
import {IIOContext} from "../../../context/_types/IIOContext";
import {UndoRedoFacility} from "../../../undoRedo/UndoRedoFacility";

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

const context: IIOContext = {
    keyHandler: null as any,
    panes: {content: null as any, field: null as any, menu: null as any},
    undoRedo: new UndoRedoFacility(),
};
const parentMenu = new Menu(context, items);

describe("AlteredMenu", () => {
    describe("new AlteredMenu", () => {
        it("Can be instantiated and copies its parent menu", () => {
            const menu = new AlteredMenu(parentMenu);
            expect(menu.getItems()).toEqual([
                items[0],
                items[1],
                someCategory.item,
                items[2],
                someCategory2.item,
                items[3],
            ]);
        });
        it("Allows for filtering of the parent menu", () => {
            const menu = new AlteredMenu(parentMenu, {
                filter: (item, category) => category != someCategory,
            });
            expect(menu.getItems()).toEqual([
                items[0],
                items[1],
                someCategory2.item,
                items[3],
            ]);
        });
        it("Allows for adding items before contents of the parent menu", () => {
            let someItem = createMenuItem();
            const menu = new AlteredMenu(parentMenu, {
                addBefore: [someItem],
            });
            expect(menu.getItems()).toEqual([
                someItem,
                items[0],
                items[1],
                someCategory.item,
                items[2],
                someCategory2.item,
                items[3],
            ]);
        });
        it("Allows for adding items after contents of the parent menu", () => {
            let someItem = createMenuItem();
            const menu = new AlteredMenu(parentMenu, {
                addAfter: [someItem],
            });
            expect(menu.getItems()).toEqual([
                items[0],
                items[1],
                someItem,
                someCategory.item,
                items[2],
                someCategory2.item,
                items[3],
            ]);
        });
    });
    describe("AlteredMenu.addItem / addItems", () => {
        it("Correctly adds one item to the end", () => {
            let someItem = createMenuItem();
            const menu = new AlteredMenu(parentMenu);
            menu.addItem(someItem);
            expect(menu.getItems()).toEqual([
                items[0],
                items[1],
                someItem,
                someCategory.item,
                items[2],
                someCategory2.item,
                items[3],
            ]);
        });
        it("Correctly adds multiple items to the end", () => {
            let someItem = createMenuItem();
            let someItem2 = createMenuItem();
            const menu = new AlteredMenu(parentMenu);
            menu.addItems([someItem, someItem2]);
            expect(menu.getItems()).toEqual([
                items[0],
                items[1],
                someItem,
                someItem2,
                someCategory.item,
                items[2],
                someCategory2.item,
                items[3],
            ]);
        });
    });
    describe("AlteredMenu.insertItem / insertItems", () => {
        it("Correctly adds one item to the start", () => {
            let someItem = createMenuItem();
            const menu = new AlteredMenu(parentMenu);
            menu.insertItem(someItem);
            expect(menu.getItems()).toEqual([
                someItem,
                items[0],
                items[1],
                someCategory.item,
                items[2],
                someCategory2.item,
                items[3],
            ]);
        });
        it("Correctly adds multiple items to the start", () => {
            let someItem = createMenuItem();
            let someItem2 = createMenuItem();
            const menu = new AlteredMenu(parentMenu);
            menu.insertItems([someItem, someItem2]);
            expect(menu.getItems()).toEqual([
                someItem,
                someItem2,
                items[0],
                items[1],
                someCategory.item,
                items[2],
                someCategory2.item,
                items[3],
            ]);
        });
    });
    describe("AlteredMenu.removeItem / removeItems", () => {
        it("Correctly removes one item in this menu", () => {
            let someItem = createMenuItem();
            let someItem2 = createMenuItem();
            const menu = new AlteredMenu(parentMenu);
            menu.insertItem(someItem);
            menu.addItem(someItem2);
            expect(menu.getItems()).toEqual([
                someItem,
                items[0],
                items[1],
                someItem2,
                someCategory.item,
                items[2],
                someCategory2.item,
                items[3],
            ]);

            menu.removeItem(someItem);
            expect(menu.getItems()).toEqual([
                items[0],
                items[1],
                someItem2,
                someCategory.item,
                items[2],
                someCategory2.item,
                items[3],
            ]);

            menu.removeItem(someItem2);
            expect(menu.getItems()).toEqual([
                items[0],
                items[1],
                someCategory.item,
                items[2],
                someCategory2.item,
                items[3],
            ]);
        });
        it("Correctly indicates whether the item was removed", () => {
            let someItem = createMenuItem();
            let someItem2 = createMenuItem();
            const menu = new AlteredMenu(parentMenu);
            menu.addItem(someItem);

            expect(menu.removeItem(someItem2)).toBeFalsy();
            expect(menu.removeItem(someItem)).toBeTruthy();
        });
        it("Correctly removes multiple items in this menu", () => {
            let someItem = createMenuItem();
            let someItem2 = createMenuItem();
            const menu = new AlteredMenu(parentMenu);
            menu.insertItem(someItem);
            menu.addItem(someItem2);
            expect(menu.getItems()).toEqual([
                someItem,
                items[0],
                items[1],
                someItem2,
                someCategory.item,
                items[2],
                someCategory2.item,
                items[3],
            ]);

            menu.removeItems([someItem, someItem2]);
            expect(menu.getItems()).toEqual([
                items[0],
                items[1],
                someCategory.item,
                items[2],
                someCategory2.item,
                items[3],
            ]);
        });
        it("Doesn't remove items of the parent menu", () => {
            let someItem = createMenuItem();
            let someItem2 = createMenuItem();
            const menu = new AlteredMenu(parentMenu);
            menu.insertItem(someItem);
            menu.addItem(someItem2);
            expect(menu.getItems()).toEqual([
                someItem,
                items[0],
                items[1],
                someItem2,
                someCategory.item,
                items[2],
                someCategory2.item,
                items[3],
            ]);

            menu.removeItem(items[0]);
            expect(menu.getItems()).toEqual([
                someItem,
                items[0],
                items[1],
                someItem2,
                someCategory.item,
                items[2],
                someCategory2.item,
                items[3],
            ]);
        });
    });
    describe("Mirroring", () => {
        it("Correctly reflects changes of the parent menu", async () => {
            const parentMenu = new Menu(context, items);

            let someItem = createMenuItem();
            let someItem2 = createMenuItem();
            let someItem3 = createMenuItem();

            const menu = new AlteredMenu(parentMenu);
            menu.insertItem(someItem);
            menu.addItem(someItem2);
            expect(menu.getItems()).toEqual([
                someItem,
                items[0],
                items[1],
                someItem2,
                someCategory.item,
                items[2],
                someCategory2.item,
                items[3],
            ]);

            parentMenu.addItem(someItem3);
            await wait();
            expect(menu.getItems()).toEqual([
                someItem,
                items[0],
                items[1],
                someItem3,
                someItem2,
                someCategory.item,
                items[2],
                someCategory2.item,
                items[3],
            ]);
        });
    });
});
