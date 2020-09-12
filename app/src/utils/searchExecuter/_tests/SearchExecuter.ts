import {SearchExecuter} from "../SearchExecuter";
import {ISearchable} from "../_types/ISearchable";
import {v4 as uuid} from "uuid";
import {Field, IDataHook, IDataListener} from "model-react";
import {IUUID} from "../../../_types/IUUID";
import {wait} from "../../../_tests/wait.helper";
import {Observer} from "../../modelReact/Observer";
import {IPatternMatch} from "../_types/IPatternMatch";
import {ExtendedObject} from "../../ExtendedObject";

const createSimpleSearch = ({
    id = uuid(),
    m: matches,
    pattern,
    children,
}: {
    /** The UUID for the searchable */
    id?: string;
    /** Whether the search matches */
    m?: (text: string, hook?: IDataHook) => boolean | Promise<boolean>;
    /** The children */
    children?:
        | ISearchable<string, string>[]
        | ((
              text: string,
              hook?: IDataHook
          ) => ISearchable<string, string>[] | Promise<ISearchable<string, string>[]>);
    /** A function to match patterns */
    pattern?: (text: string) => IPatternMatch | undefined;
}): ISearchable<string, string> => ({
    id,
    async search(query, hook, parentPattern) {
        return {
            item: (await matches?.(query, hook)) ? id : undefined,
            children:
                children instanceof Function ? await children(query, hook) : children,
            patternMatch: pattern?.(query) ?? parentPattern,
        };
    },
});
const createExecuter = (searchable: ISearchable<string, string>) =>
    new SearchExecuter({searchable});

/** Sorts the list, such that order is meaningless (which it should be) */
const s = (list: IUUID[]) => list.sort();

describe("SearchExecuter", () => {
    describe("new SearchExecuter", () => {
        it("Can be constructed", () => {
            new SearchExecuter({searchable: createSimpleSearch({m: () => true})});
        });
        it("Can be constructed with change callbacks", () => {
            new SearchExecuter({
                searchable: createSimpleSearch({m: () => true}),
                onAdd: item => {},
                onRemove: item => {},
            });
        });
    });
    describe("SearchExecuter.setQuery", () => {
        describe("Correctly obtains the items recursively", () => {
            it("Works on searchables returning items", async () => {
                const search = createSimpleSearch({m: s => s == "s"});
                const executer = createExecuter(search);
                await executer.setQuery("s");
                expect(executer.getResults()).toEqual([search.id]);

                const executer2 = createExecuter(search);
                await executer2.setQuery("");
                expect(executer2.getResults()).toEqual([]);
            });
            it("Works on searchables returning children", async () => {
                const search1 = createSimpleSearch({m: s => s.substr(0, 1) == "s"});
                const search2 = createSimpleSearch({m: s => s.substr(0, 2) == "s2"});
                const search3 = createSimpleSearch({children: [search1, search2]});

                const executer = createExecuter(search3);
                await executer.setQuery("s");
                expect(executer.getResults()).toEqual([search1.id]);

                const executer2 = createExecuter(search3);
                await executer2.setQuery("s2");
                expect(s(executer2.getResults())).toEqual(s([search1.id, search2.id]));

                const executer3 = createExecuter(search3);
                await executer3.setQuery("test");
                expect(executer3.getResults()).toEqual([]);
            });
            it("Works on searchables returning children and items", async () => {
                const search1 = createSimpleSearch({m: s => s.substr(0, 1) == "s"});
                const search2 = createSimpleSearch({m: s => s.substr(0, 2) == "s2"});
                const search3 = createSimpleSearch({
                    m: s => s.substr(0, 2) == "s3",
                    children: [search1, search2],
                });

                const executer = createExecuter(search3);
                await executer.setQuery("s");
                expect(executer.getResults()).toEqual([search1.id]);

                const executer2 = createExecuter(search3);
                await executer2.setQuery("s2");
                expect(s(executer2.getResults())).toEqual(s([search1.id, search2.id]));

                const executer3 = createExecuter(search3);
                await executer3.setQuery("s3");
                expect(s(executer3.getResults())).toEqual(s([search3.id, search1.id]));

                const executer4 = createExecuter(search3);
                await executer4.setQuery("test");
                expect(executer4.getResults()).toEqual([]);
            });
        });
        describe("Correctly updates old items", () => {
            it("Works correctly when search indicates it no longer matches", async () => {
                const search1 = createSimpleSearch({
                    id: "1",
                    m: s => s.substr(0, 1) == "s",
                });
                const search2 = createSimpleSearch({
                    id: "2",
                    m: s => s.substr(0, 2) == "s2",
                });
                const search3 = createSimpleSearch({
                    id: "3",
                    m: s => s.substr(0, 2) == "s3",
                    children: [search1, search2],
                });

                const executer = createExecuter(search3);
                await executer.setQuery("s");
                expect(executer.getResults()).toEqual([search1.id]);

                await executer.setQuery("s2");
                expect(s(executer.getResults())).toEqual(s([search1.id, search2.id]));

                await executer.setQuery("s3");
                expect(s(executer.getResults())).toEqual(s([search1.id, search3.id]));

                await executer.setQuery("test");
                expect(executer.getResults()).toEqual([]);
            });
            it("Works correctly when search indicates children are no longer there", async () => {
                const search1 = createSimpleSearch({
                    id: "1",
                    m: s => s.substr(s.length - 1) == "s",
                });
                const search2 = createSimpleSearch({
                    id: "2",
                    m: s => s.substr(s.length - 1) == "t",
                });
                const search3 = createSimpleSearch({
                    id: "3",
                    m: s => s.substr(0, 1) == "s",
                    children: s => (s.substr(0, 1) == "s" ? [search1, search2] : []),
                });

                const executer = createExecuter(search3);
                await executer.setQuery("s");
                expect(s(executer.getResults())).toEqual(s([search3.id, search1.id]));

                await executer.setQuery("s2");
                expect(executer.getResults()).toEqual([search3.id]);

                await executer.setQuery("st");
                expect(s(executer.getResults())).toEqual(s([search3.id, search2.id]));

                await executer.setQuery("t");
                expect(s(executer.getResults())).toEqual([]);

                await executer.setQuery("st");
                expect(s(executer.getResults())).toEqual(s([search3.id, search2.id]));

                await executer.setQuery("s2");
                expect(executer.getResults()).toEqual([search3.id]);
            });
        });
        describe("Correctly interrupts previous searches", () => {
            it("Correctly cancels previous searches", async () => {
                const search1 = createSimpleSearch({
                    id: "1",
                    m: async s => {
                        await wait(10);
                        return s == "s";
                    },
                });
                const search2 = createSimpleSearch({
                    id: "2",
                    m: async s => {
                        await wait(10);
                        return s == "s";
                    },
                });
                const search3 = createSimpleSearch({
                    id: "3",
                    m: async s => {
                        await wait(10);
                        return s == "s";
                    },
                });
                const search4 = createSimpleSearch({
                    id: "4",
                    m: async s => {
                        await wait(10);
                        return s == "s";
                    },
                    children: s => [search1, search2, search3],
                });

                const executer = createExecuter(search4);
                await executer.setQuery("s");
                expect(s(executer.getResults())).toEqual(
                    s([search1.id, search2.id, search3.id, search4.id])
                );

                const executer2 = createExecuter(search4);
                executer2.setQuery("s");
                await wait(20); // requires 40ms+ to complete
                expect(s(executer2.getResults())).not.toEqual(
                    s([search1.id, search2.id, search3.id, search4.id])
                );

                let resolved = false;
                executer.setQuery("st").then(() => (resolved = true));
                await wait(50); // Requires at most 10 ms to interrupt, + 40ms to complete
                expect(executer.getResults()).toEqual([]);
                expect(resolved).toBe(true);
            });
            it("Correctly removes items registered to be added", async () => {
                const search1 = createSimpleSearch({
                    id: "1",
                    m: async s => {
                        await wait(10);
                        return s == "s";
                    },
                });
                const search2 = createSimpleSearch({
                    id: "2",
                    m: async s => {
                        await wait(10);
                        return s == "s";
                    },
                });
                const search3 = createSimpleSearch({
                    id: "3",
                    m: async s => {
                        await wait(10);
                        return s == "s" || s == "o";
                    },
                });
                const search4 = createSimpleSearch({
                    id: "4",
                    m: async s => {
                        await wait(10);
                        return s == "s" || s == "o";
                    },
                    children: s => (s == "o" ? [] : [search1, search2, search3]),
                });

                const executer = createExecuter(search4);
                await executer.setQuery("t");
                expect(executer.getResults()).toEqual([]);

                // Update the query which should schedule all searches, but the first search should result in all searches being removed (despite being scheduled already)
                await executer.setQuery("o");
                expect(executer.getResults()).toEqual([search4.id]);

                // Just a normal search to confirm nothing janky is going on in the test in general
                await executer.setQuery("s");
                expect(s(executer.getResults())).toEqual(
                    s([search4.id, search3.id, search2.id, search1.id])
                );
            });
            it("Correctly updates previously added items before finding new ones", async () => {
                const search1 = createSimpleSearch({
                    id: "1",
                    m: async s => {
                        await wait(10);
                        return s == "s";
                    },
                });
                const search2 = createSimpleSearch({
                    id: "2",
                    m: async s => {
                        await wait(10);
                        return s == "s";
                    },
                });
                const search3 = createSimpleSearch({
                    id: "3",
                    m: async s => {
                        await wait(10);
                        return s == "o";
                    },
                });
                const search4 = createSimpleSearch({
                    id: "4",
                    m: async s => {
                        await wait(10);
                        return s == "o";
                    },
                    children: s => [search1, search2, search3],
                });

                const sequence = [] as {type: "add" | "remove"; item: string}[];
                const executer = new SearchExecuter({
                    searchable: search4,
                    onAdd: item => sequence.push({type: "add", item}),
                    onRemove: item => sequence.push({type: "remove", item}),
                });
                await executer.setQuery("o");
                expect(s(executer.getResults())).toEqual(s([search4.id, search3.id]));
                await executer.setQuery("s");
                expect(s(executer.getResults())).toEqual(s([search1.id, search2.id]));

                expect(sequence).toEqual([
                    {type: "add", item: search4.id},
                    {type: "add", item: search3.id},
                    {type: "remove", item: search4.id},
                    {type: "remove", item: search3.id},
                    {type: "add", item: search1.id},
                    {type: "add", item: search2.id},
                ]);
            });
        });
        describe("Refreshes searches when the searchable changes", () => {
            it("Correctly updates the resulting item of a search when requested", async () => {
                const field1 = new Field("o");
                const search1 = createSimpleSearch({
                    id: "1",
                    m: (s, h) => s == field1.get(h ?? null),
                });
                const field2 = new Field("s");
                const search2 = createSimpleSearch({
                    id: "2",
                    m: (s, h) => s == field2.get(h ?? null),
                });
                const search3 = createSimpleSearch({
                    id: "3",
                    m: s => s == "o",
                    children: s => [search1, search2],
                });

                const executer = createExecuter(search3);
                await executer.setQuery("s");
                expect(s(executer.getResults())).toEqual(s([search2.id]));

                await executer.setQuery("o");
                expect(s(executer.getResults())).toEqual(s([search1.id, search3.id]));

                field2.set("o");
                await wait(1);
                expect(s(executer.getResults())).toEqual(
                    s([search1.id, search2.id, search3.id])
                );

                field1.set("s");
                await wait(1);
                expect(s(executer.getResults())).toEqual(s([search2.id, search3.id]));

                await executer.setQuery("s");
                expect(s(executer.getResults())).toEqual(s([search1.id]));
            });
            it("Correctly updates the children of a search when requested", async () => {
                const search1 = createSimpleSearch({
                    id: "1",
                    m: s => s == "s" || s == "p",
                });
                const search2 = createSimpleSearch({
                    id: "2",
                    m: s => s == "o" || s == "p",
                });
                const field = new Field("m");
                const search3 = createSimpleSearch({
                    id: "3",
                    m: s => s == "o" || s == "p",
                    children: (s, h) =>
                        s == field.get(h ?? null) ? [] : [search1, search2],
                });

                const executer = createExecuter(search3);
                await executer.setQuery("s");
                expect(s(executer.getResults())).toEqual(s([search1.id]));

                await executer.setQuery("o");
                expect(s(executer.getResults())).toEqual(s([search2.id, search3.id]));

                await executer.setQuery("p");
                expect(s(executer.getResults())).toEqual(
                    s([search1.id, search2.id, search3.id])
                );

                field.set("p");
                await wait(1);
                expect(s(executer.getResults())).toEqual(s([search3.id]));
            });
            it("Doesn't update unaffected items", async () => {
                const field1 = new Field("o");
                const search1 = createSimpleSearch({
                    id: "1",
                    m: (s, h) => s == field1.get(h ?? null),
                });
                const field2 = new Field("s");
                const search2 = createSimpleSearch({
                    id: "2",
                    m: (s, h) => s == field2.get(h ?? null),
                });
                let request = false;
                const search3 = createSimpleSearch({
                    id: "3",
                    m: s => {
                        request = true;
                        return s == "o";
                    },
                    children: s => [search1, search2],
                });

                const executer = createExecuter(search3);
                await executer.setQuery("s");
                expect(s(executer.getResults())).toEqual(s([search2.id]));

                request = false;
                await executer.setQuery("o");
                expect(s(executer.getResults())).toEqual(s([search1.id, search3.id]));
                expect(request).toBe(true);

                request = false;
                field2.set("o");
                await wait(1);
                expect(s(executer.getResults())).toEqual(
                    s([search1.id, search2.id, search3.id])
                );
                expect(request).toBe(false);

                field1.set("s");
                await wait(1);
                expect(s(executer.getResults())).toEqual(s([search2.id, search3.id]));
                expect(request).toBe(false);

                await executer.setQuery("s");
                expect(s(executer.getResults())).toEqual(s([search1.id]));
                expect(request).toBe(true);
            });
        });
        it("Correctly works on an elaborate tree", async () => {
            const search1 = createSimpleSearch({
                id: "1",
                m: s => s == "s",
            });
            const search2 = createSimpleSearch({
                id: "2",
                m: s => s == "o",
            });
            const search3 = createSimpleSearch({
                id: "3",
                m: s => s == "o",
                children: s => [search1, search2],
            });
            const search4 = createSimpleSearch({
                id: "4",
                m: s => s == "s",
            });
            const search5 = createSimpleSearch({
                id: "5",
                m: s => s == "o",
                children: s => [search3, search4],
            });
            const search6 = createSimpleSearch({
                id: "6",
                m: s => s == "s",
            });
            const search7 = createSimpleSearch({
                id: "7",
                m: s => s == "o",
                children: s => [search6, search5],
            });

            const executer = createExecuter(search7);
            await executer.setQuery("o");
            expect(s(executer.getResults())).toEqual(
                s([search2.id, search3.id, search5.id, search7.id])
            );

            await executer.setQuery("s");
            expect(s(executer.getResults())).toEqual(
                s([search1.id, search4.id, search6.id])
            );
        });
        describe("Correctly considers pattern matches", () => {
            it("Removes items that don't match any pattern once a pattern is found", async () => {
                const search1 = createSimpleSearch({
                    id: "1",
                    m: s => s[0] == "s",
                    pattern: s => (s[s.length - 1] == "!" ? {name: "bob"} : undefined),
                });
                const search2 = createSimpleSearch({
                    id: "2",
                    m: s => s[0] == "o",
                });
                const search3 = createSimpleSearch({
                    id: "3",
                    m: s => s[0] == "o",
                    children: s => [search1, search2],
                });
                const search4 = createSimpleSearch({
                    id: "4",
                    m: s => s[0] == "s",
                });
                const search5 = createSimpleSearch({
                    id: "5",
                    m: s => s[0] == "o",
                    children: s => [search3, search4],
                });

                const executer1 = createExecuter(search5);
                await executer1.setQuery("o");
                expect(s(executer1.getResults())).toEqual(
                    s([search2.id, search3.id, search5.id])
                );

                await executer1.setQuery("o!");
                expect(s(executer1.getResults())).toEqual(s([]));

                const executer2 = createExecuter(search5);
                await executer2.setQuery("s");
                expect(s(executer2.getResults())).toEqual(s([search1.id, search4.id]));

                await executer2.setQuery("s!");
                expect(s(executer2.getResults())).toEqual(s([search1.id]));
            });
            it("Reinserts found items that don't match any pattern once all patterns are removed", async () => {
                const search1 = createSimpleSearch({
                    id: "1",
                    m: s => s[0] == "s",
                    pattern: s => (s[s.length - 1] == "!" ? {name: "bob"} : undefined),
                });
                const search2 = createSimpleSearch({
                    id: "2",
                    m: s => s[0] == "o",
                });
                const search3 = createSimpleSearch({
                    id: "3",
                    m: s => s[0] == "o",
                    children: s => [search1, search2],
                });
                const search4 = createSimpleSearch({
                    id: "4",
                    m: s => s[0] == "s",
                });
                const search5 = createSimpleSearch({
                    id: "5",
                    m: s => s[0] == "o",
                    children: s => [search3, search4],
                });

                const executer = createExecuter(search5);
                await executer.setQuery("o");
                expect(s(executer.getResults())).toEqual(
                    s([search2.id, search3.id, search5.id])
                );

                await executer.setQuery("o!");
                expect(s(executer.getResults())).toEqual(s([]));

                await executer.setQuery("o");
                expect(s(executer.getResults())).toEqual(
                    s([search2.id, search3.id, search5.id])
                );

                await executer.setQuery("s");
                expect(s(executer.getResults())).toEqual(s([search1.id, search4.id]));

                await executer.setQuery("s!");
                expect(s(executer.getResults())).toEqual(s([search1.id]));

                await executer.setQuery("s");
                expect(s(executer.getResults())).toEqual(s([search1.id, search4.id]));
            });
            it("Correctly inherits matched patterns", async () => {
                // Behavior depends on searchable, which retrieves parent patterns to use
                const search1 = createSimpleSearch({
                    id: "1",
                    m: s => s[0] == "s",
                });
                const search2 = createSimpleSearch({
                    id: "2",
                    m: s => s[0] == "o",
                });
                const search3 = createSimpleSearch({
                    id: "3",
                    m: s => s[0] == "o",
                    children: s => [search1, search2],
                    pattern: s => (s[s.length - 1] == "!" ? {name: "bob"} : undefined),
                });
                const search4 = createSimpleSearch({
                    id: "4",
                    m: s => s[0] == "s",
                });
                const search5 = createSimpleSearch({
                    id: "5",
                    m: s => s[0] == "o",
                    children: s => [search3, search4],
                });

                const executer = createExecuter(search5);
                await executer.setQuery("o");
                expect(s(executer.getResults())).toEqual(
                    s([search2.id, search3.id, search5.id])
                );

                await executer.setQuery("o!");
                expect(s(executer.getResults())).toEqual(s([search2.id, search3.id]));

                await executer.setQuery("s!");
                expect(s(executer.getResults())).toEqual(s([search1.id]));
            });
        });
    });
    describe("SearchExecuter.getQuery", () => {
        it("Correctly reflects the latest query", () => {
            const search = createSimpleSearch({m: s => s == "s"});
            const executer = createExecuter(search);
            executer.setQuery("hoi");
            expect(executer.getQuery()).toEqual("hoi");
        });
        it("Can be subscribed to", async () => {
            const search = createSimpleSearch({m: s => s == "s"});
            const executer = createExecuter(search);

            const listener = jest.fn();
            new Observer(h => executer.getQuery(h)).listen(listener);

            executer.setQuery("hoi");
            await wait(1);
            executer.setQuery("stuff");
            await wait(1);
            expect(listener.mock.calls[0][0]).toEqual("hoi");
            expect(listener.mock.calls[1][0]).toEqual("stuff");
        });
    });
    describe("SearchExecuter.isSearching", () => {
        it("Correctly reflects the search status", async () => {
            const search = createSimpleSearch({m: async s => wait(20, s == "s")});
            const executer = createExecuter(search);

            expect(executer.isSearching()).toEqual(false);
            const promise = executer.setQuery("hoi");
            await wait(1);
            expect(executer.isSearching()).toEqual(true);
            await promise;
            expect(executer.isSearching()).toEqual(false);
        });
        it("Can be subscribed to", async () => {
            const search = createSimpleSearch({m: async s => wait(20, s == "s")});
            const executer = createExecuter(search);

            const listener = jest.fn();
            new Observer(h => executer.isSearching(h)).listen(listener);
            await executer.setQuery("hoi");

            await wait();
            expect(listener.mock.calls.length).toBe(2);
            expect(listener.mock.calls[0][0]).toEqual(true);
            expect(listener.mock.calls[1][0]).toEqual(false);
        });
    });
    describe("SearchExecuter.getResults", () => {
        it("Correctly returns the results", async () => {
            const search = createSimpleSearch({m: async s => wait(20, s == "s")});
            const executer = createExecuter(search);

            await executer.setQuery("s");
            expect(executer.getResults()).toEqual([search.id]);

            await executer.setQuery("t");
            expect(executer.getResults()).toEqual([]);
        });
        it("Can be subscribed to", async () => {
            const search = createSimpleSearch({m: async s => wait(20, s == "s")});
            const executer = createExecuter(search);

            const listener = jest.fn();
            new Observer((h: IDataListener) =>
                executer.getResults({call: h.call, registerRemover: h.registerRemover})
            ).listen(listener);

            await executer.setQuery("s");
            await executer.setQuery("t");

            await wait();
            expect(listener.mock.calls.length).toBe(2);
            expect(listener.mock.calls[0][0]).toEqual([search.id]);
            expect(listener.mock.calls[1][0]).toEqual([]);
        });
        it("Indicates its loading state", async () => {
            const search = createSimpleSearch({m: async s => wait(20, s == "s")});
            const executer = createExecuter(search);

            const listener = jest.fn();
            new Observer((h: IDataListener) => executer.getResults(h)).listen(listener);

            await executer.setQuery("s");
            await executer.setQuery("t");

            await wait();
            expect(listener.mock.calls.length).toBe(3);
            expect(listener.mock.calls[0]).toEqual([
                [],
                {isLoading: true, exceptions: []},
                [],
            ]);
            expect(listener.mock.calls[1]).toEqual([
                [search.id],
                {isLoading: true, exceptions: []},
                [],
            ]);
            expect(listener.mock.calls[2]).toEqual([
                [],
                {isLoading: false, exceptions: []},
                [search.id],
            ]);
        });
    });
    describe("SearchExecuter.getPatternMatches", () => {
        const search1 = createSimpleSearch({
            id: "1",
            m: s => s[0] == "s",
            pattern: s => (s[s.length - 1] == "!" ? {name: "bob"} : undefined),
        });
        const search2 = createSimpleSearch({
            id: "2",
            m: s => s[0] == "o",
            pattern: s => (s[s.length - 1] == "!" ? {name: "bob"} : undefined),
        });
        const search3 = createSimpleSearch({
            id: "3",
            m: s => s[0] == "o",
            children: s => [search1, search2],
            pattern: s => (s[s.length - 2] == "?" ? {name: "john"} : undefined),
        });
        it("Correctly retrieves the currently matched patterns", async () => {
            const executer = createExecuter(search3);
            await executer.setQuery("o");
            expect(executer.getPatternMatches()).toEqual([]);

            await executer.setQuery("o!");
            expect(executer.getPatternMatches()).toEqual([{name: "bob"}]);

            await executer.setQuery("o?!");
            expect(executer.getPatternMatches()).toEqual([{name: "bob"}, {name: "john"}]);
        });
        it("Can be subscribed to", async () => {
            const executer = createExecuter(search3);

            const listener = jest.fn();
            new Observer((h: IDataListener) => executer.getPatternMatches(h)).listen(
                listener
            );

            await executer.setQuery("o");
            await wait();
            await executer.setQuery("o!");
            await wait();
            await executer.setQuery("o?!");

            await wait();
            expect(listener.mock.calls.length).toBe(3);
            expect(listener.mock.calls[0][0]).toEqual([]);
            expect(listener.mock.calls[1][0]).toEqual([{name: "bob"}]);
            expect(listener.mock.calls[2][0]).toEqual([{name: "bob"}, {name: "john"}]);
        });
        it("Indicates its loading state", async () => {
            const search = createSimpleSearch({m: async s => wait(20, s == "s")});
            const executer = createExecuter(search);

            const listener = jest.fn();
            new Observer((h: IDataListener) => executer.getPatternMatches(h)).listen(
                listener
            );

            await executer.setQuery("s");
            await executer.setQuery("t");

            await wait();
            expect(listener.mock.calls.length).toBe(3);
            expect(listener.mock.calls[0]).toEqual([
                [],
                {isLoading: true, exceptions: []},
                [],
            ]);
            expect(listener.mock.calls[1]).toEqual([
                [],
                {isLoading: true, exceptions: []},
                [],
            ]);
            expect(listener.mock.calls[2]).toEqual([
                [],
                {isLoading: false, exceptions: []},
                [],
            ]);
        });
    });
    describe("ISearchExecuterConfig", () => {
        describe("getPatternMatch", () => {
            const search1 = createSimpleSearch({
                id: "1",
                m: s => s[0] == "s",
                pattern: s => (s[s.length - 1] == "!" ? {name: "bob"} : undefined),
            });
            const search2 = createSimpleSearch({
                id: "2",
                m: s => s[0] == "o",
                pattern: s => (s[s.length - 1] == "!" ? {name: "bob"} : undefined),
            });
            const search3 = createSimpleSearch({
                id: "3",
                m: s => s[0] == "o",
                children: s => [search1, search2],
                pattern: s => (s[s.length - 2] == "?" ? {name: "john"} : undefined),
            });
            it("Can use the getPatternMatch to disable pattern matching", async () => {
                const executer = createExecuter(search3);

                await executer.setQuery("o");
                expect(s(executer.getResults())).toEqual(s([search2.id, search3.id]));
                await executer.setQuery("o!");
                expect(s(executer.getResults())).toEqual(s([search2.id]));

                const executer2 = new SearchExecuter({
                    searchable: search3,
                    getPatternMatch: () => undefined,
                });
                await executer2.setQuery("o");
                expect(s(executer2.getResults())).toEqual(s([search2.id, search3.id]));
                await executer2.setQuery("o!");
                expect(s(executer2.getResults())).toEqual(s([search2.id, search3.id]));
            });
            it("Can use the getPatternMatch to only allow 1 pattern type to match", async () => {
                const executer = new SearchExecuter({
                    searchable: search3,
                    getPatternMatch: (match, currentMatches) =>
                        currentMatches.find(m => ExtendedObject.deepEquals(m, match)) ??
                        (currentMatches.length == 0 ? match : undefined),
                });
                await executer.setQuery("o");
                expect(executer.getPatternMatches()).toEqual([]);

                await executer.setQuery("o!");
                expect(executer.getPatternMatches()).toEqual([{name: "bob"}]);

                await executer.setQuery("o?!");
                expect(executer.getPatternMatches()).toEqual([{name: "bob"}]);
            });
        });
        it("Correctly calls onAdd and onRemove hooks", async () => {
            const search1 = createSimpleSearch({
                id: "1",
                m: s => s == "s",
            });
            const search2 = createSimpleSearch({
                id: "2",
                m: s => s == "o",
            });
            const search3 = createSimpleSearch({
                id: "3",
                m: s => s == "o",
                children: s => [search1, search2],
            });
            const search4 = createSimpleSearch({
                id: "4",
                m: s => s == "s",
            });
            const search5 = createSimpleSearch({
                id: "5",
                m: s => s == "o",
                children: s => [search3, search4],
            });
            const search6 = createSimpleSearch({
                id: "6",
                m: s => s == "s",
            });
            const search7 = createSimpleSearch({
                id: "7",
                m: s => s == "o",
                children: s => [search6, search5],
            });

            const sequence = [] as {type: "add" | "remove"; item: string}[];
            const executer = new SearchExecuter({
                searchable: search7,
                onAdd: item => sequence.push({type: "add", item}),
                onRemove: item => sequence.push({type: "remove", item}),
            });
            await executer.setQuery("o");
            expect(sequence).toEqual([
                {type: "add", item: search7.id},
                {type: "add", item: search5.id},
                {type: "add", item: search3.id},
                {type: "add", item: search2.id},
            ]);

            await executer.setQuery("s");
            expect(sequence).toEqual([
                {type: "add", item: search7.id},
                {type: "add", item: search5.id},
                {type: "add", item: search3.id},
                {type: "add", item: search2.id},
                {type: "remove", item: search7.id},
                {type: "remove", item: search5.id},
                {type: "remove", item: search3.id},
                {type: "remove", item: search2.id},
                {type: "add", item: search6.id},
                {type: "add", item: search4.id},
                {type: "add", item: search1.id},
            ]);
        });
    });
});
