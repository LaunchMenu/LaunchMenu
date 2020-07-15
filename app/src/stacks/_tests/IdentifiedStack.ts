import {IdentifiedStack} from "../IdentifiedStack";
import {Observer} from "../../utils/modelReact/Observer";
import {wait} from "../../_tests/wait.helper";

function getValues<T>(
    items: readonly ({id: string; value: T} | IdentifiedStack<T>)[]
): (T | IdentifiedStack<T>)[] {
    return items.map(item => ("value" in item ? item.value : item));
}

describe("IdentifiedStack", () => {
    // TODO: test IdentifiedStack specific arguments
    describe("new IdentifiedStack", () => {
        it("Properly creates a stack", () => {
            new IdentifiedStack();
        });
        it("Can be initialized with items", async () => {
            const stack = new IdentifiedStack([1, 2, 3]);
            expect(getValues(stack.get())).toEqual([1, 2, 3]);
        });
    });
    describe("Primary edit methods", () => {
        describe("IdentifiedStack.push", () => {
            it("Correctly adds an item", () => {
                const stack = new IdentifiedStack([1, 2, 3]);
                stack.push(4);
                stack.push({id: "12", value: 5});
                expect(getValues(stack.get())).toEqual([1, 2, 3, 4, 5]);
                expect(stack.get()[4].id).toEqual("12");
            });
            it("Correctly adds multiple items at once", () => {
                const stack = new IdentifiedStack([1, 2, 3]);
                stack.push(4, 5);
                expect(getValues(stack.get())).toEqual([1, 2, 3, 4, 5]);
            });
            describe("Handles substacks properly", () => {
                it("Handles adding the stack", () => {
                    const stack = new IdentifiedStack([1, 2, 3]);
                    const substack = new IdentifiedStack([3, 4, 5]);
                    stack.push(substack);
                    stack.push(6);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    expect(getValues(substack.get())).toEqual([3, 4, 5]);
                });
                it("Handles adding to the stack", () => {
                    const stack = new IdentifiedStack([1, 2, 3]);
                    const substack = new IdentifiedStack([3, 4, 5]);
                    stack.push(substack);
                    substack.push(2);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 5, 2]);
                });
            });
        });
        describe("IdentifiedStack.pop", () => {
            it("Removes the top item", () => {
                const stack = new IdentifiedStack([1, 2, 3]);
                stack.pop();
                expect(getValues(stack.get())).toEqual([1, 2]);
            });
            it("Removes the top item only if the item matches by reference", () => {
                const i1 = {id: "1", value: 1};
                const i2 = {id: "2", value: 2};
                const stack = new IdentifiedStack([i1, i2]);
                expect(stack.pop(i2)).toBeTruthy();
                expect(getValues(stack.get())).toEqual([1]);
                expect(stack.pop(i2)).toBeFalsy();
                expect(getValues(stack.get())).toEqual([1]);
            });
            it("Removes the top item only if the item matches by id", () => {
                const i1 = {id: "1", value: 1};
                const i2 = {id: "2", value: 2};
                const stack = new IdentifiedStack([i1, i2]);
                expect(stack.pop({id: "2"})).toBeTruthy();
                expect(getValues(stack.get())).toEqual([1]);
                expect(stack.pop({id: "2"})).toBeFalsy();
                expect(getValues(stack.get())).toEqual([1]);
            });
            it("Removes the top item only if the item matches by value", () => {
                const stack = new IdentifiedStack([1, 2, 3]);
                expect(stack.pop(3)).toBeTruthy();
                expect(getValues(stack.get())).toEqual([1, 2]);
                expect(stack.pop(3)).toBeFalsy();
                expect(getValues(stack.get())).toEqual([1, 2]);
            });
            describe("Handles substacks properly", () => {
                it("Handles popping the stack", () => {
                    const stack = new IdentifiedStack([1, 2, 3]);
                    const substack = new IdentifiedStack([3, 4, 5]);
                    stack.push(substack);
                    stack.push(6);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    stack.pop();
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 5]);
                    stack.pop();
                    expect(getValues(stack.get())).toEqual([1, 2, 3]);
                    stack.push(substack);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 5]);
                    stack.pop(3);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 5]);
                    stack.pop(substack);
                    expect(getValues(stack.get())).toEqual([1, 2, 3]);
                });
                it("Handles popping from the stack", () => {
                    const stack = new IdentifiedStack([1, 2, 3]);
                    const substack = new IdentifiedStack([3, 4, 5]);
                    stack.push(substack);
                    stack.push(6);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    substack.pop();
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 6]);
                });
            });
        });
        describe("IdentifiedStack.insert", () => {
            it("Adds the item at the correct location", () => {
                const stack = new IdentifiedStack([1, 2, 3]);
                stack.insert(6, 1);
                stack.insert({id: "12", value: 7}, 2);
                expect(getValues(stack.get())).toEqual([1, 6, 7, 2, 3]);
                expect(stack.get()[2].id).toEqual("12");
            });
            describe("Handles substacks properly", () => {
                it("Handles inserting stacks", () => {
                    const stack = new IdentifiedStack([1, 2, 3]);
                    const substack = new IdentifiedStack([3, 4, 5]);
                    stack.insert(substack, 2);
                    stack.insert(6, 3);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 4, 5, 6, 3]);
                });
                it("Handles inserting to the stack", () => {
                    const stack = new IdentifiedStack([1, 2, 3]);
                    const substack = new IdentifiedStack([3, 4, 5]);
                    stack.push(substack);
                    stack.push(6);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    substack.insert(9, 2);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 9, 5, 6]);
                });
            });
        });
        describe("IdentifiedStack.remove", () => {
            it("Removes the item by reference if present", () => {
                const i1 = {id: "1", value: 1};
                const i2 = {id: "2", value: 2};
                const i3 = {id: "3", value: 3};
                const stack = new IdentifiedStack([i1, i2, i3]);
                stack.remove(i2);
                expect(getValues(stack.get())).toEqual([1, 3]);
            });
            it("Removes the item by value if present", () => {
                const i1 = {id: "1", value: 1};
                const i2 = {id: "2", value: 2};
                const i3 = {id: "3", value: 3};
                const stack = new IdentifiedStack([i1, i2, i3]);
                stack.remove(2);
                expect(getValues(stack.get())).toEqual([1, 3]);
            });
            it("Removes the item by id if present", () => {
                const i1 = {id: "1", value: 1};
                const i2 = {id: "2", value: 2};
                const i3 = {id: "3", value: 3};
                const stack = new IdentifiedStack([i1, i2, i3]);
                stack.remove({id: "2"});
                expect(getValues(stack.get())).toEqual([1, 3]);
            });
            it("Indicates whether the item was present", () => {
                const stack = new IdentifiedStack([1, 2, 3]);
                expect(stack.remove(2)).toBeTruthy();
                expect(getValues(stack.get())).toEqual([1, 3]);
                expect(stack.remove(2)).toBeFalsy();
                expect(stack.remove({id: "shit"})).toBeFalsy();
                expect(getValues(stack.get())).toEqual([1, 3]);
            });
            describe("Handles substacks properly", () => {
                it("Handles removing stacks", () => {
                    const stack = new IdentifiedStack([1, 2, 3]);
                    const substack = new IdentifiedStack([3, 4, 5]);
                    stack.insert(substack, 2);
                    stack.insert(6, 3);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 4, 5, 6, 3]);
                    stack.remove(substack);
                    expect(getValues(stack.get())).toEqual([1, 2, 6, 3]);
                });
                it("Handles removing from the stack", () => {
                    const stack = new IdentifiedStack([1, 2, 3]);
                    const substack = new IdentifiedStack([3, 4, 5]);
                    stack.push(substack);
                    stack.push(6);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    substack.remove(3);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 4, 5, 6]);
                });
            });
        });
    });
    describe("Flattened edit methods", () => {
        describe("Stack.pushFlat", () => {
            it("Correctly adds an item", () => {
                const stack = new IdentifiedStack([1, 2, 3]);
                stack.pushFlat(4);
                stack.pushFlat({id: "12", value: 5});
                expect(getValues(stack.get())).toEqual([1, 2, 3, 4, 5]);
                expect(stack.get()[4].id).toEqual("12");
            });
            it("Correctly adds multiple items at once", () => {
                const stack = new IdentifiedStack([1, 2, 3]);
                stack.pushFlat(4, 5);
                expect(getValues(stack.get())).toEqual([1, 2, 3, 4, 5]);
            });
            describe("Handles substacks properly", () => {
                it("Adds to a substack if on top", () => {
                    const stack = new IdentifiedStack([1, 2, 3]);
                    const substack = new IdentifiedStack([3, 4, 5]);
                    stack.pushFlat(substack);
                    stack.pushFlat(6);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    expect(getValues(substack.get())).toEqual([3, 4, 5, 6]);
                    const subsubstack = new IdentifiedStack([7]);
                    stack.pushFlat(subsubstack);
                    stack.pushFlat(8);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 5, 6, 7, 8]);
                    expect(getValues(subsubstack.get())).toEqual([7, 8]);
                });
                it("Handles adding to the stack", () => {
                    const stack = new IdentifiedStack([1, 2, 3]);
                    const substack = new IdentifiedStack([3, 4, 5]);
                    stack.push(substack);
                    substack.pushFlat(2);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 5, 2]);
                });
            });
        });
        describe("Stack.popFlat", () => {
            it("Removes the top item", () => {
                const stack = new IdentifiedStack([1, 2, 3]);
                stack.popFlat();
                expect(getValues(stack.get())).toEqual([1, 2]);
            });
            it("Removes the top item by reference only if the item matches", () => {
                const i1 = {id: "1", value: 1};
                const i2 = {id: "2", value: 2};
                const i3 = {id: "3", value: 3};
                const stack = new IdentifiedStack([i1, i2, i3]);
                expect(stack.popFlat(i3)).toBeTruthy();
                expect(getValues(stack.get())).toEqual([1, 2]);
                expect(stack.popFlat(i3)).toBeFalsy();
                expect(getValues(stack.get())).toEqual([1, 2]);
            });
            it("Removes the top item by id only if the item matches", () => {
                const i1 = {id: "1", value: 1};
                const i2 = {id: "2", value: 2};
                const i3 = {id: "3", value: 3};
                const stack = new IdentifiedStack([i1, i2, i3]);
                expect(stack.popFlat({id: "3"})).toBeTruthy();
                expect(getValues(stack.get())).toEqual([1, 2]);
                expect(stack.popFlat({id: "3"})).toBeFalsy();
                expect(getValues(stack.get())).toEqual([1, 2]);
            });
            it("Removes the top item by reference only if the item matches", () => {
                const i1 = {id: "1", value: 1};
                const i2 = {id: "2", value: 2};
                const i3 = {id: "3", value: 3};
                const stack = new IdentifiedStack([i1, i2, i3]);
                expect(stack.popFlat(3)).toBeTruthy();
                expect(getValues(stack.get())).toEqual([1, 2]);
                expect(stack.popFlat(3)).toBeFalsy();
                expect(getValues(stack.get())).toEqual([1, 2]);
            });
            describe("Handles substacks properly", () => {
                it("Pops one item at a time", () => {
                    const stack = new IdentifiedStack([1, 2, 3]);
                    const substack = new IdentifiedStack([3, 4, 5]);
                    stack.push(substack);
                    stack.push(6);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    stack.popFlat();
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 5]);
                    stack.popFlat();
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4]);
                    expect(stack.popFlat(4)).toBeTruthy();
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3]);
                    expect(stack.popFlat(4)).toBeFalsy();
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3]);
                });
                it("Can pop an entire substack", () => {
                    const stack = new IdentifiedStack([1, 2, 3]);
                    const substack = new IdentifiedStack([3, 4, 5]);
                    stack.push(substack);
                    stack.push(6);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    stack.popFlat();
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 5]);
                    stack.popFlat(substack);
                    expect(getValues(stack.get())).toEqual([1, 2, 3]);
                });
                it("Handles popping from the stack", () => {
                    const stack = new IdentifiedStack([1, 2, 3]);
                    const substack = new IdentifiedStack([3, 4, 5]);
                    stack.push(substack);
                    stack.push(6);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    substack.popFlat();
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 6]);
                });
            });
        });
        describe("Stack.insertFlat", () => {
            it("Adds the item at the correct location", () => {
                const stack = new IdentifiedStack([1, 2, 3]);
                stack.insertFlat(6, 1);
                stack.insertFlat({id: "okay", value: 7}, 1);
                expect(getValues(stack.get())).toEqual([1, 7, 6, 2, 3]);
                expect(stack.get()[1].id).toEqual("okay");
            });
            describe("Handles substacks properly", () => {
                it("Inserts at the correct index of the substack", () => {
                    const stack = new IdentifiedStack([1, 2, 3]);
                    const substack = new IdentifiedStack([3, 4, 5]);
                    stack.insertFlat(substack, 2);
                    stack.insertFlat(6, 3);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 6, 4, 5, 3]);
                    expect(getValues(substack.get())).toEqual([3, 6, 4, 5]);
                });
                it("Handles inserting to the stack", () => {
                    const stack = new IdentifiedStack([1, 2, 3]);
                    const substack = new IdentifiedStack([3, 4, 5]);
                    stack.push(substack);
                    stack.push(6);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    substack.insertFlat(9, 2);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 9, 5, 6]);
                });
            });
        });
        describe("Stack.removeFlat", () => {
            it("Removes the item by reference if present", () => {
                const i1 = {id: "1", value: 1};
                const i2 = {id: "2", value: 2};
                const i3 = {id: "3", value: 3};
                const stack = new IdentifiedStack([i1, i2, i3]);
                stack.removeFlat(i2);
                expect(getValues(stack.get())).toEqual([1, 3]);
            });
            it("Removes the item by id if present", () => {
                const i1 = {id: "1", value: 1};
                const i2 = {id: "2", value: 2};
                const i3 = {id: "3", value: 3};
                const stack = new IdentifiedStack([i1, i2, i3]);
                stack.removeFlat({id: "2"});
                expect(getValues(stack.get())).toEqual([1, 3]);
            });
            it("Removes the item by value if present", () => {
                const i1 = {id: "1", value: 1};
                const i2 = {id: "2", value: 2};
                const i3 = {id: "3", value: 3};
                const stack = new IdentifiedStack([i1, i2, i3]);
                stack.removeFlat(2);
                expect(getValues(stack.get())).toEqual([1, 3]);
            });
            it("Indicates whether the item was present", () => {
                const stack = new IdentifiedStack([1, 2, 3]);
                expect(stack.removeFlat(2)).toBeTruthy();
                expect(getValues(stack.get())).toEqual([1, 3]);
                expect(stack.removeFlat(2)).toBeFalsy();
                expect(getValues(stack.get())).toEqual([1, 3]);
            });
            describe("Handles substacks properly", () => {
                it("Handles removing stacks", () => {
                    const stack = new IdentifiedStack([1, 2, 3]);
                    const substack = new IdentifiedStack([3, 4, 5]);
                    stack.insert(substack, 2);
                    stack.insert(6, 3);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 4, 5, 6, 3]);
                    stack.removeFlat(substack);
                    expect(getValues(stack.get())).toEqual([1, 2, 6, 3]);
                });
                it("Handles removing from the stack", () => {
                    const stack = new IdentifiedStack([1, 2, 3]);
                    const substack = new IdentifiedStack([3, 4, 5]);
                    stack.push(substack);
                    stack.push(6);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 5, 6]);
                    substack.removeFlat(3);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 4, 5, 6]);
                    stack.removeFlat(4);
                    expect(getValues(stack.get())).toEqual([1, 2, 3, 5, 6]);
                });
            });
        });
    });

    describe("Retrieval methods", () => {
        describe("Stack.getRaw", () => {
            it("Retrieves the raw, non-flattened, data", () => {
                const stack = new IdentifiedStack([1, 2, 3]);
                const substack = new IdentifiedStack([3, 4, 5]);
                stack.push(substack);
                expect(getValues(stack.getRaw())).toEqual([1, 2, 3, substack]);
            });
            it("Can be subscribed to", async () => {
                const stack = new IdentifiedStack([1, 2, 3]);
                const listener = jest.fn();
                new Observer(h => stack.getRaw(h)).listen(listener);

                const substack = new IdentifiedStack([3, 4, 5]);
                await wait(10);
                expect(listener.mock.calls.length).toBe(0);

                stack.push(substack);
                await wait(10);
                expect(listener.mock.calls.length).toBe(1);
                expect(getValues(listener.mock.calls[0][0])).toEqual([1, 2, 3, substack]);
            });
        });
        describe("Stack.get", () => {
            it("Retrieves the flattened data", () => {
                const stack = new IdentifiedStack([1, 2, 3]);
                const substack = new IdentifiedStack([3, 4, 5]);
                stack.push(substack);
                expect(getValues(stack.get())).toEqual([1, 2, 3, 3, 4, 5]);
            });
            it("Can be subscribed to", async () => {
                const stack = new IdentifiedStack([1, 2, 3]);
                const listener = jest.fn();
                new Observer(stack).listen(listener);
                const substack = new IdentifiedStack([3, 4, 5]);
                await wait(10);
                expect(listener.mock.calls.length).toBe(0);

                stack.push(substack);
                await wait(10);
                expect(listener.mock.calls.length).toBe(1);
                expect(getValues(listener.mock.calls[0][0])).toEqual([1, 2, 3, 3, 4, 5]);

                substack.push(3);
                await wait(10);
                expect(listener.mock.calls.length).toBe(2);
                expect(getValues(listener.mock.calls[1][0])).toEqual([
                    1,
                    2,
                    3,
                    3,
                    4,
                    5,
                    3,
                ]);
            });
            it("Has consistent ids", () => {
                const stack = new IdentifiedStack([1, 2, 3]);
                const substack = new IdentifiedStack([3, 4, 5]);
                stack.push(substack);
                const ids = stack.get().map(({id}) => id);
                stack.push(34);
                const newIds = stack.get().map(({id}) => id);
                expect(ids).toEqual(newIds.slice(0, ids.length));
            });
        });
        describe("Stack.getTop", () => {
            it("Retrieves the top item", () => {
                const stack = new IdentifiedStack([1, 2, 3]);
                const substack = new IdentifiedStack([3, 4, 5]);
                stack.push(substack);
                expect(stack.getTop()).toHaveProperty("value", 5);
            });
            it("Can be subscribed to", async () => {
                const stack = new IdentifiedStack([1, 2, 3]);
                const listener = jest.fn();
                new Observer(h => stack.getTop(h)).listen(listener);
                const substack = new IdentifiedStack([3, 4, 5]);
                await wait(10);
                expect(listener.mock.calls.length).toBe(0);

                stack.push(substack);
                await wait(10);
                expect(listener.mock.calls.length).toBe(1);
                expect(listener.mock.calls[0][0]).toHaveProperty("value", 5);

                substack.push(3);
                await wait(10);
                expect(listener.mock.calls.length).toBe(2);
                expect(listener.mock.calls[1][0]).toHaveProperty("value", 3);
            });
        });
    });
});
