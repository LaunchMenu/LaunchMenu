import React, {FC, useState, useMemo, useRef, useCallback} from "react";
import {Box} from "./styling/box/Box";
import {SlideChangeTransition} from "./components/stacks/transitions/change/SlideChangeTransition";
import {FillBox} from "./components/FillBox";
import {SlideCloseTransition} from "./components/stacks/transitions/close/SlideCloseTransition";
import {SlideOpenTransition} from "./components/stacks/transitions/open/SlideOpenTransition";
import {Transition} from "./components/stacks/transitions/Transition";
import {IOpenTransition} from "./components/stacks/transitions/open/_types/IOpenTransition";

const TransitionTest: FC = () => {
    const [children, setChildren] = useState([
        <FillBox background="neutral9">shits</FillBox>,
        <FillBox background="neutral7">shits2</FillBox>,
    ]);

    return (
        <div>
            <Box
                width={300}
                height={300}
                position={"relative"}
                onClick={() => {
                    setChildren([
                        ...children,
                        <FillBox
                            background={
                                (["primary", "neutral9", "neutral4"] as const)[
                                    Math.floor(Math.random() * 3)
                                ]
                            }>
                            final
                        </FillBox>,
                    ]);
                }}>
                <SlideChangeTransition direction="right" duration={500}>
                    {children}
                </SlideChangeTransition>
            </Box>

            <Box width={300} height={300} position={"relative"}>
                <SlideCloseTransition direction="down">
                    <FillBox background="primary">shits</FillBox>
                </SlideCloseTransition>
            </Box>

            <Box width={300} height={300} position={"relative"}>
                <SlideOpenTransition direction="left">
                    <FillBox background="primary">shits</FillBox>
                </SlideOpenTransition>
            </Box>
        </div>
    );
};

const OpenDown: IOpenTransition = props => (
    <SlideOpenTransition direction="down" {...props} />
);

export const TransitionTest2: FC = () => {
    const count = useRef(0);
    const [id, forceUpdate] = useState(0);
    const [el, setEl] = useState(undefined as undefined | JSX.Element);
    const click = useCallback(e => {
        const c = count.current;
        if (c == 0) {
            setEl(<FillBox background="neutral9">Hoi</FillBox>);
        } else if (c == 1) {
            setEl(<FillBox background="neutral7">Poop</FillBox>);
        } else if (c == 2) {
            setEl(<FillBox background="neutral5">Potatoes</FillBox>);
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
                <FillBox background="neutral0" color="white">
                    Hallo I am the background here
                </FillBox>
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

export const TestComp: FC = () => {
    return <TransitionTest2 />;
};
