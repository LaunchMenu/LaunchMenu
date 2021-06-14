import {IVisibilityController} from "../_types/IVisibilityController";
import {remote} from "electron";

const windowsVisibilityController: IVisibilityController = {
    init(window) {},
    show(window) {
        if (window.isMinimized()) {
            // https://stackoverflow.com/a/60314425/8521718
            window.once("restore", () => {
                setTimeout(() => {
                    window.focus();
                    window.moveTop();
                }, 50);
            });
            window.restore();
        } else {
            // First time around, use the show method
            // https://stackoverflow.com/a/60314425/8521718
            window.once("show", () => {
                setTimeout(() => {
                    window.focus();
                    window.moveTop();
                }, 200);
            });
            window.show();
        }
    },
    hide(window) {
        window.minimize();
    },
};
export default windowsVisibilityController;
