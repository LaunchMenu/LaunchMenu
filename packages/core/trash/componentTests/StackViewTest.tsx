import React, {FC, useState, useCallback} from "react";
import {IIdentifiedItem} from "../../src/stacks/_types/IIdentifiedItem";
import {StackView} from "../../src/components/stacks/StackView";
import {Box} from "../../src/styling/box/Box";
import {v4 as uuid} from "uuid";
import {FillBox} from "../../src/components/FillBox";
import {ViewStack} from "../../src/stacks/viewStack/ViewStack";
import {InstantOpenTransition} from "../../src/components/stacks/transitions/open/InstantOpenTransition";
import {InstantCloseTransition} from "../../src/components/stacks/transitions/close/InstantCloseTransition";
import {InstantChangeTransition} from "../../src/components/stacks/transitions/change/InstantChangeTransition";

const urls = [
    "https://images.unsplash.com/photo-1542261777448-23d2a287091c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1000&q=80",
    "https://i.pinimg.com/originals/db/a3/9b/dba39ba9a356d0fdc5b085ec4465c7e4.jpg",
    "https://images.hdqwalls.com/download/swan-digital-art-4k-bg-2932x2932.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpkMaxrwdeNtjpyWAacApPblYkbt5lRynaypa19A2wznq9edc&s",
];
const opacities = [0.5, 0.8, 1];
const getRandomItem = (instant: boolean = false) => {
    const url = urls[Math.floor(Math.random() * urls.length)];
    const opacity = opacities[Math.floor(Math.random() * opacities.length)];

    return {
        id: uuid(),
        value: {
            view: (
                <FillBox
                    css={{
                        backgroundImage: `url(${url})`,
                        backgroundSize: "cover",
                        opacity: opacity,
                    }}></FillBox>
            ),
            transparent: opacity < 1,
            transitions: instant
                ? {
                      Open: InstantOpenTransition,
                      Close: InstantCloseTransition,
                      Change: InstantChangeTransition,
                  }
                : undefined,
        },
    };
};

const stack = new ViewStack();
export const StackViewTest: FC = () => {
    const add = useCallback(() => stack.push(getRandomItem()), []);
    const remove = useCallback(() => stack.pop(), []);
    const change = useCallback(() => {
        stack.pop();
        stack.push(getRandomItem());
    }, []);
    const addInstant = useCallback(() => stack.push(getRandomItem(true)), []);
    const changeInstant = useCallback(() => {
        stack.pop();
        stack.push(getRandomItem(true));
    }, []);
    const addM = useCallback(
        () => stack.insert(getRandomItem(), stack.get().length - 1),
        []
    );
    const removeM = useCallback(() => {
        const items = stack.get();
        if (items.length > 1) stack.remove(items[items.length - 2]);
    }, []);
    const changeM = useCallback(() => {
        removeM();
        addM();
    }, []);
    return (
        <Box>
            <Box
                width={300}
                height={300}
                position={"relative"}
                onMouseDown={e => e.preventDefault()}>
                <StackView stack={stack} />
            </Box>
            <button onClick={add}>add</button>
            <button onClick={remove}>remove</button>
            <button onClick={change}>change</button>
            <button onClick={addInstant}>add instant</button>
            <button onClick={changeInstant}>change instant</button>
            <button onClick={addM}>add middle</button>
            <button onClick={removeM}>remove middle</button>
            <button onClick={changeM}>change middle</button>
        </Box>
    );
};
