import {Command} from "../Command";
import {wait} from "../../_tests/wait.helper";
import {Resource} from "../dependencies/Resource";

type TestCommandArgs = {
    onExecute?: () => Promise<void>;
    onRevert?: () => Promise<void>;
    duration?: number;
    dependencies?: Resource[];
};
export class TestCommand extends Command {
    protected data: TestCommandArgs;
    protected dependencies = [] as Resource[];
    public metadata = {
        name: "TestCommand",
    };

    public constructor(data: TestCommandArgs = {}) {
        super();
        this.data = data;
        if (data.dependencies) this.dependencies = data.dependencies;
    }
    public async onExecute() {
        if (this.data.onExecute) await this.data.onExecute();
        if (this.data.duration != 0) await wait(this.data.duration || 10);
    }
    public async onRevert() {
        if (this.data.onRevert) await this.data.onRevert();
        if (this.data.duration != 0) await wait(this.data.duration || 10);
    }
}
