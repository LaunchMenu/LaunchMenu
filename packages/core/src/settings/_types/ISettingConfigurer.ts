export type ISettingConfigurer = {
    /** A function to configure the setting with outside data */
    configure?: {
        /**
         * Passes data that can be used to configure the setting
         * @param data The data to extract the configuration out of
         */
        (data: Record<symbol, any>): void;
    };
};
