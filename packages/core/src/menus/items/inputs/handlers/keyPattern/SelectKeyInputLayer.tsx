import {globalKeyHandler} from "../../../../../keyHandler/globalKeyHandler/globalKeyHandler";
import {ITextField} from "../../../../../textFields/_types/ITextField";
import {UILayer} from "../../../../../uiLayers/standardUILayer/UILayer";
import {createKeyPatternFieldKeyHandler} from "./createKeyPatternFieldKeyHandler";

/** A UI Layer to handle key inputs */
export class SelectKeyInputLayer extends UILayer {
    protected textField: ITextField;
    protected onClose: () => void;
    protected globalShortcut: boolean;

    /**
     * Creates a layer that can be used to select key combinations
     */
    public constructor({
        textField,
        onClose,
        globalShortcut,
    }: {
        /** The textfield to set the pattern in */
        textField: ITextField;
        /** The callback to perform  when closing the layer */
        onClose: () => void;
        /** Whether to shortcut to store should be a global shortcut */
        globalShortcut?: boolean;
    }) {
        if (!globalShortcut || !globalKeyHandler.areListenersSupported())
            super((context, close) => ({
                field: textField,
                fieldHandler: createKeyPatternFieldKeyHandler(textField, () => {
                    close();
                    onClose();
                }),
            }));
        else
            super((context, close) => {
                const removeListener = globalKeyHandler.addListener(event => {});

                return {
                    onClose: () => {
                        removeListener();
                    },
                };
            });
    }
}
