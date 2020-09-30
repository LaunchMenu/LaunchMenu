import {IIOContext} from "./_types/IIOContext";
import {IViewStack} from "../stacks/viewStack/_types/IViewStack";
import {IKeyHandlerStack} from "../stacks/keyHandlerStack/_types/IKeyHandlerStack";
import {ViewStack} from "../stacks/viewStack/ViewStack";
import {KeyHandlerStack} from "../stacks/keyHandlerStack/KeyHandlerStack";
import {withRemoveError} from "./withRemoveError";
import {openUI} from "./openUI/openUI";
import {IOpenableUI} from "./_types/IOpenableUI";
import {IUndoRedoFacility} from "../undoRedo/_types/IUndoRedoFacility";
import {SettingsContext} from "../settings/SettingsContext";
import {ISubscribable} from "../utils/subscribables/_types/ISubscribable";
import {IContextMenuItemGetter} from "../menus/actions/contextAction/_types/IContextMenuItemGetter";

export class IOContext implements IIOContext {
    public panes: {
        menu: IViewStack;
        content: IViewStack;
        field: IViewStack;
    };
    public keyHandler: IKeyHandlerStack;
    public undoRedo: IUndoRedoFacility;
    public settings: SettingsContext;
    public contextMenuItems: ISubscribable<IContextMenuItemGetter[]>;

    protected parentContext?: IIOContext;

    /**
     * Creates a new context
     * @param context The context data
     * @param copy If set to true it simply copies the context, if set to false or left out it creates substacks
     */
    public constructor(context: IIOContext, copy?: boolean) {
        if (copy) {
            this.panes = context.panes;
            this.keyHandler = context.keyHandler;
        } else {
            this.parentContext = context;

            // Create the new stacks
            this.panes = {
                menu: new ViewStack(),
                content: new ViewStack(),
                field: new ViewStack(),
            };
            this.keyHandler = new KeyHandlerStack();

            // Push them to the passed stacks
            context.panes.menu.push(this.panes.menu);
            context.panes.content.push(this.panes.content);
            context.panes.field.push(this.panes.field);
            context.keyHandler.push(this.keyHandler);

            // Copy anything that's identical
            this.undoRedo = context.undoRedo;
            this.settings = context.settings;
            this.contextMenuItems = context.contextMenuItems;
        }
    }

    /**
     * Destroys the context, removing it from its parent context if created from a parent
     */
    public destroy(): void {
        const pc = this.parentContext;
        if (pc) {
            // Create popping functions for all stacks
            const pops = [
                () => withRemoveError(pc.panes.menu.pop(this.panes.menu), "menu"),
                () =>
                    withRemoveError(pc.panes.content.pop(this.panes.content), "content"),
                () => withRemoveError(pc.panes.field.pop(this.panes.field), "field"),
                () => withRemoveError(pc.keyHandler.pop(this.keyHandler), "key handler"),
            ];

            // Execute all popping functions and return the first error if any
            const errors = pops
                .map(f => {
                    try {
                        f();
                    } catch (e) {
                        return e;
                    }
                })
                .filter(e => e);
            if (errors.length > 0) throw errors[0];
        }
    }

    /**
     * Opens the given content within the given ui context
     * @param content The content to be opened
     * @param onClose A callback that gets triggered when the opened UI gets closed
     * @returns A function to close the opened content, returns false if it was already closed
     */
    public openUI(content: IOpenableUI, onClose?: () => void): () => boolean {
        return openUI(this, content, onClose);
    }
}
