import {Field, IDataHook} from "model-react";
import {wait} from "../../../_tests/wait.helper";
import {IUUID} from "../../../_types/IUUID";
import {ManualSourceHelper} from "../../modelReact/ManualSourceHelper";
import {Observer} from "../../modelReact/Observer";
import {CoreSearchExecuter} from "../CoreSearchExecuter";
import {IPatternMatch} from "../_types/IPatternMatch";
import {ISearchable} from "../_types/ISearchable";
import {s} from "./createSimpleResultMap.helper";
import {createSimpleSearch} from "./createSimpleSearch.helper";

const createSimpleResultMap = <I>() => {
    const nodes = {} as Record<string, {item?: I; result?: IPatternMatch}>;
    const listener = new ManualSourceHelper();
    return {
        onRemove: (ID: IUUID) => {
            const contains = nodes[ID];
            delete nodes[ID];
            if (contains) listener.callListeners();
        },
        onUpdate: (ID: IUUID, data: {item?: I; result?: IPatternMatch}) => {
            nodes[ID] = data;
            listener.callListeners();
        },
        getItems: (hook: IDataHook = null) => {
            listener.addListener(hook);
            return s(
                Object.values(nodes)
                    .map(({item}) => item)
                    .filter(Boolean)
            ) as I[];
        },
        getNodes: (hook: IDataHook = null) => {
            listener.addListener(hook);
            return Object.values(nodes);
        },
        nodes,
    };
};
const createCoreExecuter = (searchable: ISearchable<string, string>) => {
    const result = createSimpleResultMap<string>();
    return [new CoreSearchExecuter({searchable, ...result}), result] as const;
};

describe("CoreSearchExecuter", () => {
    describe("new CoreSearchExecuter", () => {
        it("Can be constructed", () => {
            new CoreSearchExecuter({
                searchable: createSimpleSearch({m: () => true}),
                onRemove: () => {},
                onUpdate: () => {},
            });
        });
    });
    describe("CoreSearchExecuter.setQuery", () => {
        describe("Correctly obtains the items recursively", () => {
            it("Correctly obtains the items recursively", async () => {
                const search = createSimpleSearch({m: s => s == "s"});
                const [executer, result] = createCoreExecuter(search);
                await executer.setQuery("s");
                expect(result.getItems()).toEqual([search.ID]);

                const [executer2, result2] = createCoreExecuter(search);
                await executer2.setQuery("");
                expect(result2.getItems()).toEqual([]);
            });
            it("Works on searchables returning children", async () => {
                const search1 = createSimpleSearch({m: s => s.substr(0, 1) == "s"});
                const search2 = createSimpleSearch({m: s => s.substr(0, 2) == "s2"});
                const search3 = createSimpleSearch({children: [search1, search2]});

                const [executer, result] = createCoreExecuter(search3);
                await executer.setQuery("s");
                expect(result.getItems()).toEqual([search1.ID]);

                const [executer2, result2] = createCoreExecuter(search3);
                await executer2.setQuery("s2");
                expect(s(result2.getItems())).toEqual(s([search1.ID, search2.ID]));

                const [executer3, result3] = createCoreExecuter(search3);
                await executer3.setQuery("test");
                expect(result3.getItems()).toEqual([]);
            });
            it("Works on searchables returning children and items", async () => {
                const search1 = createSimpleSearch({m: s => s.substr(0, 1) == "s"});
                const search2 = createSimpleSearch({m: s => s.substr(0, 2) == "s2"});
                const search3 = createSimpleSearch({
                    m: s => s.substr(0, 2) == "s3",
                    children: [search1, search2],
                });

                const [executer, result] = createCoreExecuter(search3);
                await executer.setQuery("s");
                expect(result.getItems()).toEqual([search1.ID]);

                const [executer2, result2] = createCoreExecuter(search3);
                await executer2.setQuery("s2");
                expect(result2.getItems()).toEqual(s([search1.ID, search2.ID]));

                const [executer3, result3] = createCoreExecuter(search3);
                await executer3.setQuery("s3");
                expect(result3.getItems()).toEqual(s([search3.ID, search1.ID]));

                const [executer4, result4] = createCoreExecuter(search3);
                await executer4.setQuery("test");
                expect(result4.getItems()).toEqual([]);
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

                const [executer, result] = createCoreExecuter(search3);
                await executer.setQuery("s");
                expect(result.getItems()).toEqual([search1.ID]);

                await executer.setQuery("s2");
                expect(result.getItems()).toEqual(s([search1.ID, search2.ID]));

                await executer.setQuery("s3");
                expect(result.getItems()).toEqual(s([search1.ID, search3.ID]));

                await executer.setQuery("test");
                expect(result.getItems()).toEqual([]);
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

                const [executer, result] = createCoreExecuter(search3);
                await executer.setQuery("s");
                expect(result.getItems()).toEqual(s([search3.ID, search1.ID]));

                await executer.setQuery("s2");
                expect(result.getItems()).toEqual([search3.ID]);

                await executer.setQuery("st");
                expect(result.getItems()).toEqual(s([search3.ID, search2.ID]));

                await executer.setQuery("t");
                expect(result.getItems()).toEqual([]);

                await executer.setQuery("st");
                expect(result.getItems()).toEqual(s([search3.ID, search2.ID]));

                await executer.setQuery("s2");
                expect(result.getItems()).toEqual([search3.ID]);
            });
            describe("Multiple parents", () => {
                it("Doesn't duplicate results", async () => {
                    const search1 = createSimpleSearch({
                        id: "1",
                        m: s => s.substr(s.length - 1) == "s",
                    });
                    const search2 = createSimpleSearch({
                        id: "2",
                        m: s => s.substr(s.length - 1) == "t",
                        children: [search1],
                    });
                    const search3 = createSimpleSearch({
                        id: "3",
                        m: s => s.substr(0, 1) == "s",
                        children: [search1],
                    });
                    const search4 = createSimpleSearch({
                        id: "4",
                        m: s => s.substr(0, 1) == "s",
                        children: [search2, search3],
                    });

                    const updateCallback = jest.fn();
                    const executer = new CoreSearchExecuter({
                        searchable: search4,
                        onUpdate: updateCallback,
                        onRemove: () => {},
                    });

                    await executer.setQuery("s");
                    expect(updateCallback.mock.calls.length).toBe(4);
                    await executer.setQuery("t");
                    expect(updateCallback.mock.calls.length).toBe(8);
                });
                it("Doesn't remove child results until all parents removed the child", async () => {
                    const search1 = createSimpleSearch({
                        id: "1",
                        m: s => s[0] == "s",
                    });
                    const search2 = createSimpleSearch({
                        id: "2",
                        m: s => s[0] == "t",
                        children: s => (s.includes("m") ? [] : [search1]),
                    });
                    const search3 = createSimpleSearch({
                        id: "3",
                        m: s => s[0] == "s",
                        children: s => (s.includes("i") ? [] : [search1]),
                    });
                    const search4 = createSimpleSearch({
                        id: "4",
                        m: s => s[0] == "s",
                        children: [search2, search3],
                    });

                    const [executer, result] = createCoreExecuter(search4);
                    await executer.setQuery("s");
                    expect(result.getItems()).toEqual(
                        s([search4.ID, search3.ID, search1.ID])
                    );

                    await executer.setQuery("sm");
                    expect(result.getItems()).toEqual(
                        s([search4.ID, search3.ID, search1.ID])
                    );

                    await executer.setQuery("si");
                    expect(result.getItems()).toEqual(
                        s([search4.ID, search3.ID, search1.ID])
                    );

                    await executer.setQuery("sim");
                    expect(result.getItems()).toEqual(s([search4.ID, search3.ID]));

                    await executer.setQuery("si");
                    expect(result.getItems()).toEqual(
                        s([search4.ID, search3.ID, search1.ID])
                    );
                });
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

                const [executer, result] = createCoreExecuter(search4);
                await executer.setQuery("s");
                expect(result.getItems()).toEqual(
                    s([search1.ID, search2.ID, search3.ID, search4.ID])
                );

                const [executer2, result2] = createCoreExecuter(search3);
                executer2.setQuery("s");
                await wait(20); // requires 40ms+ to complete
                expect(result2.getItems()).not.toEqual(
                    s([search1.ID, search2.ID, search3.ID, search4.ID])
                );

                let resolved = false;
                executer.setQuery("st").then(() => (resolved = true));
                await wait(70); // Requires at most 10 ms to interrupt, + 40ms to complete
                expect(result.getItems()).toEqual([]);
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

                const [executer, result] = createCoreExecuter(search4);
                await executer.setQuery("t");
                expect(result.getItems()).toEqual([]);

                // Update the query which should schedule all searches, but the first search should result in all searches being removed (despite being scheduled already)
                await executer.setQuery("o");
                expect(result.getItems()).toEqual([search4.ID]);

                // Just a normal search to confirm nothing yanky is going on in the test in general
                await executer.setQuery("s");
                expect(result.getItems()).toEqual(
                    s([search4.ID, search3.ID, search2.ID, search1.ID])
                );
            });
            it("Correctly updates previously added items before finding new ones", async () => {
                const search1 = createSimpleSearch({
                    id: "1",
                    m: async s => {
                        await wait(50);
                        return s == "s";
                    },
                });
                const search2 = createSimpleSearch({
                    id: "2",
                    m: async s => {
                        await wait(50);
                        return s == "s";
                    },
                });
                const search3 = createSimpleSearch({
                    id: "3",
                    m: async s => {
                        await wait(50);
                        return s == "o";
                    },
                    children: s => [search2, search1],
                });
                const search4 = createSimpleSearch({
                    id: "4",
                    m: async s => {
                        await wait(50);
                        return s == "o";
                    },
                    children: s => [search3],
                });

                const sequence = [] as ({type: "update" | "remove"; ID: IUUID} | null)[];
                const result = createSimpleResultMap<string>();
                let searchUpdated = false;
                const executer = new CoreSearchExecuter({
                    searchable: search4,
                    onUpdate: (ID, data) => {
                        sequence.push({type: "update", ID});
                        result.onUpdate(ID, data);

                        // Update the query when node 3 is reached the first time
                        if (!searchUpdated && ID == "3") {
                            searchUpdated = true;
                            sequence.push(null);
                            executer.setQuery("s");
                        }
                    },
                    onRemove: (ID, ...rest) => {
                        sequence.push({type: "remove", ID});
                        result.onRemove(ID);
                    },
                });
                await executer.setQuery("o");

                expect(sequence).toEqual([
                    {type: "update", ID: search4.ID},
                    {type: "update", ID: search3.ID},
                    null,
                    {type: "update", ID: search3.ID},
                    {type: "update", ID: search4.ID},
                    {type: "update", ID: search2.ID},
                    {type: "update", ID: search1.ID},
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

                const [executer, result] = createCoreExecuter(search3);
                await executer.setQuery("s");
                expect(result.getItems()).toEqual(s([search2.ID]));

                await executer.setQuery("o");
                expect(result.getItems()).toEqual(s([search1.ID, search3.ID]));

                field2.set("o");
                await wait(1);
                expect(result.getItems()).toEqual(
                    s([search1.ID, search2.ID, search3.ID])
                );

                field1.set("s");
                await wait(1);
                expect(result.getItems()).toEqual(s([search2.ID, search3.ID]));

                await executer.setQuery("s");
                expect(result.getItems()).toEqual(s([search1.ID]));
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

                const [executer, result] = createCoreExecuter(search3);
                await executer.setQuery("s");
                expect(result.getItems()).toEqual(s([search1.ID]));

                await executer.setQuery("o");
                expect(result.getItems()).toEqual(s([search2.ID, search3.ID]));

                await executer.setQuery("p");
                expect(result.getItems()).toEqual(
                    s([search1.ID, search2.ID, search3.ID])
                );

                field.set("p");
                await wait(1);
                expect(result.getItems()).toEqual(s([search3.ID]));
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

                const [executer, result] = createCoreExecuter(search3);
                await executer.setQuery("s");
                expect(result.getItems()).toEqual(s([search2.ID]));

                request = false;
                await executer.setQuery("o");
                expect(result.getItems()).toEqual(s([search1.ID, search3.ID]));
                expect(request).toBe(true);

                request = false;
                field2.set("o");
                await wait(1);
                expect(result.getItems()).toEqual(
                    s([search1.ID, search2.ID, search3.ID])
                );
                expect(request).toBe(false);

                field1.set("s");
                await wait(1);
                expect(result.getItems()).toEqual(s([search2.ID, search3.ID]));
                expect(request).toBe(false);

                await executer.setQuery("s");
                expect(result.getItems()).toEqual(s([search1.ID]));
                expect(request).toBe(true);
            });
        });

        describe("Correctly executes searches in parallel", () => {
            it("Doesn't make one search block an other", async () => {
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
                        await wait(150);
                        return s == "s";
                    },
                });
                const search3 = createSimpleSearch({
                    id: "3",
                    m: async s => {
                        await wait(10);
                        return s == "s";
                    },
                    children: s => [search1],
                });
                const search4 = createSimpleSearch({
                    id: "4",
                    m: async s => {
                        await wait(70);
                        return s == "s";
                    },
                });
                const search5 = createSimpleSearch({
                    id: "5",
                    m: async s => {
                        await wait(10);
                        return s == "s";
                    },
                    children: s => [search2, search3, search4],
                });

                const [executer, result] = createCoreExecuter(search5);
                const searchPromise = executer.setQuery("s");
                await wait(50);
                expect(result.getItems()).toEqual(
                    s([search5.ID, search1.ID, search3.ID])
                );
                await wait(50);
                expect(result.getItems()).toEqual(
                    s([search5.ID, search1.ID, search3.ID, search4.ID])
                );
                await searchPromise;
                expect(result.getItems()).toEqual(
                    s([search5.ID, search1.ID, search3.ID, search4.ID, search2.ID])
                );
            });
        });
    });
    describe("CoreSearchExecuter.getQuery", () => {
        it("Correctly reflects the latest query", () => {
            const search = createSimpleSearch({m: s => s == "s"});
            const [executer] = createCoreExecuter(search);
            executer.setQuery("hoi");
            expect(executer.getQuery()).toEqual("hoi");
        });
        it("Can be subscribed to", async () => {
            const search = createSimpleSearch({m: s => s == "s"});
            const [executer] = createCoreExecuter(search);

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
    describe("CoreSearchExecuter.isSearching", () => {
        it("Correctly reflects the search status", async () => {
            const search = createSimpleSearch({m: async s => wait(20, s == "s")});
            const [executer] = createCoreExecuter(search);

            expect(executer.isSearching()).toEqual(false);
            const promise = executer.setQuery("hoi");
            await wait(1);
            expect(executer.isSearching()).toEqual(true);
            await promise;
            expect(executer.isSearching()).toEqual(false);
        });
        it("Can be subscribed to", async () => {
            const search = createSimpleSearch({m: async s => wait(20, s == "s")});
            const [executer] = createCoreExecuter(search);

            const listener = jest.fn();
            new Observer(h => executer.isSearching(h)).listen(listener);
            await executer.setQuery("hoi");

            await wait();
            expect(listener.mock.calls.length).toBe(2);
            expect(listener.mock.calls[0][0]).toEqual(true);
            expect(listener.mock.calls[1][0]).toEqual(false);
        });
    });
});
