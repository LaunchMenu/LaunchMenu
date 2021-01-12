import Color from "color";
import {Field, IDataHook} from "model-react";
import {IField} from "../../../../../_types/IField";

/**
 * A color object where each field can be altered and subscribed to
 */
export class AlterableColor extends Field<Color> {
    /** Red */
    public r = {
        get: h => this.get(h).red(),
        set: r => this.set(new Color([r, this.get().green(), this.get().blue()])),
    } as IField<number>;
    /** Green */
    public g = {
        get: h => this.get(h).green(),
        set: g => this.set(new Color([this.get().red(), g, this.get().blue()])),
    } as IField<number>;
    /** Blue */
    public b = {
        get: h => this.get(h).blue(),
        set: b => this.set(new Color([this.get().red(), this.get().green(), b])),
    } as IField<number>;
    /** Hue */
    public h = {
        get: h => this.get(h).hue(),
        set: h => this.set(Color.hsv([h, this.get().saturationv(), this.get().value()])),
    } as IField<number>;
    /** Saturation */
    public s = {
        get: h => this.get(h).saturationv(),
        set: s => this.set(Color.hsv([this.get().hue(), s, this.get().value()])),
    } as IField<number>;
    /** Value */
    public v = {
        get: h => this.get(h).value(),
        set: v => this.set(Color.hsv([this.get().hue(), this.get().saturationv(), v])),
    } as IField<number>;

    /**
     * Creates a new alterable color
     * @param color The color to create fields for
     */
    public constructor(color: string | [number, number, number] | Color) {
        super(new Color(color));
    }

    /**
     * Retrieves the current color
     * @param hook The hook to subscribe to changes
     * @returns The color
     */
    public get(hook?: IDataHook): Color {
        return this.get(hook);
    }
}
