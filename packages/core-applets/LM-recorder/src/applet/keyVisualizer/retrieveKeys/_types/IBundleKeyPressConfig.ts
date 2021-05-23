/** The config for the function that can bundle key presses */
export type IBundleKeyPressConfig = {
    /** How much key inactivity before hiding the overlay */
    duration?: number;
    /** How many characters are allowed in one batch */
    maxLength?: number;
    /** Whether to include typing sequences */
    includeTyping?: boolean;
};
