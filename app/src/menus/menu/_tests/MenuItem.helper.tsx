import React from "react";
import {IMenuItem} from "../../_types/IMenuItem";

export function createMenuItem(): IMenuItem {
    return {
        view: () => <div>hoi</div>,
        actionBindings: [],
    };
}
