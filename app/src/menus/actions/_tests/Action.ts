import {Action, results, sources} from "../Action";
import {IAction} from "../_types/IAction";
import {IActionBinding} from "../_types/IActionBinding";
import {IMenuItem} from "../../items/_types/IMenuItem";
import {adaptBindings} from "../../items/adjustBindings";
import {Field, IDataHook} from "model-react";
import {Observer} from "../../../utils/modelReact/Observer";
import {wait} from "../../../_tests/wait.helper";

const createItem = (...bindings: IActionBinding<any>[]): IMenuItem => ({
    view: null as any,
    actionBindings: bindings,
});
const createSubscribableItem = (
    bindings: (hook: IDataHook) => IActionBinding<any>[]
): IMenuItem => ({
    view: null as any,
    actionBindings: bindings,
});

describe("Action", () => {
    describe("new Action", () => {
        // Notice that these action cores are only for testing and don't make any sense
        it("Doesn't error", () => {
            new Action((input: number[]) => {
                return 3;
            });
        });
        it("Can be a handler for another action", () => {
            const action = new Action((input: number[]) => {
                return 3;
            });
            const handler = new Action(
                (input: number[]) => {
                    return 3;
                },
                [],
                action
            );
            expect(handler.ancestors.length).toEqual(1);
            expect(handler.ancestors[0]).toEqual(action);
        });
    });
    describe("Action.createBinding", () => {
        // Notice that these action cores are only for testing and don't make any sense
        it("Creates a binding to this action", () => {
            const action = new Action((input: number[]) => {
                return 3;
            });
            const binding = action.createBinding(2);
            expect(binding.action).toEqual(action);
            expect(binding.data).toEqual(2);
            expect(binding.tags).toEqual(["context"]);

            const binding2 = action.createBinding(12, ["hoi", "hi"]);
            expect(binding2.action).toEqual(action);
            expect(binding2.data).toEqual(12);
            expect(binding2.tags).toEqual(["hoi", "hi"]);
        });
        it("Inherits bindings from the action", () => {
            const action = new Action(
                (input: number[]) => {
                    return 3;
                },
                ["potatoes"]
            );
            const binding = action.createBinding(2);
            expect(binding.tags).toEqual(["potatoes"]);

            const binding2 = action.createBinding(2, ["oranges"]);
            expect(binding2.tags).toEqual(["oranges"]);

            const binding3 = action.createBinding(2, tags => [...tags, "oranges"]);
            expect(binding3.tags).toEqual(["potatoes", "oranges"]);
        });
    });
    describe("Action.canBeAppliedTo", () => {
        it("Correctly indicates whether a given item has a direct binding for this action", () => {
            const action = new Action((input: number[]) => {
                return 3;
            });
            const item = createItem(action.createBinding(2));
            expect(action.canBeAppliedTo(item)).toBeTruthy();
            expect(action.canBeAppliedTo(createItem())).toBeFalsy();
            expect(
                action.canBeAppliedTo(
                    createItem(new Action(() => {}).createBinding(undefined))
                )
            ).toBeFalsy();
        });
        it("Correctly indicates whether a given item has an indirect binding for this action", () => {
            const action = new Action((input: number[]) => {
                return 3;
            });
            const handler = action.createHandler((n: string[]) => {
                return 3;
            });
            const item = createItem(handler.createBinding("test"));
            expect(action.canBeAppliedTo(item)).toBeTruthy();
            expect(action.canBeAppliedTo(createItem())).toBeFalsy();
        });
    });
    describe("Action.createHandler", () => {
        // Notice that these action cores are only for testing and don't make any sense
        it("Creates an action with this action as ancestor", () => {
            const action = new Action((input: number[]) => {
                return 3;
            });
            const handler = action.createHandler((input: boolean[]) => {
                return 2;
            });
            expect(handler.ancestors).toEqual([action]);
        });
        it("Inherits default tags", () => {
            const action = new Action(
                (input: number[]) => {
                    return 3;
                },
                ["stuff"]
            );
            const handler = action.createHandler((input: boolean[]) => {
                return 2;
            });
            expect(handler.createBinding(true).tags).toEqual(["stuff"]);

            const handler2 = action.createHandler(
                (input: boolean[]) => {
                    return 2;
                },
                tags => [...tags, "oranges"]
            );
            expect(handler2.createBinding(true).tags).toEqual(["stuff", "oranges"]);
        });
        it("Can create handlers for handlers", () => {
            const action = new Action((input: number[]) => {
                return 3;
            });
            const handler = action.createHandler((input: boolean[]) => {
                return 2;
            });
            const subHandler = handler.createHandler((input: string[]) => {
                return true;
            });
            expect(subHandler.ancestors).toEqual([action, handler]);
        });
    });
    describe("Action.get", () => {
        // Notice that these action cores are a little more realistic, but don't show off the benefits of making handlers
        // Handlers are intended for when data has to be combined in another way than the original action does
        let action: IAction<number, number>;
        beforeEach(() => {
            action = new Action((inputs: number[]) => {
                return inputs.reduce((cur, data) => cur + data, 0);
            });
        });
        it("Correctly calls the core when data is provided", () => {
            expect(action.get([2, 5], [[], []])).toBe(7);
        });
        describe("Correctly calls the actions/handlers of the right items", () => {
            it("Properly works for direct children", () => {
                expect(
                    action.get([
                        createItem(action.createBinding(2)),
                        createItem(action.createBinding(4)),
                    ])
                ).toBe(6);
            });
            it("Doesn't error on empty lists", () => {
                expect(action.get([])).toBe(0);
                expect(action.get([createItem()])).toBe(0);
            });
            it("Allows for specification of a subset of action bindings", () => {
                const item = createItem(action.createBinding(2), action.createBinding(4));
                const sub = {
                    item,
                    actionBindings: adaptBindings(item.actionBindings, bindings =>
                        bindings.slice(1)
                    ),
                };
                expect(action.get([item])).toBe(6);
                expect(action.get([sub])).toBe(4);
            });
            it("Properly works for handlers", () => {
                const handler = action.createHandler((inputs: string[]) => {
                    return inputs.reduce((cur, text) => cur + text.length, 0) + 1;
                });
                expect(
                    action.get([
                        createItem(handler.createBinding("yes")),
                        createItem(action.createBinding(2)),
                        createItem(action.createBinding(4)),
                        createItem(handler.createBinding("no")),
                    ])
                ).toBe(12);
            });
            describe("Properly works for sub handlers", () => {
                it("Correctly works for handlers returning 1 result", () => {
                    const stringLengthHandler = action.createHandler(
                        (inputs: string[]) => {
                            return inputs.reduce((cur, text) => cur + text.length, 0) + 1;
                        }
                    );
                    const boolStringLengthSubHandler = stringLengthHandler.createHandler(
                        (inputs: boolean[]) => {
                            return inputs.reduce((cur, bool) => cur + bool, "yes"); // casts boolean to "true" or "false" and adds all values to one string, starting with "yes"
                        }
                    );
                    expect(
                        action.get([
                            createItem(stringLengthHandler.createBinding("yes")),
                            createItem(action.createBinding(2)),
                            createItem(boolStringLengthSubHandler.createBinding(false)),
                            createItem(action.createBinding(4)),
                            createItem(stringLengthHandler.createBinding("no")),
                            createItem(boolStringLengthSubHandler.createBinding(true)),
                            createItem(),
                        ])
                    ).toBe(24);

                    // Even more extensive/elaborate test
                    const mulHandler = action.createHandler((inputs: number[]) =>
                        inputs.reduce((cur, data) => cur * data, 1)
                    );
                    const mul2SubHandler = mulHandler.createHandler((inputs: number[]) =>
                        inputs.reduce((cur, data) => cur + 2 * data, 0)
                    );
                    const mul3SubHandler = mulHandler.createHandler((inputs: number[]) =>
                        inputs.reduce((cur, data) => cur + 3 * data, 0)
                    );
                    expect(
                        action.get([
                            createItem(stringLengthHandler.createBinding("yes")),
                            createItem(action.createBinding(2)),
                            createItem(boolStringLengthSubHandler.createBinding(false)),
                            createItem(action.createBinding(4)),
                            createItem(stringLengthHandler.createBinding("no")),
                            createItem(boolStringLengthSubHandler.createBinding(true)),
                            createItem(),
                            // (2 * 2) * (3 * 5)
                            createItem(mul2SubHandler.createBinding(2)),
                            createItem(mul3SubHandler.createBinding(5)),
                        ])
                    ).toBe(84);
                });
                describe("Correctly works for handlers returning results symbol", () => {
                    const createItems = (handler: IAction<string, any>) => [
                        createItem(handler.createBinding("yes")),
                        createItem(action.createBinding(2)),
                        createItem(handler.createBinding("oranges")),
                        createItem(handler.createBinding("yes")),
                        createItem(),
                    ];
                    it("Works without sources if purely mapping", () => {
                        const stringLengthHandler = action.createHandler(
                            (inputs: string[]) => ({
                                [results]: inputs.map(text => text.length + 1),
                            })
                        );
                        expect(action.get(createItems(stringLengthHandler))).toBe(18);
                    });
                    it("Works without sources if returning 1 value", () => {
                        const stringLengthHandler = action.createHandler(
                            (inputs: string[]) => ({
                                [results]: [
                                    inputs.reduce((cur, text) => cur + text.length, 0) +
                                        1,
                                ],
                            })
                        );
                        expect(action.get(createItems(stringLengthHandler))).toBe(16);
                    });
                    it("Errors without sources if returning a random number of results", () => {
                        const stringLengthHandler = action.createHandler(
                            (inputs: string[]) => ({
                                [results]: [
                                    inputs.reduce((cur, text) => cur + text.length, 0) +
                                        1,
                                    inputs.reduce((cur, text) => cur + text.length, 0),
                                ],
                            })
                        );
                        expect(() =>
                            action.get(createItems(stringLengthHandler))
                        ).toThrow();
                    });
                    it("Can return an arbitrary number of results if the correct number of sources is provided", () => {
                        const stringLengthHandler = action.createHandler(
                            (inputs: string[], items) => ({
                                [results]: [
                                    inputs.reduce((cur, text) => cur + text.length, 0) +
                                        1,
                                    inputs.reduce((cur, text) => cur + text.length, 0),
                                ],
                                [sources]: [items.flat(), items.flat()],
                            })
                        );
                        expect(action.get(createItems(stringLengthHandler))).toBe(29);
                    });
                    it("Errors if the wrong number of sources is provided", () => {
                        const stringLengthHandler = action.createHandler(
                            (inputs: string[], items) => ({
                                [results]: [
                                    inputs.reduce((cur, text) => cur + text.length, 0) +
                                        1,
                                    inputs.reduce((cur, text) => cur + text.length, 0),
                                ],
                                [sources]: items,
                            })
                        );
                        expect(() =>
                            action.get(createItems(stringLengthHandler))
                        ).toThrow();
                    });
                });
            });
            describe("Can be subscribed to", () => {
                it("Correctly reflects updates to the whole binding lists", async () => {
                    const bindings = new Field([action.createBinding(4)]);
                    let value = 0;
                    new Observer(h =>
                        action.get(
                            [
                                createItem(action.createBinding(2)),
                                createSubscribableItem(h => bindings.get(h)),
                            ],
                            h
                        )
                    ).listen(v => {
                        value = v;
                    }, true);

                    expect(value).toEqual(6);

                    bindings.set([]);
                    await wait();
                    expect(value).toEqual(2);

                    bindings.set([action.createBinding(8)]);
                    await wait();
                    expect(value).toEqual(10);

                    bindings.set([action.createBinding(3), action.createBinding(4)]);
                    await wait();
                    expect(value).toEqual(9);
                });
                it("Correctly reflects updates for a specific binding", async () => {
                    const field = new Field(4);
                    let value = 0;
                    new Observer(h =>
                        action.get(
                            [
                                createItem(action.createBinding(2)),
                                createItem(action.createBinding(h => field.get(h))),
                            ],
                            h
                        )
                    ).listen(v => {
                        value = v;
                    }, true);

                    expect(value).toEqual(6);

                    field.set(0);
                    await wait();
                    expect(value).toEqual(2);

                    field.set(8);
                    await wait();
                    expect(value).toEqual(10);
                });
                it("Doesn't recompute when data of unrelated bindings change", async () => {
                    const action2 = new Action((inputs: number[]) => {
                        return inputs.reduce((cur, data) => cur + data, 0);
                    });

                    const field = new Field(4);
                    let callCount = 0;
                    let value = 0;
                    new Observer(h =>
                        action.get(
                            [
                                createItem(action.createBinding(2)),
                                createItem(
                                    action.createBinding(4),
                                    action2.createBinding(h => field.get(h))
                                ),
                            ],
                            h
                        )
                    ).listen(v => {
                        value = v;
                        callCount++;
                    }, true);

                    expect(value).toEqual(6);
                    expect(callCount).toEqual(1);

                    field.set(0);
                    await wait();
                    expect(value).toEqual(6);
                    expect(callCount).toEqual(1);

                    field.set(8);
                    await wait();
                    expect(value).toEqual(6);
                    expect(callCount).toEqual(1);
                });
            });
        });
        it("Correctly works for handlers directly", () => {
            const handler = action.createHandler((inputs: string[]) => {
                return inputs.reduce((cur, text) => cur + text.length, 0) + 1;
            });
            expect(
                handler.get([
                    createItem(handler.createBinding("yes")),
                    createItem(action.createBinding(2)),
                    createItem(action.createBinding(4)),
                    createItem(handler.createBinding("no")),
                ])
            ).toBe(6);
        });
    });
});
