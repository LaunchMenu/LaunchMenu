import {Field, Observer} from "model-react";
import {wait} from "../../../_tests/wait.helper";
import {SearchExecuter} from "../SearchExecuter";
import {createSimpleResultMap, s} from "./createSimpleResultMap.helper";
import {createSimpleSearch} from "./createSimpleSearch.helper";

/*
 * Most behavior has been tested in `coreSearchExecuter` and `SearchPatternFilter` classes
 * So there are fewer tests in here
 */
describe("SearchExecuter", () => {
    describe("new SearchExecuter", () => {
        it("Can be constructed", () => {
            new SearchExecuter({
                searchable: createSimpleSearch({m: () => true}),
                onRemove: () => {},
                onAdd: () => {},
            });
        });
    });
    describe("SearchExecuter.setQuery", () => {
        it("Obtains the correct results", async () => {
            const search1 = createSimpleSearch({
                id: "1",
                m: async s => {
                    await wait(20);
                    return s == "s" || s == "p";
                },
            });
            const search2 = createSimpleSearch({
                id: "2",
                m: async s => {
                    await wait(20);
                    return s == "s" || s == "o";
                },
            });
            const field = new Field("m");
            const search3 = createSimpleSearch({
                id: "3",
                m: s => s == "o" || s == "p",
                children: (s, h) => (s == field.get(h) ? [] : [search1, search2]),
            });
            const field3 = new Field("i");
            const search4 = createSimpleSearch({
                id: "4",
                m: s => s == "o" || s == "p",
                children: (s, h) => (s == field3.get(h) ? [] : [search3]),
            });
            const field2 = new Field("m");
            const search5 = createSimpleSearch({
                id: "5",
                m: (s, h) => s == field2.get(h),
            });
            const field4 = new Field("i");
            const search6 = createSimpleSearch({
                id: "6",
                m: s => s == "o" || s == "p",
                children: (s, h) => (s == field4.get(h) ? [] : [search3]),
            });
            const search7 = createSimpleSearch({
                id: "7",
                m: s => s == "o" || s == "p",
                children: (s, h) => [search4, search5, search6],
            });

            const results = createSimpleResultMap();
            const executer = new SearchExecuter({
                searchable: search7,
                ...results,
            });

            // Check searches execute in parallel
            executer.setQuery("s");
            await wait(30);
            expect(results.getItems()).toEqual(s([search1.ID, search2.ID]));

            await executer.setQuery("o");
            expect(results.getItems()).toEqual(
                s([search2.ID, search3.ID, search4.ID, search6.ID, search7.ID])
            );

            await executer.setQuery("m");
            expect(results.getItems()).toEqual(s([search5.ID]));

            // Test fields requesting updates
            field2.set("o");
            await wait(1);
            expect(results.getItems()).toEqual(s([]));

            await executer.setQuery("o");
            expect(results.getItems()).toEqual(
                s([
                    search2.ID,
                    search3.ID,
                    search4.ID,
                    search6.ID,
                    search7.ID,
                    search5.ID,
                ])
            );

            field.set("o");
            await wait(1);
            expect(results.getItems()).toEqual(
                s([search3.ID, search4.ID, search6.ID, search7.ID, search5.ID])
            );

            field.set("p");
            await wait(30); // search2 takes 20ms to complete
            expect(results.getItems()).toEqual(
                s([
                    search2.ID,
                    search3.ID,
                    search4.ID,
                    search6.ID,
                    search7.ID,
                    search5.ID,
                ])
            );

            field3.set("o");
            await wait(10);
            expect(results.getItems()).toEqual(
                s([
                    search2.ID,
                    search3.ID,
                    search4.ID,
                    search6.ID,
                    search7.ID,
                    search5.ID,
                ])
            );

            field4.set("o");
            await wait(1);
            expect(results.getItems()).toEqual(
                s([search4.ID, search6.ID, search7.ID, search5.ID])
            );
        });
        it("Works properly with patterns", async () => {
            const search1 = createSimpleSearch({
                id: "1",
                m: s => s == "s" || s == "p",
            });
            const search2 = createSimpleSearch({
                id: "2",
                m: s => s == "s" || s == "o",
                pattern: s => (s == "s" ? {name: "something"} : undefined),
            });
            const field = new Field("m");
            const search3 = createSimpleSearch({
                id: "3",
                m: s => s == "o" || s == "p",
                pattern: (s, h) => (field.get(h) == s ? {name: "something"} : undefined),
                children: [search1, search2],
            });
            const search4 = createSimpleSearch({
                id: "4",
                m: s => s == "o" || s == "p",
                children: [search3],
            });
            const search5 = createSimpleSearch({
                id: "5",
                m: (s, h) => s == "o",
            });
            const field2 = new Field("m");
            const search6 = createSimpleSearch({
                id: "6",
                m: s => s == "o" || s == "p",
                pattern: (s, h) => (field2.get(h) == s ? {name: "stuff"} : undefined),
                children: [search3],
            });
            const search7 = createSimpleSearch({
                id: "7",
                m: s => s == "o" || s == "p",
                children: (s, h) => [search4, search5, search6],
            });

            const results = createSimpleResultMap();
            const executer = new SearchExecuter({
                searchable: search7,
                ...results,
            });

            await executer.setQuery("p");
            expect(results.getItems()).toEqual(
                s([search1.ID, search3.ID, search4.ID, search6.ID, search7.ID])
            );
            expect(executer.getPatterns()).toEqual([]);

            await executer.setQuery("s");
            expect(executer.getPatterns()).toEqual([{name: "something"}]);
            expect(results.getItems()).toEqual(s([search2.ID]));

            await executer.setQuery("p");
            expect(results.getItems()).toEqual(
                s([search1.ID, search3.ID, search4.ID, search6.ID, search7.ID])
            );
            expect(executer.getPatterns()).toEqual([]);

            field.set("p");
            await wait(1);
            expect(results.getItems()).toEqual(s([search3.ID]));
            expect(executer.getPatterns()).toEqual([{name: "something"}]);

            field2.set("p");
            await wait(1);
            expect(results.getItems()).toEqual(s([search3.ID, search6.ID]));
            expect(executer.getPatterns()).toEqual([
                {name: "something"},
                {name: "stuff"},
            ]);

            field.set("m");
            field2.set("m");
            await wait(1);
            expect(results.getItems()).toEqual(
                s([search1.ID, search3.ID, search4.ID, search6.ID, search7.ID])
            );
            expect(executer.getPatterns()).toEqual([]);

            field.set("s");
            await executer.setQuery("s");
            expect(results.getItems()).toEqual(s([search2.ID]));
            expect(executer.getPatterns()).toEqual([{name: "something"}]);

            field.set("k");
            await executer.setQuery("k");
            expect(results.getItems()).toEqual(s([]));
            expect(executer.getPatterns()).toEqual([{name: "something"}]);
        });
        it("Keeps the searching property up to date", async () => {
            const search1 = createSimpleSearch({
                id: "1",
                m: s => s == "s" || s == "p",
            });
            const field = new Field("m");
            const search2 = createSimpleSearch({
                id: "2",
                m: (s, h) => field.get(h) == s,
                pattern: s => (s == "s" ? {name: "something"} : undefined),
            });
            const search3 = createSimpleSearch({
                id: "3",
                m: s => s == "o" || s == "p",
                children: [search1, search2],
            });

            const results = createSimpleResultMap();
            const executer = new SearchExecuter({
                searchable: search3,
                ...results,
            });

            // Basic test
            expect(executer.isSearching()).toBe(false);
            const searchPromise = executer.setQuery("m");
            expect(executer.isSearching()).toBe(true);
            await searchPromise;
            expect(results.getItems()).toEqual(s([search2.ID]));
            expect(executer.isSearching()).toBe(false);

            // Subscription test with later updates
            const listener = jest.fn();
            new Observer(
                h => executer.isSearching(h),
                // When using a debounce, some searching updates are lost if too close together
                {debounce: -1}
            ).listen(listener);
            await executer.setQuery("p");
            expect(results.getItems()).toEqual(s([search1.ID, search3.ID]));
            await wait(4);
            expect(listener.mock.calls.length).toBe(2);

            field.set("p");
            await wait(1);
            expect(results.getItems()).toEqual(s([search1.ID, search3.ID, search2.ID]));
            expect(listener.mock.calls.length).toBe(4);
        });
    });
});
