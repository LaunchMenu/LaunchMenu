import {Command} from "../Command";

export class EmptyCommand extends Command {
    public metadata = {
        name: "Empty Command",
    };
    protected async onExecute() {}
    protected async onRevert() {}
}
