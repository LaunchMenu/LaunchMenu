/** Whether we are in dev mode */
declare const DEV: boolean;

declare module NodeJS {
    interface Global {
        /** Whether we are in dev mode */
        DEV: boolean;
    }
}
