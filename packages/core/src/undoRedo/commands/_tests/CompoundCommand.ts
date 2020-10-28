import {CompoundCommand} from "../CompoundCommand";
import {TestCommand} from "../../_tests/TestCommand.helper";
import {wait} from "../../../_tests/wait.helper";
import {Resource} from "../../dependencies/Resource";
import {Observer} from "../../../utils/modelReact/Observer";

describe("CompoundCommand", () => {
    describe("new CompoundCommand", () => {
        it("Can be constructed", () => {
            new CompoundCommand([]);
            new CompoundCommand({name: "orange"}, []);
        });
    });
    describe("CompoundCommand.augment", () => {
        it("Can be used to augment the commands", () => {
            const cmd1 = new TestCommand();
            const cmd2 = new TestCommand();
            const cmd = new CompoundCommand({name: "test"}, [cmd1]);
            const augmented = cmd.augment(cmd2);
            expect(augmented.metadata).toEqual({name: "test"});
            expect(augmented.commands).toEqual([cmd1, cmd2]);
        });
    });
    describe("CompoundCommand.execute", () => {
        it("Calls execute on the commands in order", async () => {
            let v = 0;
            const execute1 = async () => {
                if (v == 0) v = 1;
            };
            const execute2 = async () => {
                if (v == 1) v = 2;
            };

            const cmd1 = new TestCommand({onExecute: execute1});
            const cmd2 = new TestCommand({onExecute: execute2});
            const cmd = new CompoundCommand([cmd1, cmd2]);

            cmd.execute();
            await wait(30);
            expect(v).toBe(2);
        });
        it("Returns a promise that resolves when all commands resolved", async () => {
            const cmd1 = new TestCommand({duration: 40});
            const cmd2 = new TestCommand();
            const cmd = new CompoundCommand([cmd1, cmd2]);

            expect(cmd1.getState()).toBe("ready");
            expect(cmd2.getState()).toBe("ready");
            await cmd.execute();
            expect(cmd1.getState()).toBe("executed");
            expect(cmd2.getState()).toBe("executed");
        });
    });
    describe("CompoundCommand.revert", () => {
        it("Calls revert on the commands in (reverse) order", async () => {
            let v = 2;
            const revert1 = async () => {
                if (v == 1) v = 0;
            };
            const revert2 = async () => {
                if (v == 2) v = 1;
            };

            const cmd1 = new TestCommand({onRevert: revert1});
            const cmd2 = new TestCommand({onRevert: revert2});
            const cmd = new CompoundCommand([cmd1, cmd2]);
            await cmd.execute();
            cmd.revert();
            await wait(30);
            expect(v).toBe(0);
        });
        it("Returns a promise that resolves when all commands resolved", async () => {
            const cmd1 = new TestCommand({duration: 40});
            const cmd2 = new TestCommand();
            const cmd = new CompoundCommand([cmd1, cmd2]);
            await cmd.execute();

            expect(cmd1.getState()).toBe("executed");
            expect(cmd2.getState()).toBe("executed");
            await cmd.revert();
            expect(cmd1.getState()).toBe("ready");
            expect(cmd2.getState()).toBe("ready");
        });
    });
    describe("CompoundCommand.getState", () => {
        it("Indicates executing or reverting if any commands are executing or reverting", async () => {
            const resource = new Resource();
            resource.acquire();

            const cmd1 = new TestCommand({duration: 40});
            const cmd2 = new TestCommand({dependencies: [resource]});
            const compoundCmd = new CompoundCommand([cmd1, cmd2]);

            compoundCmd.execute();
            await wait(5);
            expect(compoundCmd.getState()).toEqual("executing");

            const resource2 = new Resource();
            const cmd3 = new TestCommand({duration: 40});
            const cmd4 = new TestCommand({dependencies: [resource2]});
            const compoundCmd2 = new CompoundCommand([cmd3, cmd4]);
            await compoundCmd2.execute();

            resource2.acquire();
            compoundCmd2.revert();
            await wait(5);
            expect(compoundCmd2.getState()).toEqual("reverting");
        });
        it("Indicates preparing if any commands are preparing and none ar executing or reverting", async () => {
            const resource = new Resource();
            resource.acquire();

            const cmd1 = new TestCommand({dependencies: [resource]});
            const cmd2 = new TestCommand({dependencies: [resource]});
            const compoundCmd = new CompoundCommand([cmd1, cmd2]);

            compoundCmd.execute();
            await wait(5);
            expect(compoundCmd.getState()).toEqual("preparingForExecution");

            const resource2 = new Resource();
            const cmd3 = new TestCommand({dependencies: [resource2]});
            const cmd4 = new TestCommand({dependencies: [resource2]});
            const compoundCmd2 = new CompoundCommand([cmd3, cmd4]);
            await compoundCmd2.execute();

            resource2.acquire();
            compoundCmd2.revert();
            await wait(5);
            expect(compoundCmd2.getState()).toEqual("preparingForRevert");
        });
        it("Indicates ready or executed if no commands have another state", async () => {
            const cmd1 = new TestCommand();
            const cmd2 = new TestCommand();
            const compoundCmd = new CompoundCommand([cmd1, cmd2]);
            expect(compoundCmd.getState()).toEqual("ready");
            await compoundCmd.execute();
            expect(compoundCmd.getState()).toEqual("executed");
            await compoundCmd.revert();
            expect(compoundCmd.getState()).toEqual("ready");
        });
        it("Can be subscribed to", async () => {
            const cmd1 = new TestCommand();
            const cmd2 = new TestCommand();
            const compoundCmd = new CompoundCommand([cmd1, cmd2]);

            const callback = jest.fn();
            new Observer(h => compoundCmd.getState(h)).listen(callback, true);

            await compoundCmd.execute();
            await compoundCmd.revert();

            await wait(0);
            expect(callback.mock.calls.map(([v]) => v)).toEqual([
                "ready",
                "executing",
                "reverting",
                "ready",
            ]);
        });
    });
});
