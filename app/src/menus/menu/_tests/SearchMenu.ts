import {SearchMenu} from "../SearchMenu";
import {createSearchableMenuItem} from "./MenuItem.helper";
import {wait} from "../../../_tests/wait.helper";
import {Observer} from "../../../utils/modelReact/Observer";
import {context} from "../../../_tests/context.helper";

describe("SearchMenu", () => {
    describe("SearchMenu.addSearchItem -> SearchMenu.setSearch", () => {
        let menu: SearchMenu;
        beforeEach(() => {
            menu = new SearchMenu(context);
        });

        it("Only includes non 0 priority search results", async () => {
            const item = createSearchableMenuItem({searchPriorities: {something: 1}});
            menu.addSearchItem(item);
            const item2 = createSearchableMenuItem({searchPriorities: {poop: 1}});
            menu.addSearchItem(item2);
            await menu.setSearch("something");
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item]);
        });
        it("Properly sorts search results", async () => {
            const item = createSearchableMenuItem({searchPriorities: {something: 1}});
            menu.addSearchItem(item);
            const item2 = createSearchableMenuItem({searchPriorities: {something: 2}});
            menu.addSearchItem(item2);
            await menu.setSearch("something");
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item2, item]);
        });
        describe("Filtering old items", () => {
            it("Properly filters old items if search and update occur in the same batch", async () => {
                const item = createSearchableMenuItem({
                    searchPriorities: {something: 1, oranges: 1},
                });
                menu.addSearchItem(item);
                const item2 = createSearchableMenuItem({
                    searchPriorities: {something: 2},
                });
                menu.addSearchItem(item2);

                await menu.setSearch("something");
                menu.flushBatch();
                expect(menu.getItems()).toEqual([item2, item]);

                await menu.setSearch("oranges");
                menu.flushBatch();
                expect(menu.getItems()).toEqual([item]);
            });
            it("Properly filters old items if search and update occur in different batches", async () => {
                const item = createSearchableMenuItem({
                    searchDelay: 20,
                    searchPriorities: {something: 1, oranges: 1},
                });
                menu.addSearchItem(item);
                const item2 = createSearchableMenuItem({
                    searchDelay: 20,
                    searchPriorities: {something: 2},
                });
                menu.addSearchItem(item2);
                const item3 = createSearchableMenuItem({
                    searchDelay: 20,
                    searchPriorities: {oranges: 2},
                });
                menu.addSearchItem(item3);

                await menu.setSearch("something");
                await wait(30);
                menu.flushBatch();
                expect(menu.getItems()).toEqual([item2, item]);

                await menu.setSearch("oranges");
                menu.flushBatch();
                expect(menu.getItems()).toEqual([item]);

                await wait(30);
                menu.flushBatch();
                expect(menu.getItems()).toEqual([item3, item]);
            });
        });
        it("Properly stops previous searches", async () => {
            const item = createSearchableMenuItem({
                searchDelay: 20,
                searchPriorities: {something: 1},
            });
            menu.addSearchItem(item);
            const item2 = createSearchableMenuItem({
                searchDelay: 20,
                searchPriorities: {something: 2, stuff: 3},
            });
            menu.addSearchItem(item2);

            await menu.setSearch("something");
            await wait(15);
            menu.flushBatch();
            expect(menu.getItems()).toEqual([]);

            await menu.setSearch("stuff");
            await wait(15);
            menu.flushBatch();
            expect(menu.getItems()).toEqual([]);

            await wait(15);
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item2]);
        });
    });
    describe("SearchMenu.removeSearchItem -> SearchMenu.setSearch", () => {
        it("Doesn't include removed items in new search results", async () => {
            const menu = new SearchMenu(context);
            const item = createSearchableMenuItem({
                searchPriorities: {something: 1},
            });
            menu.addSearchItem(item);
            const item2 = createSearchableMenuItem({
                searchPriorities: {something: 1},
            });
            menu.addSearchItem(item2);

            menu.removeSearchItem(item);
            await menu.setSearch("something");
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item2]);
        });
    });
    describe("SearchMenu.setSearch -> SearchMenu.addSearchItem", () => {
        it("Correctly adds search results for the last search", async () => {
            const menu = new SearchMenu(context);
            await menu.setSearch("something");

            const item = createSearchableMenuItem({searchPriorities: {something: 1}});
            menu.addSearchItem(item);
            const item2 = createSearchableMenuItem({searchPriorities: {something: 2}});
            menu.addSearchItem(item2);
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item2, item]);
        });
    });
    describe("SearchMenu.setSearch -> SearchMenu.removeSearchItem", () => {
        it("Cleans up previous search results", async () => {
            const menu = new SearchMenu(context);
            const item = createSearchableMenuItem({searchPriorities: {something: 1}});
            menu.addSearchItem(item);
            const item2 = createSearchableMenuItem({searchPriorities: {something: 2}});
            menu.addSearchItem(item2);
            await menu.setSearch("something");
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item2, item]);

            menu.removeSearchItem(item);
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item2]);
        });
    });
    describe("SearchMenu.setSearchItems", () => {
        it("Correctly adds items", async () => {
            const menu = new SearchMenu(context);
            const item = createSearchableMenuItem({searchPriorities: {something: 1}});
            const item2 = createSearchableMenuItem({searchPriorities: {something: 2}});
            const item3 = createSearchableMenuItem({searchPriorities: {something: 4}});
            const item4 = createSearchableMenuItem({searchPriorities: {something: 3}});

            menu.setSearchItems([item, item2]);
            await menu.setSearch("something");
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item2, item]);

            menu.setSearchItems([item3, item, item2, item4]);
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item3, item4, item2, item]);
        });
        it("Correctly removes items", async () => {
            const menu = new SearchMenu(context);
            const item = createSearchableMenuItem({searchPriorities: {something: 1}});
            const item2 = createSearchableMenuItem({searchPriorities: {something: 2}});
            const item3 = createSearchableMenuItem({searchPriorities: {something: 4}});
            const item4 = createSearchableMenuItem({searchPriorities: {something: 3}});

            menu.setSearchItems([item3, item, item2, item4]);
            await menu.setSearch("something");
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item3, item4, item2, item]);

            menu.setSearchItems([item, item2]);
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item2, item]);
        });
    });
    describe("SearchMenu.getSearch", () => {
        it("Returns the last search value", async () => {
            const menu = new SearchMenu(context);
            await menu.setSearch("oranges");
            expect(menu.getSearch()).toBe("oranges");
        });
        it("Can be subscribed to", async () => {
            const menu = new SearchMenu(context);
            const callback = jest.fn();

            menu.setSearch("oranges");
            new Observer(h => menu.getSearch(h)).listen(callback);
            expect(callback.mock.calls.length).toBe(0);

            menu.setSearch("stuff");
            await wait(10);
            expect(callback.mock.calls.length).toBe(1);
        });
    });
    describe("SearchMenu.getHighlightText", () => {
        it("Returns the last search value", async () => {
            const menu = new SearchMenu(context);
            await menu.setSearch("oranges");
            expect(menu.getHighlight()).toEqual({search: "oranges"});
        });
        it("Can be subscribed to", async () => {
            const menu = new SearchMenu(context);
            const callback = jest.fn();

            menu.setSearch("oranges");
            new Observer(h => menu.getHighlight(h)).listen(callback);
            expect(callback.mock.calls.length).toBe(0);

            menu.setSearch("stuff");
            await wait(10);
            expect(callback.mock.calls.length).toBe(1);
        });
    });
});
