import {getContextCategory} from "../../../menus/categories/createContextCategory";
import {createStandardMenuItem} from "../../../menus/items/createStandardMenuItem";
import {Priority} from "../../../menus/menu/priority/Priority";
import {createAction} from "../../createAction";
import {getCategoryAction} from "../../types/category/getCategoryAction";
import {executeAction} from "../../types/execute/executeAction";
import {contextMenuAction} from "../contextMenuAction";

describe("contextMenuAction", () => {
    describe("getItems", () => {
        it("Should get the menu items for all bindings", () => {
            const items = [
                createStandardMenuItem({name: "Bob"}),
                createStandardMenuItem({name: "Emma"}),
                createStandardMenuItem({name: "John"}),
            ];
            const targets = [
                {
                    actionBindings: [
                        contextMenuAction.createBinding({
                            action: null,
                            item: {
                                priority: Priority.HIGH,
                                item: items[0],
                            },
                        }),
                        contextMenuAction.createBinding({
                            action: null,
                            item: {
                                priority: Priority.LOW,
                                item: items[1],
                            },
                        }),
                    ],
                },
                {
                    actionBindings: [
                        contextMenuAction.createBinding({
                            action: null,
                            item: {
                                priority: Priority.MEDIUM,
                                item: items[2],
                            },
                        }),
                    ],
                },
            ];

            const contextItems = contextMenuAction.getItems(targets);
            const views = contextItems.map(({item: {view}}) => view);
            const priorities = contextItems.map(({priority}) => priority);

            expect(views).toEqual([items[0].view, items[1].view, items[2].view]);
            expect(priorities).toEqual([Priority.HIGH, Priority.LOW, Priority.MEDIUM]);
        });
        it("Should only get items for actions once", () => {
            // This behavior should automatically happen because of how actions work,
            //   but there is no harm in explicitly testing it
            const menuItem = {
                priority: Priority.HIGH,
                item: createStandardMenuItem({name: "someAction1"}),
            };
            const menuItemMock = jest.fn((execute: any) => menuItem);
            let result;
            const someAction = createAction({
                name: "someAction",
                parents: [contextMenuAction],
                core: function (inp: string[]) {
                    return {
                        result: inp.join(","),
                        children: [
                            contextMenuAction.createBinding({
                                action: this,
                                item: (...args) => menuItemMock(...args),
                                execute: [
                                    executeAction.createBinding(() => {
                                        result = inp.join(",");
                                    }),
                                ],
                            }),
                        ],
                    };
                },
            });

            const targets = [
                {
                    actionBindings: [
                        someAction.createBinding("yes"),
                        someAction.createBinding("no"),
                    ],
                },
                {actionBindings: [someAction.createBinding("maybe")]},
            ];
            const contextItems = contextMenuAction.getItems(targets);

            expect(contextItems).toHaveLength(1);
            expect(menuItemMock.mock.calls).toHaveLength(1);
            menuItemMock.mock.calls[0][0][0].data();
            expect(result).toEqual("yes,no,maybe");
        });
        it("Should show the parent if it has bindings", () => {
            const menuItem = {
                priority: Priority.HIGH,
                item: createStandardMenuItem({name: "someAction1"}),
            };
            const menuItemMock = jest.fn((execute: any) => menuItem);
            let result;
            const someAction = createAction({
                name: "someAction",
                parents: [contextMenuAction],
                core: function (inp: string[]) {
                    return {
                        result: inp.join(","),
                        children: [
                            contextMenuAction.createBinding({
                                action: this,
                                item: (...args) => menuItemMock(...args),
                                execute: [
                                    executeAction.createBinding(() => {
                                        result = inp.join(",");
                                    }),
                                ],
                            }),
                        ],
                    };
                },
            });

            const menuItem2 = {
                priority: Priority.HIGH,
                item: createStandardMenuItem({name: "someAction1"}),
            };
            const menuItemMock2 = jest.fn((execute: any) => menuItem2);
            let result2;
            const someActionHandler = createAction({
                name: "someActionHandler",
                parents: [someAction, contextMenuAction],
                core: function (inp: string[]) {
                    const res = inp.join("+");
                    return {
                        result: res,
                        children: [
                            someAction.createBinding(res),
                            contextMenuAction.createBinding({
                                action: this,
                                override: someAction,
                                item: (...args) => menuItemMock2(...args),
                            }),
                        ],
                    };
                },
            });

            // Test when only having bindings for the handler
            const targets = [
                {
                    actionBindings: [
                        someActionHandler.createBinding("yes"),
                        someActionHandler.createBinding("no"),
                    ],
                },
                {actionBindings: [someActionHandler.createBinding("maybe")]},
            ];
            const contextItems = contextMenuAction.getItems(targets);

            expect(contextItems).toHaveLength(1);
            expect(contextItems[0].item.view).toBe(menuItem2.item.view);
            expect(menuItemMock.mock.calls).toHaveLength(0);
            expect(menuItemMock2.mock.calls).toHaveLength(1);
            menuItemMock2.mock.calls[0][0][0].data();
            expect(result).toEqual("yes+no+maybe");
            expect(result2).toEqual(undefined);

            // Test when only having bindings for the handler and action
            const targets2 = [
                {
                    actionBindings: [
                        someActionHandler.createBinding("yes"),
                        someAction.createBinding("no"),
                    ],
                },
                {actionBindings: [someActionHandler.createBinding("maybe")]},
            ];
            const contextItems2 = contextMenuAction.getItems(targets2);

            expect(contextItems2).toHaveLength(1);
            expect(contextItems2[0].item.view).toBe(menuItem.item.view);
            expect(menuItemMock.mock.calls).toHaveLength(1);
            expect(menuItemMock2.mock.calls).toHaveLength(1);
            menuItemMock.mock.calls[0][0][0].data();
            expect(result).toEqual("yes+maybe,no");
            expect(result2).toEqual(undefined);
        });
        it("Should show the parent if it has multiple children", () => {
            const menuItem = {
                priority: Priority.HIGH,
                item: createStandardMenuItem({name: "someAction1"}),
            };
            const menuItemMock = jest.fn((execute: any) => menuItem);
            let result;
            const someAction = createAction({
                name: "someAction",
                parents: [contextMenuAction],
                core: function (inp: string[]) {
                    return {
                        result: inp.join(","),
                        children: [
                            contextMenuAction.createBinding({
                                action: this,
                                item: (...args) => menuItemMock(...args),
                                execute: [
                                    executeAction.createBinding(() => {
                                        result = inp.join(",");
                                    }),
                                ],
                            }),
                        ],
                    };
                },
            });

            const menuItem2 = {
                priority: Priority.HIGH,
                item: createStandardMenuItem({name: "someActionHandler"}),
            };
            const menuItemMock2 = jest.fn((execute: any) => menuItem2);
            let result2;
            const someActionHandler = createAction({
                name: "someActionHandler",
                parents: [someAction, contextMenuAction],
                core: function (inp: string[]) {
                    const res = inp.join("+");
                    return {
                        result: res,
                        children: [
                            someAction.createBinding(res),
                            contextMenuAction.createBinding({
                                action: this,
                                override: someAction,
                                item: (...args) => menuItemMock2(...args),
                                execute: [
                                    executeAction.createBinding(() => {
                                        result2 = res;
                                    }),
                                ],
                            }),
                        ],
                    };
                },
            });

            const menuItem3 = {
                priority: Priority.HIGH,
                item: createStandardMenuItem({name: "someActionHandler2"}),
            };
            const menuItemMock3 = jest.fn((execute: any) => menuItem3);
            const someActionHandler2 = createAction({
                name: "someActionHandler2",
                parents: [contextMenuAction, someAction],
                core: function (inp: string[]) {
                    const res = inp.join("*");
                    return {
                        result: res,
                        children: [
                            someAction.createBinding(res),
                            contextMenuAction.createBinding({
                                action: this,
                                override: someAction,
                                item: (...args) => menuItemMock3(...args),
                            }),
                        ],
                    };
                },
            });

            // Test when having bindings for both handlers
            const targets = [
                {
                    actionBindings: [
                        someActionHandler.createBinding("yes"),
                        someActionHandler2.createBinding("no"),
                    ],
                },
                {actionBindings: [someActionHandler.createBinding("maybe")]},
            ];
            const contextItems = contextMenuAction.getItems(targets);

            expect(contextItems).toHaveLength(1);
            expect(contextItems[0].item.view).toBe(menuItem.item.view);
            expect(menuItemMock.mock.calls).toHaveLength(1);
            expect(menuItemMock2.mock.calls).toHaveLength(0);
            expect(menuItemMock3.mock.calls).toHaveLength(0);
            menuItemMock.mock.calls[0][0][0].data();
            expect(result).toEqual("yes+maybe,no");
            expect(result2).toEqual(undefined);

            // Test when having bindings only for the first handler
            const targets2 = [
                {
                    actionBindings: [
                        someActionHandler.createBinding("yes"),
                        someActionHandler.createBinding("no"),
                    ],
                },
                {actionBindings: [someActionHandler.createBinding("maybe")]},
            ];
            const contextItems2 = contextMenuAction.getItems(targets2);

            expect(contextItems2).toHaveLength(1);
            expect(contextItems2[0].item.view).toBe(menuItem2.item.view);
            expect(menuItemMock.mock.calls).toHaveLength(1);
            expect(menuItemMock2.mock.calls).toHaveLength(1);
            expect(menuItemMock3.mock.calls).toHaveLength(0);
            menuItemMock2.mock.calls[0][0][0].data();
            expect(result).toEqual("yes+no+maybe");
            expect(result2).toEqual(undefined);

            // Test when having bindings only for the second handler
            const targets3 = [
                {
                    actionBindings: [
                        someActionHandler2.createBinding("yes"),
                        someActionHandler2.createBinding("no"),
                    ],
                },
                {actionBindings: [someActionHandler2.createBinding("maybe")]},
            ];
            const contextItems3 = contextMenuAction.getItems(targets3);

            expect(contextItems3).toHaveLength(1);
            expect(contextItems3[0].item.view).toBe(menuItem3.item.view);
            expect(menuItemMock.mock.calls).toHaveLength(1);
            expect(menuItemMock2.mock.calls).toHaveLength(1);
            expect(menuItemMock3.mock.calls).toHaveLength(1);
            menuItemMock3.mock.calls[0][0][0].data();
            expect(result).toEqual("yes*no*maybe");
            expect(result2).toEqual(undefined);
        });
        it("Should handle the graph splits properly", () => {
            /**
             * A:1 <━━ B <━━ D:3 <━━ E <━━ F:4 <━━ G
             *  ∧                    │
             *  ┕━━━━━ C:2 <━━━━━━━━━┙
             */
            const menuItem1 = {
                priority: Priority.HIGH,
                item: createStandardMenuItem({name: "A"}),
            };
            const menuItem2 = {
                priority: Priority.HIGH,
                item: createStandardMenuItem({name: "C"}),
            };
            const menuItem3 = {
                priority: Priority.HIGH,
                item: createStandardMenuItem({name: "D"}),
            };
            const menuItem4 = {
                priority: Priority.HIGH,
                item: createStandardMenuItem({name: "F"}),
            };
            const A = createAction({
                name: "A",
                parents: [contextMenuAction],
                core: function (inp: string[]) {
                    return {
                        children: [
                            contextMenuAction.createBinding({
                                action: this,
                                item: menuItem1,
                            }),
                        ],
                    };
                },
            });
            const B = createAction({
                name: "B",
                parents: [A],
                core: function (inp: string[]) {
                    return {
                        children: [A.createBinding(inp.join("+"))],
                    };
                },
            });
            const C = createAction({
                name: "C",
                parents: [A, contextMenuAction],
                core: function (inp: string[]) {
                    return {
                        children: [
                            A.createBinding(inp.join("+")),
                            contextMenuAction.createBinding({
                                action: this,
                                override: A,
                                item: menuItem2,
                            }),
                        ],
                    };
                },
            });
            const D = createAction({
                name: "D",
                parents: [B, contextMenuAction],
                core: function (inp: string[]) {
                    return {
                        children: [
                            B.createBinding(inp.join("*")),
                            contextMenuAction.createBinding({
                                action: this,
                                override: A,
                                item: menuItem3,
                            }),
                        ],
                    };
                },
            });
            const E = createAction({
                name: "E",
                parents: [B, C],
                core: function (inp: string[]) {
                    return {
                        children: [
                            B.createBinding(inp.join("^")),
                            C.createBinding(inp.join("^")),
                        ],
                    };
                },
            });
            const F = createAction({
                name: "F",
                parents: [E, contextMenuAction],
                core: function (inp: string[]) {
                    return {
                        children: [
                            E.createBinding(inp.join("^")),
                            contextMenuAction.createBinding({
                                action: this,
                                override: A,
                                item: menuItem4,
                            }),
                        ],
                    };
                },
            });
            const G = createAction({
                name: "G",
                parents: [F],
                core: function (inp: string[]) {
                    return {
                        children: [F.createBinding(inp.join("^"))],
                    };
                },
            });

            // Test when having bindings only for B
            const targets1 = [
                {actionBindings: [B.createBinding("yes")]},
                {actionBindings: [B.createBinding("maybe")]},
            ];
            const contextItems1 = contextMenuAction.getItems(targets1);

            expect(contextItems1).toHaveLength(1);
            expect(contextItems1[0].item.view).toBe(menuItem1.item.view);

            // Test when having bindings for D
            const targets2 = [
                {actionBindings: [D.createBinding("yes")]},
                {actionBindings: [D.createBinding("maybe")]},
            ];
            const contextItems2 = contextMenuAction.getItems(targets2);

            expect(contextItems2).toHaveLength(1);
            expect(contextItems2[0].item.view).toBe(menuItem3.item.view);

            // Test when having bindings for F and G
            const targets3 = [
                {actionBindings: [F.createBinding("yes")]},
                {actionBindings: [G.createBinding("maybe")]},
            ];
            const contextItems3 = contextMenuAction.getItems(targets3);

            expect(contextItems3).toHaveLength(1);
            expect(contextItems3[0].item.view).toBe(menuItem4.item.view);

            // Test when having bindings for E (flow passes C and D, but neither has full coverage)
            const targets4 = [
                {actionBindings: [E.createBinding("yes")]},
                {actionBindings: [E.createBinding("maybe")]},
            ];
            const contextItems4 = contextMenuAction.getItems(targets4);

            expect(contextItems4).toHaveLength(1);
            expect(contextItems4[0].item.view).toBe(menuItem1.item.view);

            // Test when having bindings for C and G, neither C or G has full coverage
            const targets5 = [
                {actionBindings: [C.createBinding("yes")]},
                {actionBindings: [G.createBinding("maybe")]},
            ];
            const contextItems5 = contextMenuAction.getItems(targets5);

            expect(contextItems5).toHaveLength(1);
            expect(contextItems5[0].item.view).toBe(menuItem1.item.view);
        });
        it("Should handle actions with multiple parents properly", () => {
            /**
             * A:1 <━━ C:3,4
             *         │
             * B:2 <━━━┙
             */
            const menuItem1 = {
                priority: Priority.HIGH,
                item: createStandardMenuItem({name: "A"}),
            };
            const menuItem2 = {
                priority: Priority.HIGH,
                item: createStandardMenuItem({name: "B"}),
            };
            const menuItem3 = {
                priority: Priority.HIGH,
                item: createStandardMenuItem({name: "C"}),
            };
            const menuItem4 = {
                priority: Priority.HIGH,
                item: createStandardMenuItem({name: "C2"}),
            };
            const A = createAction({
                name: "A",
                parents: [contextMenuAction],
                core: function (inp: string[]) {
                    return {
                        children: [
                            contextMenuAction.createBinding({
                                action: this,
                                item: menuItem1,
                            }),
                        ],
                    };
                },
            });
            const B = createAction({
                name: "B",
                parents: [contextMenuAction],
                core: function (inp: string[]) {
                    return {
                        children: [
                            contextMenuAction.createBinding({
                                action: this,
                                item: menuItem2,
                            }),
                        ],
                    };
                },
            });
            const C = createAction({
                name: "C",
                parents: [A, B, contextMenuAction],
                core: function (inp: string[]) {
                    return {
                        children: [
                            A.createBinding(inp.join("+")),
                            B.createBinding(inp.join("+")),
                            contextMenuAction.createBinding({
                                action: this,
                                override: A,
                                item: menuItem3,
                            }),
                            contextMenuAction.createBinding({
                                action: this,
                                override: B,
                                item: menuItem4,
                            }),
                        ],
                    };
                },
            });

            // Test when having bindings for A, B, C
            const targets1 = [
                {actionBindings: [A.createBinding("yes")]},
                {actionBindings: [B.createBinding("maybe")]},
                {actionBindings: [C.createBinding("maybe")]},
            ];
            const contextItems1 = contextMenuAction.getItems(targets1);

            expect(contextItems1).toHaveLength(2);
            expect(contextItems1[0].item.view).toBe(menuItem1.item.view);
            expect(contextItems1[1].item.view).toBe(menuItem2.item.view);

            // Test when having bindings for just C
            const targets2 = [{actionBindings: [C.createBinding("yes")]}];
            const contextItems2 = contextMenuAction.getItems(targets2);

            expect(contextItems2).toHaveLength(2);
            expect(contextItems2[0].item.view).toBe(menuItem3.item.view);
            expect(contextItems2[1].item.view).toBe(menuItem4.item.view);
        });

        it("Should correctly add item count categories", () => {
            const menuItem = {
                priority: Priority.HIGH,
                item: createStandardMenuItem({name: "someAction1"}),
            };
            const menuItemMock = jest.fn((execute: any) => menuItem);
            let result;
            const someAction = createAction({
                name: "someAction",
                parents: [contextMenuAction],
                core: function (inp: string[]) {
                    return {
                        result: inp.join(","),
                        children: [
                            contextMenuAction.createBinding({
                                action: this,
                                item: (...args) => menuItemMock(...args),
                                execute: [
                                    executeAction.createBinding(() => {
                                        result = inp.join(",");
                                    }),
                                ],
                            }),
                        ],
                    };
                },
            });

            const targets = [
                {
                    actionBindings: [someAction.createBinding("yes")],
                },
                {
                    actionBindings: [someAction.createBinding("no")],
                },
                {
                    actionBindings: [
                        contextMenuAction.createBinding({
                            action: null,
                            item: {
                                priority: Priority.LOW,
                                item: createStandardMenuItem({name: "stuff"}),
                            },
                        }),
                    ],
                },
            ];
            const contextItems = contextMenuAction.getItems(targets);

            expect(contextItems).toHaveLength(2);
            expect(getCategoryAction.get(contextItems.map(({item}) => item))).toEqual([
                getContextCategory(2, 3),
                getContextCategory(1, 3),
            ]);
        });
    });
});
