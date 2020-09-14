import React, {FC, useState, useRef, useCallback} from "react";
import {Box} from "../styling/box/Box";
import {FillBox} from "../components/FillBox";
import {SlideOpenTransition} from "../components/stacks/transitions/open/SlideOpenTransition";
import {Transition} from "../components/stacks/transitions/Transition";
import {IOpenTransition} from "../components/stacks/transitions/open/_types/IOpenTransition";

const OpenDown: IOpenTransition = props => (
    <SlideOpenTransition direction="down" {...props} />
);

export const TransitionTest: FC = () => {
    const count = useRef(0);
    const [id, forceUpdate] = useState(0);
    const [el, setEl] = useState(undefined as undefined | JSX.Element);
    const click = useCallback(e => {
        const c = count.current;
        if (c == 0) {
            setEl(<FillBox background="bgPrimary">Hoi</FillBox>);
        } else if (c == 1) {
            setEl(
                <FillBox background="primary" color="fontPrimary">
                    Poop
                </FillBox>
            );
        } else if (c == 2) {
            setEl(<FillBox background="bgTertiary">Potatoes</FillBox>);
        } else if (c == 3) {
            setEl(undefined);
        }
        count.current++;
    }, []);

    return (
        <div>
            <Box
                width={300}
                height={300}
                position={"relative"}
                onClick={click}
                onMouseDown={e => e.preventDefault()}>
                <FillBox background="bgTertiary">Hallo I am the background here</FillBox>
                <Transition
                    OpenTransitionComp={OpenDown}
                    key={id}
                    onClose={() => {
                        console.log("closed");
                        count.current = 0;
                        forceUpdate(i => i + 1);
                    }}>
                    {el}
                </Transition>
            </Box>
        </div>
    );
};
