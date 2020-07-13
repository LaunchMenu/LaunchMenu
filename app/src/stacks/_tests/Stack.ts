import {Stack} from "../Stack";
import {Observer} from "../../utils/modelReact/Observer";
import {wait} from "../../_tests/wait.helper";

describe("Stack", () => {
    describe("new Stack", () => {
        it("Properly creates a stack", () => {
            new Stack();
        });
        it("Can be initialized with items", async () => {
            const stack = new Stack([1, 2, 3]);
            expect(stack.get()).toEqual([1, 2, 3]);
        });
    });
    describe("Primary edit methods", () => {
        describe("Stack.push", () => {
            it("Correctly adds an item", () => {
                const stack = new Stack([1, 2, 3]);
                stack.push(4);
                expect(stack.get()).toEqual([1, 2, 3, 4]);
            });
            it("Correctly adds multiple items at once", () => {
                const stack = new Stack([1, 2, 3]);
                stack.push(4, 5);
                expect(stack.get()).toEqual([1, 2, 3, 4, 5]);
            });
            describe("Handles substacks properly", () => {
                it("Handles adding the stack", () => {
                    const stack = new Stack([1, 2, 3]);
                    const substack = new Stack([3, 4, 5]);
                    stack.push(substack);
                    stack.push(6);
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    expect(substack.get()).toEqual([3, 4, 5]);
                });
                it("Handles adding to the stack", () => {
                    const stack = new Stack([1, 2, 3]);
                    const substack = new Stack([3, 4, 5]);
                    stack.push(substack);
                    substack.push(2);
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 5, 2]);
                });
            });
        });
        describe("Stack.pop", () => {
            it("Removes the top item", () => {
                const stack = new Stack([1, 2, 3]);
                stack.pop();
                expect(stack.get()).toEqual([1, 2]);
            });
            it("Removes the top item only if the item matches", () => {
                const stack = new Stack([1, 2, 3]);
                expect(stack.pop(3)).toBeTruthy();
                expect(stack.get()).toEqual([1, 2]);
                expect(stack.pop(3)).toBeFalsy();
                expect(stack.get()).toEqual([1, 2]);
            });
            describe("Handles substacks properly", () => {
                it("Handles popping the stack", () => {
                    const stack = new Stack([1, 2, 3]);
                    const substack = new Stack([3, 4, 5]);
                    stack.push(substack);
                    stack.push(6);
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    stack.pop();
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 5]);
                    stack.pop();
                    expect(stack.get()).toEqual([1, 2, 3]);
                    stack.push(substack);
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 5]);
                    stack.pop(3);
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 5]);
                    stack.pop(substack);
                    expect(stack.get()).toEqual([1, 2, 3]);
                });
                it("Handles popping from the stack", () => {
                    const stack = new Stack([1, 2, 3]);
                    const substack = new Stack([3, 4, 5]);
                    stack.push(substack);
                    stack.push(6);
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    substack.pop();
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 6]);
                });
            });
        });
        describe("Stack.insert", () => {
            it("Adds the item at the correct location", () => {
                const stack = new Stack([1, 2, 3]);
                stack.insert(6, 1);
                expect(stack.get()).toEqual([1, 6, 2, 3]);
            });
            describe("Handles substacks properly", () => {
                it("Handles inserting stacks", () => {
                    const stack = new Stack([1, 2, 3]);
                    const substack = new Stack([3, 4, 5]);
                    stack.insert(substack, 2);
                    stack.insert(6, 3);
                    expect(stack.get()).toEqual([1, 2, 3, 4, 5, 6, 3]);
                });
                it("Handles inserting to the stack", () => {
                    const stack = new Stack([1, 2, 3]);
                    const substack = new Stack([3, 4, 5]);
                    stack.push(substack);
                    stack.push(6);
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    substack.insert(9, 2);
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 9, 5, 6]);
                });
            });
        });
        describe("Stack.remove", () => {
            it("Removes the item if present", () => {
                const stack = new Stack([1, 2, 3]);
                stack.remove(2);
                expect(stack.get()).toEqual([1, 3]);
            });
            it("Indicates whether the item was present", () => {
                const stack = new Stack([1, 2, 3]);
                expect(stack.remove(2)).toBeTruthy();
                expect(stack.get()).toEqual([1, 3]);
                expect(stack.remove(2)).toBeFalsy();
                expect(stack.get()).toEqual([1, 3]);
            });
            describe("Handles substacks properly", () => {
                it("Handles removing stacks", () => {
                    const stack = new Stack([1, 2, 3]);
                    const substack = new Stack([3, 4, 5]);
                    stack.insert(substack, 2);
                    stack.insert(6, 3);
                    expect(stack.get()).toEqual([1, 2, 3, 4, 5, 6, 3]);
                    stack.remove(substack);
                    expect(stack.get()).toEqual([1, 2, 6, 3]);
                });
                it("Handles removing from the stack", () => {
                    const stack = new Stack([1, 2, 3]);
                    const substack = new Stack([3, 4, 5]);
                    stack.push(substack);
                    stack.push(6);
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    substack.remove(3);
                    expect(stack.get()).toEqual([1, 2, 3, 4, 5, 6]);
                });
            });
        });
    });
    describe("Flattened edit methods", () => {
        describe("Stack.pushFlat", () => {
            it("Correctly adds an item", () => {
                const stack = new Stack([1, 2, 3]);
                stack.pushFlat(4);
                expect(stack.get()).toEqual([1, 2, 3, 4]);
            });
            it("Correctly adds multiple items at once", () => {
                const stack = new Stack([1, 2, 3]);
                stack.pushFlat(4, 5);
                expect(stack.get()).toEqual([1, 2, 3, 4, 5]);
            });
            describe("Handles substacks properly", () => {
                it("Adds to a substack if on top", () => {
                    const stack = new Stack([1, 2, 3]);
                    const substack = new Stack([3, 4, 5]);
                    stack.pushFlat(substack);
                    stack.pushFlat(6);
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    expect(substack.get()).toEqual([3, 4, 5, 6]);
                    const subsubstack = new Stack([7]);
                    stack.pushFlat(subsubstack);
                    stack.pushFlat(8);
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 5, 6, 7, 8]);
                    expect(subsubstack.get()).toEqual([7, 8]);
                });
                it("Handles adding to the stack", () => {
                    const stack = new Stack([1, 2, 3]);
                    const substack = new Stack([3, 4, 5]);
                    stack.push(substack);
                    substack.pushFlat(2);
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 5, 2]);
                });
            });
        });
        describe("Stack.popFlat", () => {
            it("Removes the top item", () => {
                const stack = new Stack([1, 2, 3]);
                stack.popFlat();
                expect(stack.get()).toEqual([1, 2]);
            });
            it("Removes the top item only if the item matches", () => {
                const stack = new Stack([1, 2, 3]);
                expect(stack.popFlat(3)).toBeTruthy();
                expect(stack.get()).toEqual([1, 2]);
                expect(stack.popFlat(3)).toBeFalsy();
                expect(stack.get()).toEqual([1, 2]);
            });
            describe("Handles substacks properly", () => {
                it("Pops one item at a time", () => {
                    const stack = new Stack([1, 2, 3]);
                    const substack = new Stack([3, 4, 5]);
                    stack.push(substack);
                    stack.push(6);
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    stack.popFlat();
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 5]);
                    stack.popFlat();
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4]);
                    expect(stack.popFlat(4)).toBeTruthy();
                    expect(stack.get()).toEqual([1, 2, 3, 3]);
                    expect(stack.popFlat(4)).toBeFalsy();
                    expect(stack.get()).toEqual([1, 2, 3, 3]);
                });
                it("Can pop an entire substack", () => {
                    const stack = new Stack([1, 2, 3]);
                    const substack = new Stack([3, 4, 5]);
                    stack.push(substack);
                    stack.push(6);
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    stack.popFlat();
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 5]);
                    stack.popFlat(substack);
                    expect(stack.get()).toEqual([1, 2, 3]);
                });
                it("Handles popping from the stack", () => {
                    const stack = new Stack([1, 2, 3]);
                    const substack = new Stack([3, 4, 5]);
                    stack.push(substack);
                    stack.push(6);
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    substack.popFlat();
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 6]);
                });
            });
        });
        describe("Stack.insertFlat", () => {
            it("Adds the item at the correct location", () => {
                const stack = new Stack([1, 2, 3]);
                stack.insertFlat(6, 1);
                expect(stack.get()).toEqual([1, 6, 2, 3]);
            });
            describe("Handles substacks properly", () => {
                it("Inserts at the correct index of the substack", () => {
                    const stack = new Stack([1, 2, 3]);
                    const substack = new Stack([3, 4, 5]);
                    stack.insertFlat(substack, 2);
                    stack.insertFlat(6, 3);
                    expect(stack.get()).toEqual([1, 2, 3, 6, 4, 5, 3]);
                    expect(substack.get()).toEqual([3, 6, 4, 5]);
                });
                it("Handles inserting to the stack", () => {
                    const stack = new Stack([1, 2, 3]);
                    const substack = new Stack([3, 4, 5]);
                    stack.push(substack);
                    stack.push(6);
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    substack.insertFlat(9, 2);
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 9, 5, 6]);
                });
            });
        });
        describe("Stack.removeFlat", () => {
            it("Removes the item if present", () => {
                const stack = new Stack([1, 2, 3]);
                stack.removeFlat(2);
                expect(stack.get()).toEqual([1, 3]);
            });
            it("Indicates whether the item was present", () => {
                const stack = new Stack([1, 2, 3]);
                expect(stack.removeFlat(2)).toBeTruthy();
                expect(stack.get()).toEqual([1, 3]);
                expect(stack.removeFlat(2)).toBeFalsy();
                expect(stack.get()).toEqual([1, 3]);
            });
            describe("Handles substacks properly", () => {
                it("Handles removing stacks", () => {
                    const stack = new Stack([1, 2, 3]);
                    const substack = new Stack([3, 4, 5]);
                    stack.insert(substack, 2);
                    stack.insert(6, 3);
                    expect(stack.get()).toEqual([1, 2, 3, 4, 5, 6, 3]);
                    stack.removeFlat(substack);
                    expect(stack.get()).toEqual([1, 2, 6, 3]);
                });
                it("Handles removing from the stack", () => {
                    const stack = new Stack([1, 2, 3]);
                    const substack = new Stack([3, 4, 5]);
                    stack.push(substack);
                    stack.push(6);
                    expect(stack.get()).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    substack.removeFlat(3);
                    expect(stack.get()).toEqual([1, 2, 3, 4, 5, 6]);
                    stack.removeFlat(4);
                    expect(stack.get()).toEqual([1, 2, 3, 5, 6]);
                });
            });
        });
    });
    describe("Retrieval methods", () => {
        describe("Stack.getRaw", () => {
            it("Retrieves the raw, non-flattened, data", () => {
                const stack = new Stack([1, 2, 3]);
                const substack = new Stack([3, 4, 5]);
                stack.push(substack);
                expect(stack.getRaw()).toEqual([1, 2, 3, substack]);
            });
            it("Can be subscribed to", async () => {
                const stack = new Stack([1, 2, 3]);
                const listener = jest.fn();
                new Observer(h => stack.getRaw(h)).listen(listener);

                const substack = new Stack([3, 4, 5]);
                await wait(10);
                expect(listener.mock.calls.length).toBe(0);

                stack.push(substack);
                await wait(10);
                expect(listener.mock.calls.length).toBe(1);
                expect(listener.mock.calls[0][0]).toEqual([1, 2, 3, substack]);
            });
        });
        describe("Stack.get", () => {
            it("Retrieves the flattened data", () => {
                const stack = new Stack([1, 2, 3]);
                const substack = new Stack([3, 4, 5]);
                stack.push(substack);
                expect(stack.get()).toEqual([1, 2, 3, 3, 4, 5]);
            });
            it("Can be subscribed to", async () => {
                const stack = new Stack([1, 2, 3]);
                const listener = jest.fn();
                new Observer(stack).listen(listener);
                const substack = new Stack([3, 4, 5]);
                await wait(10);
                expect(listener.mock.calls.length).toBe(0);

                stack.push(substack);
                await wait(10);
                expect(listener.mock.calls.length).toBe(1);
                expect(listener.mock.calls[0][0]).toEqual([1, 2, 3, 3, 4, 5]);

                substack.push(3);
                await wait(10);
                expect(listener.mock.calls.length).toBe(2);
                expect(listener.mock.calls[1][0]).toEqual([1, 2, 3, 3, 4, 5, 3]);
            });
        });
        describe("Stack.getTop", () => {
            it("Retrieves the top item", () => {
                const stack = new Stack([1, 2, 3]);
                const substack = new Stack([3, 4, 5]);
                stack.push(substack);
                expect(stack.getTop()).toEqual(5);
            });
            it("Can be subscribed to", async () => {
                const stack = new Stack([1, 2, 3]);
                const listener = jest.fn();
                new Observer(h => stack.getTop(h)).listen(listener);
                const substack = new Stack([3, 4, 5]);
                await wait(10);
                expect(listener.mock.calls.length).toBe(0);

                stack.push(substack);
                await wait(10);
                expect(listener.mock.calls.length).toBe(1);
                expect(listener.mock.calls[0][0]).toEqual(5);

                substack.push(3);
                await wait(10);
                expect(listener.mock.calls.length).toBe(2);
                expect(listener.mock.calls[1][0]).toEqual(3);
            });
        });
    });
});
