export type IKeyHandlerTarget = {
    addEventListener(
        type: "keydown" | "keyup",
        listener: (event: KeyboardEvent) => void
    ): void;

    removeEventListener(
        type: "keydown" | "keyup",
        listener: (event: KeyboardEvent) => void
    ): void;
};
