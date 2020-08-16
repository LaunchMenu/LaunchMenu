import {UndoRedoFacility} from "../UndoRedoFacility";
import {TestCommand} from "./TestCommand.helper";
import {wait} from "../../_tests/wait.helper";
import {CompoundCommand} from "../commands/CompoundCommand";
import {Observer} from "../../utils/modelReact/Observer";

describe("UndoRedoFacility", () => {
    describe("new UndoRedoFacility", () => {
        new UndoRedoFacility();
    });
    describe("UndoRedoFacility.execute", () => {
        let undoRedo: UndoRedoFacility;
        beforeEach(() => {
            undoRedo = new UndoRedoFacility();
        });
        it("Correctly executes commands", async () => {
            const onExecute = jest.fn();
            const command = new TestCommand({onExecute});
            await wait(20);
            expect(onExecute.mock.calls.length).toBe(0);

            undoRedo.execute(command);
            await wait(20);
            expect(onExecute.mock.calls.length).toBe(1);
        });
        it("Adds the command to the history", () => {
            const command = new TestCommand();
            undoRedo.execute(command);
            expect(undoRedo.getCommands().past).toEqual([command]);

            const command2 = new TestCommand();
            undoRedo.execute(command2);
            expect(undoRedo.getCommands().past).toEqual([command, command2]);
        });
        it("Returns a promise that resolves when the command finished executing", async () => {
            const onExecute = jest.fn();
            const command = new TestCommand({onExecute});
            expect(onExecute.mock.calls.length).toBe(0);
            await undoRedo.execute(command);
            expect(onExecute.mock.calls.length).toBe(1);
        });
        describe("batchCommands", () => {
            it("Combines multiple commands that all specify to be batched", () => {
                const command = new TestCommand();
                undoRedo.execute(command, true);
                expect(undoRedo.getCommands().past.length).toBe(1);

                const command2 = new TestCommand();
                undoRedo.execute(command2, true);
                expect(undoRedo.getCommands().past.length).toBe(1);
                const compoundCmd = undoRedo.getCommands().past[0];

                if (compoundCmd instanceof CompoundCommand)
                    expect(compoundCmd.commands).toEqual([command, command2]);
                else expect(false).toBeTruthy();
            });
            it("Doesn't combine commands that don't specify to be batched", () => {
                const command = new TestCommand();
                undoRedo.execute(command, true);
                expect(undoRedo.getCommands().past.length).toBe(1);

                const command2 = new TestCommand();
                undoRedo.execute(command2, true);
                expect(undoRedo.getCommands().past.length).toBe(1);

                const command3 = new TestCommand();
                undoRedo.execute(command3);
                expect(undoRedo.getCommands().past.length).toBe(2);
            });
            it("Automatically adds to existing compound commands", () => {
                const command = new TestCommand();
                const compoundCmd = new CompoundCommand([command]);
                undoRedo.execute(compoundCmd);
                expect(undoRedo.getCommands().past.length).toBe(1);

                const command2 = new TestCommand();
                undoRedo.execute(command2, true);
                expect(undoRedo.getCommands().past.length).toBe(1);

                const resCompoundCmd = undoRedo.getCommands().past[0];
                if (resCompoundCmd instanceof CompoundCommand)
                    expect(resCompoundCmd.commands).toEqual([command, command2]);
                else expect(false).toBeTruthy();
            });
            it("Can determine batching based on previous commands", () => {
                const command = new TestCommand();
                undoRedo.execute(command, true);
                expect(undoRedo.getCommands().past.length).toBe(1);

                const command2 = new TestCommand();
                let paramCmd;
                undoRedo.execute(command2, prev => {
                    paramCmd = prev;
                    return true;
                });
                expect(undoRedo.getCommands().past.length).toBe(1);

                const command3 = new TestCommand();
                undoRedo.execute(command3, () => false);
                expect(undoRedo.getCommands().past.length).toBe(2);

                expect(paramCmd).toBeInstanceOf(CompoundCommand);
                expect((paramCmd as CompoundCommand).commands).toEqual([command]);
            });
        });
    });
    describe("UndoRedoFacility.splitBatch", () => {
        it("Forces consecutive commands to never be batched", () => {
            const undoRedo = new UndoRedoFacility();

            const command = new TestCommand();
            undoRedo.execute(command, true);
            expect(undoRedo.getCommands().past.length).toBe(1);

            const command2 = new TestCommand();
            undoRedo.execute(command2, true);
            expect(undoRedo.getCommands().past.length).toBe(1);

            undoRedo.splitBatch();

            const command3 = new TestCommand();
            undoRedo.execute(command3, true);
            expect(undoRedo.getCommands().past.length).toBe(2);

            const command4 = new TestCommand();
            undoRedo.execute(command4, true);
            expect(undoRedo.getCommands().past.length).toBe(2);

            const resCompoundCmd1 = undoRedo.getCommands().past[0];
            const resCompoundCmd2 = undoRedo.getCommands().past[1];
            if (
                resCompoundCmd1 instanceof CompoundCommand &&
                resCompoundCmd2 instanceof CompoundCommand
            ) {
                expect(resCompoundCmd1.commands).toEqual([command, command2]);
                expect(resCompoundCmd2.commands).toEqual([command3, command4]);
            } else expect(false).toBeTruthy();
        });
    });
    describe("UndoRedoFacility.undo", () => {
        let undoRedo: UndoRedoFacility;
        beforeEach(() => {
            undoRedo = new UndoRedoFacility();
        });
        it("Successfully undoes the last executed command", async () => {
            const onRevert1 = jest.fn();
            const onRevert2 = jest.fn();
            const command1 = new TestCommand({onRevert: onRevert1});
            const command2 = new TestCommand({onRevert: onRevert2});
            undoRedo.execute(command1);
            undoRedo.execute(command2);

            await wait(40);
            expect(onRevert1.mock.calls.length).toBe(0);
            expect(onRevert2.mock.calls.length).toBe(0);

            undoRedo.undo();
            await wait(0);
            expect(onRevert1.mock.calls.length).toBe(0);
            expect(onRevert2.mock.calls.length).toBe(1);

            undoRedo.undo();
            await wait(0);
            expect(onRevert1.mock.calls.length).toBe(1);
            expect(onRevert2.mock.calls.length).toBe(1);
        });
        it("Returns a promise that resolves once the command finished reverting", async () => {
            const onRevert = jest.fn(async () => await wait(20));
            const command = new TestCommand({onRevert});
            undoRedo.execute(command);

            await wait(40);
            expect(onRevert.mock.calls.length).toBe(0);
            await undoRedo.undo();
            expect(onRevert.mock.calls.length).toBe(1);
        });
    });
    describe("UndoRedoFacility.redo", () => {
        let undoRedo: UndoRedoFacility;
        beforeEach(() => {
            undoRedo = new UndoRedoFacility();
        });
        it("Successfully redoes the last undone command", async () => {
            const onExecute1 = jest.fn();
            const onExecute2 = jest.fn();
            const command1 = new TestCommand({onExecute: onExecute1});
            const command2 = new TestCommand({onExecute: onExecute2});
            undoRedo.execute(command1);
            undoRedo.execute(command2);

            await wait(40);
            expect(onExecute1.mock.calls.length).toBe(1);
            expect(onExecute2.mock.calls.length).toBe(1);

            await undoRedo.undo();
            await undoRedo.undo();
            expect(onExecute1.mock.calls.length).toBe(1);
            expect(onExecute2.mock.calls.length).toBe(1);

            undoRedo.redo();
            await wait(0);
            expect(onExecute1.mock.calls.length).toBe(2);
            expect(onExecute2.mock.calls.length).toBe(1);

            undoRedo.redo();
            await wait(0);
            expect(onExecute1.mock.calls.length).toBe(2);
            expect(onExecute2.mock.calls.length).toBe(2);
        });
        it("Returns a promise that resolves once the command finished reverting", async () => {
            const onExecute = jest.fn(async () => await wait(20));
            const command = new TestCommand({onExecute});
            undoRedo.execute(command);

            await wait(40);
            await undoRedo.undo();
            expect(onExecute.mock.calls.length).toBe(1);

            await undoRedo.redo();
            expect(onExecute.mock.calls.length).toBe(2);
        });
        it("Executing new commands resets the future", async () => {
            const command = new TestCommand();
            undoRedo.execute(command);
            await undoRedo.undo();
            expect(undoRedo.getCommands().future.length).toBe(1);

            const command2 = new TestCommand();
            undoRedo.execute(command2);
            expect(undoRedo.getCommands().future.length).toBe(0);
        });
    });
    describe("UndoRedoFacility.getState", () => {
        let undoRedo: UndoRedoFacility;
        beforeEach(() => {
            undoRedo = new UndoRedoFacility();
        });
        it("Correctly shows the state based on the commands state", async () => {
            const command = new TestCommand();
            const command2 = new TestCommand();
            const command3 = new TestCommand();
            expect(undoRedo.getState()).toBe("ready");
            undoRedo.execute(command);
            undoRedo.execute(command2);
            undoRedo.execute(command3);
            expect(undoRedo.getState()).toBe("executing");
            await wait(30);
            expect(undoRedo.getState()).toBe("ready");
            undoRedo.undo();
            expect(undoRedo.getState()).toBe("reverting");
            await wait(20);
            undoRedo.redo();
            expect(undoRedo.getState()).toBe("executing");
            await wait(20);
            expect(undoRedo.getState()).toBe("ready");
        });
        it("Can be subscribed to", async () => {
            const callback = jest.fn();
            new Observer(h => undoRedo.getState(h)).listen(callback, true);
            const command = new TestCommand();
            const command2 = new TestCommand();
            const command3 = new TestCommand();
            expect(undoRedo.getState()).toBe("ready");
            await undoRedo.execute(command);
            await undoRedo.execute(command2);
            await undoRedo.execute(command3);
            await undoRedo.undo();
            await undoRedo.redo();
            await wait();
            expect(callback.mock.calls.map(([v]) => v)).toEqual([
                "ready",
                "executing",
                "executing",
                "executing",
                "reverting",
                "executing",
                "ready",
            ]);
        });
    });
    describe("UndoRedoFacility.getCommands", () => {
        let undoRedo: UndoRedoFacility;
        beforeEach(() => {
            undoRedo = new UndoRedoFacility();
        });
        it("Retrieves the past and future commands", async () => {
            const command = new TestCommand();
            const command2 = new TestCommand();
            const command3 = new TestCommand();
            await undoRedo.execute(command);
            await undoRedo.execute(command2);
            await undoRedo.execute(command3);
            await undoRedo.undo();
            expect(undoRedo.getCommands()).toEqual({
                past: [command, command2],
                future: [command3],
            });
        });
        it("Can be subscribed to", async () => {
            const callback = jest.fn();
            new Observer(h => undoRedo.getCommands(h)).listen(callback, true);
            const command = new TestCommand();
            const command2 = new TestCommand();
            const command3 = new TestCommand();
            await undoRedo.execute(command);
            await undoRedo.execute(command2);
            await undoRedo.execute(command3);
            await undoRedo.undo();
            await wait();
            expect(callback.mock.calls.map(([v]) => v)).toEqual([
                {past: [], future: []},
                {past: [command], future: []},
                {past: [command, command2], future: []},
                {past: [command, command2, command3], future: []},
                {past: [command, command2], future: [command3]},
            ]);
        });
    });
});
