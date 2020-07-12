import React, {FC, useState, useCallback} from "react";
import {IIdentifiedItem} from "../stacks/_types/IIdentifiedItem";
import {IViewStackItem} from "../stacks/_types/IViewStackItem";
import {StackView} from "../components/stacks/StackView";
import {Box} from "../styling/box/Box";
import {v4 as uuid} from "uuid";
import {FillBox} from "../components/FillBox";
import {PrimaryButton} from "@fluentui/react";

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

export const StackViewTest: FC = () => {
    const [items, setItems] = useState([] as IIdentifiedItem<IViewStackItem>[]);
    const add = useCallback(() => setItems(items => [...items, getRandomItem()]), []);
    const remove = useCallback(
        () => setItems(items => items.slice(0, items.length - 1)),
        []
    );
    const change = useCallback(
        () => setItems(items => [...items.slice(0, items.length - 1), getRandomItem()]),
        []
    );
    const addM = useCallback(
        () =>
            setItems(items => [
                ...items.slice(0, items.length - 1),
                getRandomItem(),
                ...items.slice(items.length - 1),
            ]),
        []
    );
    const removeM = useCallback(
        () =>
            setItems(items => [
                ...items.slice(0, items.length - 2),
                ...items.slice(items.length - 1),
            ]),
        []
    );
    const changeM = useCallback(
        () =>
            setItems(items => [
                ...items.slice(0, items.length - 2),
                getRandomItem(),
                ...items.slice(items.length - 1),
            ]),
        []
    );
    return (
        <Box>
            <Box
                width={300}
                height={300}
                position={"relative"}
                onMouseDown={e => e.preventDefault()}>
                <StackView items={items} />
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
