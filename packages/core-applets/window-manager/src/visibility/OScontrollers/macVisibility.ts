import {IVisibilityController} from "../_types/IVisibilityController";
import {remote} from "electron";

const macVisibilityController: IVisibilityController = {
    init() {},
    show(window) {
        // https://stackoverflow.com/a/60314425/8521718
        window.once("show", () => {
            setTimeout(() => {
                window.focus();
                window.moveTop();
            }, 200);
        });
        window.show();
    },
    hide(window) {
        window.hide();
        remote.app.hide();
    },
};
export default macVisibilityController;
