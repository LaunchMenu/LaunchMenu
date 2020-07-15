import React, {FC, useState, useCallback} from "react";
import {IIdentifiedItem} from "../stacks/_types/IIdentifiedItem";
import {IViewStackItem} from "../stacks/_types/IViewStackItem";
import {StackView} from "../components/stacks/StackView";
import {Box} from "../styling/box/Box";
import {v4 as uuid} from "uuid";
import {FillBox} from "../components/FillBox";
import {PrimaryButton} from "@fluentui/react";
import {ViewStack} from "../stacks/ViewStack";

const urls = [
    "https://images.unsplash.com/photo-1542261777448-23d2a287091c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1000&q=80",
    "https://i.pinimg.com/originals/db/a3/9b/dba39ba9a356d0fdc5b085ec4465c7e4.jpg",
    "https://images.hdqwalls.com/download/swan-digital-art-4k-bg-2932x2932.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpkMaxrwdeNtjpyWAacApPblYkbt5lRynaypa19A2wznq9edc&s",
];
const opacities = [0.5, 0.8, 1];
const getRandomItem = () => {
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
                <StackView items={stack} />
            </Box>
            <PrimaryButton onClick={add}>add</PrimaryButton>
            <PrimaryButton onClick={remove}>remove</PrimaryButton>
            <PrimaryButton onClick={change}>change</PrimaryButton>
            <PrimaryButton onClick={addM}>add middle</PrimaryButton>
            <PrimaryButton onClick={removeM}>remove middle</PrimaryButton>
            <PrimaryButton onClick={changeM}>change middle</PrimaryButton>
        </Box>
    );
};
