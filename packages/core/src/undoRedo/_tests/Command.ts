import {TestCommand} from "./TestCommand.helper";
import {wait} from "../../_tests/wait.helper";
import {Resource} from "../dependencies/Resource";
import {UndoRedoFacility} from "../UndoRedoFacility";
import {Observer} from "model-react";

describe("Command", () => {
    describe("new Command", () => {
        it("Can be constructed", () => {
            new TestCommand();
        });
    });
    describe("Command.execute", () => {
        it("Executes the command", async () => {
            const onExecute = jest.fn();
            const cmd = new TestCommand({onExecute});
            await wait(20);
            expect(onExecute.mock.calls.length).toBe(0);

            cmd.execute();
            await wait(20);
            expect(onExecute.mock.calls.length).toBe(1);
        });
        it("Returns a promise that resolves once executing finished", async () => {
            let finished = false;
            const onExecute = jest.fn(async () => {
                await wait(20);
                finished = true;
            });
            const cmd = new TestCommand({onExecute});

            expect(finished).toBeFalsy();
            await cmd.execute();
            expect(finished).toBeTruthy();
        });
        it("Doesn't execute twice in a row", async () => {
            let finished = 0;
            const onExecute = jest.fn(async () => {
                await wait(20);
                finished++;
            });
            const cmd = new TestCommand({onExecute});

            expect(finished).toBe(0);
            await cmd.execute();
            expect(finished).toBe(1);
            await cmd.execute();
            expect(finished).toBe(1);
        });
        it("Waits for reverting to finish first", async () => {
            let finished = -1;
            const onExecute = jest.fn(async () => {
                finished++;
            });
            const cmd = new TestCommand({onExecute});
            await cmd.execute();
            cmd.revert();

            cmd.execute();
            await wait(5);
            expect(finished).toBe(0);

            await wait(10);
            expect(finished).toBe(1);

            await cmd.revert();
            cmd.execute();
            await wait(5);
            expect(finished).toBe(2);
        });
        it("Returns exceptions", async () => {
            const onExecute = jest.fn(async () => {
                throw "error";
            });
            const cmd = new TestCommand({onExecute});
            expect(cmd.execute()).rejects.toBeDefined();
        });
    });
    describe("Command.revert", () => {
        it("Reverts the command", async () => {
            const onRevert = jest.fn();
            const cmd = new TestCommand({onRevert});
            await cmd.execute();

            await wait(20);
            expect(onRevert.mock.calls.length).toBe(0);

            cmd.revert();
            await wait(20);
            expect(onRevert.mock.calls.length).toBe(1);
        });
        it("Returns a promise that resolves once reverting finished", async () => {
            let finished = false;
            const onRevert = jest.fn(async () => {
                await wait(20);
                finished = true;
            });
            const cmd = new TestCommand({onRevert});
            await cmd.execute();

            expect(finished).toBeFalsy();
            await cmd.revert();
            expect(finished).toBeTruthy();
        });
        it("Doesn't revert twice in a row", async () => {
            let finished = 0;
            const onRevert = jest.fn(async () => {
                await wait(20);
                finished++;
            });
            const cmd = new TestCommand({onRevert});
            await cmd.execute();

            expect(finished).toBe(0);
            await cmd.revert();
            expect(finished).toBe(1);
            await cmd.revert();
            expect(finished).toBe(1);
        });
        it("Waits for execution to finish first", async () => {
            let finished = 0;
            const onRevert = jest.fn(async () => {
                finished++;
            });
            const cmd = new TestCommand({onRevert});
            cmd.execute();

            cmd.revert();
            await wait(5);
            expect(finished).toBe(0);

            await wait(10);
            expect(finished).toBe(1);

            await cmd.execute();
            cmd.revert();
            await wait(5);
            expect(finished).toBe(2);
        });
        it("Returns exceptions", async () => {
            const onRevert = jest.fn(async () => {
                throw "error";
            });
            const cmd = new TestCommand({onRevert});
            await cmd.execute();
            expect(cmd.revert()).rejects.toBeDefined();
        });
    });
    describe("Command.dependencies", () => {
        it("Claims the dependencies while executing", async () => {
            const resource = new Resource();
            const cmd = new TestCommand({dependencies: [resource]});
            cmd.execute();
            expect(resource.isLocked()).toBe(true);
            await wait(15);
            expect(resource.isLocked()).toBe(false);
        });
        it("Claims the dependencies while reverting", async () => {
            const resource = new Resource();
            const cmd = new TestCommand({dependencies: [resource]});
            cmd.execute();
            expect(resource.isLocked()).toBe(true);
            await wait(15);
            expect(resource.isLocked()).toBe(false);
        });
        it("Forces commands to run fully sequentially", async () => {
            const facility = new UndoRedoFacility();
            const resource = new Resource();
            const events = [] as string[];
            const evt = (l: string) => async () => {
                events.push(l + "-start");
                await wait(20);
                events.push(l + "-end");
            };
            const createCmd = (v: string) =>
                new TestCommand({
                    dependencies: [resource],
                    onExecute: evt("execute-" + v),
                    onRevert: evt("revert-" + v),
                });

            const cmd1 = createCmd("1");
            const cmd2 = createCmd("2");
            const cmd3 = createCmd("3");

            facility.execute(cmd1);
            facility.execute(cmd2);
            facility.execute(cmd3);
            facility.undo();
            facility.undo();
            await facility.redo();

            expect(events).toEqual([
                "execute-1-start",
                "execute-1-end",
                "execute-2-start",
                "execute-2-end",
                "execute-3-start",
                "execute-3-end",
                "revert-3-start",
                "revert-3-end",
                "revert-2-start",
                "revert-2-end",
                "execute-2-start",
                "execute-2-end",
            ]);
        });
        it("Allows commands with different dependencies to run in parallel", async () => {
            const facility = new UndoRedoFacility();
            const resource1 = new Resource();
            const resource2 = new Resource();
            const events = [] as string[];
            const evt = (l: string) => async () => {
                events.push(l + "-start");
                await wait(20);
                events.push(l + "-end");
            };
            const createCmd = (v: string, f: boolean) =>
                new TestCommand({
                    dependencies: [f ? resource1 : resource2],
                    onExecute: evt("execute-" + v),
                    onRevert: evt("revert-" + v),
                    duration: 0,
                });

            const cmd1 = createCmd("1", true);
            const cmd2 = createCmd("2", false);
            const cmd3 = createCmd("3", true);
            const cmd4 = createCmd("4", false);

            facility.execute(cmd1);
            await wait(10);
            facility.execute(cmd2);
            facility.execute(cmd3);
            facility.execute(cmd4);
            facility.undo();
            facility.undo();
            await facility.redo();

            expect(events).toEqual([
                "execute-1-start",
                "execute-2-start",
                "execute-1-end",
                "execute-3-start",
                "execute-2-end",
                "execute-4-start",
                "execute-3-end",
                "revert-3-start",
                "execute-4-end",
                "revert-4-start",
                "revert-3-end",
                "execute-3-start",
                "revert-4-end",
                "execute-3-end",
            ]);
        });
    });
    describe("getState", () => {
        it("Correctly goes through the states", async () => {
            const facility = new UndoRedoFacility();
            const resource = new Resource();

            const cmd1 = new TestCommand({dependencies: [resource]});
            const cmd2 = new TestCommand({dependencies: [resource]});
            const cmd3 = new TestCommand({dependencies: [resource]});

            const callback = jest.fn();
            new Observer(h => cmd2.getState(h), {debounce: -1}).listen(callback, true);

            facility.execute(cmd1);
            facility.execute(cmd2);
            facility.execute(cmd3);
            facility.undo();
            facility.undo();
            await facility.redo();

            expect(callback.mock.calls.map(([v]) => v)).toEqual([
                "ready",
                "preparingForExecution",
                "executing",
                "executed",
                "preparingForRevert",
                "reverting",
                "ready",
                "preparingForExecution",
                "executing",
                "executed",
            ]);
        });
    });
});
