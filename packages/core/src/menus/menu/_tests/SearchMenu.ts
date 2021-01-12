import {SearchMenu} from "../SearchMenu";
import {createDummySearchableMenuItem} from "./MenuItem.helper";
import {wait} from "../../../_tests/wait.helper";
import {dummyContext} from "../../../_tests/context.helper";
import {Observer} from "model-react";

describe("SearchMenu", () => {
    describe("new SearchMenu", () => {
        it("Properly creates a new search menu", () => {
            new SearchMenu(dummyContext);
        });
        it("Can be initialized with a config", () => {
            new SearchMenu(dummyContext, {
                batchInterval: 200,
            });
        });
    });
    describe("SearchMenu.addSearchItem -> SearchMenu.setSearch", () => {
        let menu: SearchMenu;
        beforeEach(() => {
            menu = new SearchMenu(dummyContext);
        });

        it("Only includes non 0 priority search results", async () => {
            const item = createDummySearchableMenuItem({
                searchPriorities: {something: 1},
            });
            menu.addSearchItem(item);
            const item2 = createDummySearchableMenuItem({searchPriorities: {poop: 1}});
            menu.addSearchItem(item2);
            await menu.setSearch("something");
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item]);
        });
        it("Properly sorts search results", async () => {
            const item = createDummySearchableMenuItem({
                searchPriorities: {something: 1},
            });
            menu.addSearchItem(item);
            const item2 = createDummySearchableMenuItem({
                searchPriorities: {something: 2},
            });
            menu.addSearchItem(item2);
            await menu.setSearch("something");
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item2, item]);
        });
        it("Properly filters old items", async () => {
            const item = createDummySearchableMenuItem({
                searchPriorities: {something: 1, oranges: 1},
            });
            menu.addSearchItem(item);
            const item2 = createDummySearchableMenuItem({
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
    });
    describe("SearchMenu.removeSearchItem -> SearchMenu.setSearch", () => {
        it("Doesn't include removed items in new search results", async () => {
            const menu = new SearchMenu(dummyContext);
            const item = createDummySearchableMenuItem({
                searchPriorities: {something: 1},
            });
            menu.addSearchItem(item);
            const item2 = createDummySearchableMenuItem({
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
            const menu = new SearchMenu(dummyContext);
            await menu.setSearch("something");

            const item = createDummySearchableMenuItem({
                searchPriorities: {something: 1},
            });
            menu.addSearchItem(item);
            const item2 = createDummySearchableMenuItem({
                searchPriorities: {something: 2},
            });
            menu.addSearchItem(item2);
            await wait(1);
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item2, item]);
        });
    });
    describe("SearchMenu.setSearch -> SearchMenu.removeSearchItem", () => {
        it("Cleans up previous search results", async () => {
            const menu = new SearchMenu(dummyContext);
            const item = createDummySearchableMenuItem({
                searchPriorities: {something: 1},
            });
            menu.addSearchItem(item);
            const item2 = createDummySearchableMenuItem({
                searchPriorities: {something: 2},
            });
            menu.addSearchItem(item2);
            await menu.setSearch("something");
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item2, item]);

            menu.removeSearchItem(item);
            await wait(1);
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item2]);
        });
    });
    describe("SearchMenu.setSearchItems", () => {
        it("Correctly adds items", async () => {
            const menu = new SearchMenu(dummyContext);
            const item = createDummySearchableMenuItem({
                searchPriorities: {something: 1},
            });
            const item2 = createDummySearchableMenuItem({
                searchPriorities: {something: 2},
            });
            const item3 = createDummySearchableMenuItem({
                searchPriorities: {something: 4},
            });
            const item4 = createDummySearchableMenuItem({
                searchPriorities: {something: 3},
            });

            menu.setSearchItems([item, item2]);
            await menu.setSearch("something");
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item2, item]);

            menu.setSearchItems([item3, item, item2, item4]);
            await wait(1);
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item3, item4, item2, item]);
        });
        it("Correctly removes items", async () => {
            const menu = new SearchMenu(dummyContext);
            const item = createDummySearchableMenuItem({
                searchPriorities: {something: 1},
            });
            const item2 = createDummySearchableMenuItem({
                searchPriorities: {something: 2},
            });
            const item3 = createDummySearchableMenuItem({
                searchPriorities: {something: 4},
            });
            const item4 = createDummySearchableMenuItem({
                searchPriorities: {something: 3},
            });

            menu.setSearchItems([item3, item, item2, item4]);
            await menu.setSearch("something");
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item3, item4, item2, item]);

            menu.setSearchItems([item, item2]);
            await wait(1);
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item2, item]);
        });
    });
    describe("SearchMenu.getSearch", () => {
        it("Returns the last search value", async () => {
            const menu = new SearchMenu(dummyContext);
            await menu.setSearch("oranges");
            expect(menu.getSearch()).toBe("oranges");
        });
        it("Can be subscribed to", async () => {
            const menu = new SearchMenu(dummyContext);
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
            const menu = new SearchMenu(dummyContext);
            await menu.setSearch("oranges");
            expect(menu.getHighlight()).toEqual({
                search: "oranges",
                context: dummyContext,
            });
        });
        it("Can be subscribed to", async () => {
            const menu = new SearchMenu(dummyContext);
            const callback = jest.fn();

            menu.setSearch("oranges");
            new Observer(h => menu.getHighlight(h)).listen(callback);
            expect(callback.mock.calls.length).toBe(0);

            menu.setSearch("stuff");
            await wait(10);
            expect(callback.mock.calls.length).toBe(1);
        });
    });
    describe("showAllOnEmptySearch", () => {
        it("When set to true, shows the search items when the search is empty", async () => {
            const menu = new SearchMenu(dummyContext, {showAllOnEmptySearch: true});

            const item = createDummySearchableMenuItem({
                searchPriorities: {something: 1},
            });
            const item2 = createDummySearchableMenuItem({
                searchPriorities: {something: 2},
            });
            menu.setSearchItems([item, item2]);

            menu.flushBatch();
            expect(menu.getItems()).toEqual([item, item2]);
        });
        it("When set to true, removes the search items when the search is not empty", async () => {
            const menu = new SearchMenu(dummyContext, {showAllOnEmptySearch: true});

            const item = createDummySearchableMenuItem({
                searchPriorities: {something: 1},
            });
            const item2 = createDummySearchableMenuItem({
                searchPriorities: {something: 2},
            });
            menu.setSearchItems([item, item2]);

            menu.flushBatch();
            expect(menu.getItems()).toEqual([item, item2]);

            await menu.setSearch("hoi");
            menu.flushBatch();
            expect(menu.getItems()).toEqual([]);

            await menu.setSearch("");
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item, item2]);
        });
        it("When set to false, does not show anything when search is empty", async () => {
            const menu = new SearchMenu(dummyContext, {showAllOnEmptySearch: false});

            const item = createDummySearchableMenuItem({
                searchPriorities: {something: 1},
            });
            const item2 = createDummySearchableMenuItem({
                searchPriorities: {something: 2},
            });
            menu.setSearchItems([item, item2]);

            menu.flushBatch();
            expect(menu.getItems()).toEqual([]);

            await menu.setSearch("hoi");
            menu.flushBatch();
            expect(menu.getItems()).toEqual([]);

            await menu.setSearch("something");
            menu.flushBatch();
            expect(menu.getItems()).toEqual([item2, item]);

            await menu.setSearch("");
            menu.flushBatch();
            expect(menu.getItems()).toEqual([]);
        });
    });
});
