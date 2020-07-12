import React, {FC, useEffect} from "react";
import {KeyHandler} from "../stacks/keyHandlerStack/KeyHandler";
import {KeyHandlerStack} from "../stacks/keyHandlerStack/KeyHandlerStack";

export const KeyHandlerTest: FC = () => {
    useEffect(() => {
        const handler = new KeyHandler(document);
        const stack = new KeyHandlerStack(handler);
        stack.push(e => {
            console.log(e);
        });
        stack.push(e => {
            if (e.down && (e.key.id == 13 || e.key.name == "esc")) {
                console.log("Enter");
                return true;
            }
        });
        stack.push(
            new KeyHandlerStack([
                e => {
                    if (e.down && e.key.name == "esc") {
                        console.log("Escaped");
                        return true;
                    }
                },
            ])
        );
        return () => handler.destroy();
    });
    return <div>hoi</div>;
};
