import {getCategoryAction} from "../../../menus/actions/types/category/getCategoryAction";
import {getContextCategory} from "../../../menus/categories/createContextCategory";
import {createStandardMenuItem} from "../../../menus/items/createStandardMenuItem";
import {Priority} from "../../../menus/menu/priority/Priority";
import {createAction} from "../../createAction";
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
                                execute: executeAction.createBinding(() => {
                                    result = inp.join(",");
                                }),
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
            menuItemMock.mock.calls[0][0].data();
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
                                execute: executeAction.createBinding(() => {
                                    result = inp.join(",");
                                }),
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
            menuItemMock2.mock.calls[0][0].data();
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
            menuItemMock.mock.calls[0][0].data();
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
                                execute: executeAction.createBinding(() => {
                                    result = inp.join(",");
                                }),
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
                                item: (...args) => menuItemMock2(...args),
                                execute: executeAction.createBinding(() => {
                                    result2 = res;
                                }),
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
            menuItemMock.mock.calls[0][0].data();
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
            menuItemMock2.mock.calls[0][0].data();
            expect(result).toEqual("yes+maybe,no");
            expect(result2).toEqual("yes+no+maybe");

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
            menuItemMock3.mock.calls[0][0].data();
            expect(result).toEqual("yes*no*maybe");
            expect(result2).toEqual("yes+no+maybe");
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
                                execute: executeAction.createBinding(() => {
                                    result = inp.join(",");
                                }),
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
            expect(
                getCategoryAction
                    .get(contextItems.map(({item}) => item))
                    .map(({category}) => category)
            ).toEqual([getContextCategory(2, 3), getContextCategory(1, 3)]);
        });
    });
});
