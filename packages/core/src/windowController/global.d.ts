declare module "node-hmr" {
    const hmr: (
        callback: () => void,
        options?: {
            watchDir?: string;
            debug?: boolean;
            chokidar?: any; // TODO: add proper type
        }
    ) => void;
    export default hmr;
}
