import {ICommandState} from "./_types/ICommandState";
import {Field, IDataHook} from "model-react";
import {Resource} from "./dependencies/Resource";
import {ICommandMetadata} from "./_types/ICommandMetadata";
import {ICommand} from "./_types/ICommand";
import {applicationResource} from "./dependencies/applicationResource";

/**
 * A base class for commands
 */
export abstract class Command implements ICommand {
    public abstract metadata: ICommandMetadata;

    protected state = new Field("ready" as ICommandState);
    protected readonly dependencies = [applicationResource] as Resource[];
    protected queue = [] as {
        type: "execute" | "revert";
        promise: Promise<void>;
        resolve: () => void;
        reject: (error: any) => void;
        dependencies: Promise<() => void>;
    }[];

    /**
     * Executes the command
     * @returns A promise that resolves once execution finished
     */
    public async execute(): Promise<void> {
        return this.addQueue("execute");
    }

    /**
     * Reverts the command
     * @returns A promise that resolves once reverting finished
     */
    public async revert(): Promise<void> {
        return this.addQueue("revert");
    }

    /**
     * Adds a request to the queue
     * @param type The type of request to add
     * @returns The promise that resolves once the request is handled
     */
    protected addQueue(type: "execute" | "revert"): Promise<void> {
        let resolve = () => {};
        let reject = () => {};
        const promise = new Promise<void>((res, rej) => {
            resolve = res;
            reject = rej;
        });
        this.queue.push({
            type,
            promise,
            resolve,
            reject,
            dependencies: this.acquireDependencies(),
        });
        if (this.queue.length == 1 && ["ready", "executed"].includes(this.getState()))
            this.dispatch();
        return promise;
    }

    /**
     * Dispatches another execute or revert request if any remain
     */
    protected async dispatch() {
        const first = this.queue.shift();
        if (!first) return;
        let error;
        if (first.type == "execute") {
            if (this.getState() != "executed") {
                this.state.set("preparingForExecution");
                const releasers = await first.dependencies;
                this.state.set("executing");
                try {
                    await this.onExecute();
                } catch (e) {
                    error = e;
                }
                releasers();
                this.state.set("executed");
            } else first.dependencies.then(releasers => releasers());
        } else {
            if (this.getState() != "ready") {
                this.state.set("preparingForRevert");
                const releasers = await first.dependencies;
                this.state.set("reverting");
                try {
                    await this.onRevert();
                } catch (e) {
                    error = e;
                }
                releasers();
                this.state.set("ready");
            } else first.dependencies.then(releasers => releasers());
        }
        if (error) first.reject(error);
        else first.resolve();
        this.dispatch();
    }

    /**
     * Acquires the dependencies
     * @returns A function that can be used to release the dependencies
     */
    protected async acquireDependencies(): Promise<() => void> {
        /*
            Since we are performing a hold and wait operation,
            there is a chance of things deadlocking. 
            We can't wait for all resources to be available at once however,
            since the command execution order depends on the dependency claim order.

            If a deadlock occurs, this should be solved by claiming the dependencies in the same order. 
            There doesn't seem to be a much better solution without making things massively complex.
        */

        // Acquire the dependencies
        let releasers = await Promise.all(
            this.dependencies.map(dependency => dependency.acquire())
        );
        return () => releasers.forEach(release => release());
    }

    /**
     * Retrieves the state of the command
     * @param hook The hook to subscribe to changes
     * @returns The state of the command
     */
    public getState(hook: IDataHook = null): ICommandState {
        return this.state.get(hook);
    }

    /** The code to call on execute */
    protected abstract onExecute(): Promise<void>;
    /** The code to call on revert */
    protected abstract onRevert(): Promise<void>;
}
