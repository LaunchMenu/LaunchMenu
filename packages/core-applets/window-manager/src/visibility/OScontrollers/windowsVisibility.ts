import {IVisibilityController} from "../_types/IVisibilityController";
import {remote} from "electron";

const windowsVisibilityController: IVisibilityController = {
    init(window) {},
    show(window) {
        if (window.isMinimized()) {
            window.once("restore", () => {
                window.focus();
                window.moveTop();
            });
            window.restore();
        } else {
            // First time around, use the show method
            // https://stackoverflow.com/a/60314425/8521718
            window.once("show", () => {
                window.focus();
                window.moveTop();
            });
            window.show();
        }

        // https://github.com/electron/electron/issues/12130#issuecomment-407306642
        setTimeout(() => {
            window.setOpacity(1);
        }, 50);
    },
    hide(window) {
        window.setOpacity(0);
        window.minimize();
    },
};
export default windowsVisibilityController;
