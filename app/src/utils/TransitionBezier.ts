import Bezier from "bezier-js";

/**
 * A simple bezier curve wrapper that can be used for transitions (x axis represents time)
 */
export class TransitionBezier {
    protected bezier: Bezier;
    protected start: number;
    protected duration: number;

    /**
     * Creates a new transition bezier curve with the given easing
     * @param data The transition data
     */
    public constructor({
        bezier,
        start = 0,
        duration,
        inEase = 0.5,
        outEase = 0.5,
    }: {
        /** A custom bezier to use */
        bezier?: Bezier;
        /** The start time of the transition */
        start?: number;
        /** The duration of the transition */
        duration: number;
        /** The amount of easing into the transition (0-1) */
        inEase?: number;
        /** The amount of easing out of the transition (0-1) */
        outEase?: number;
    }) {
        this.bezier =
            bezier ||
            new Bezier(
                {x: 0, y: 0},
                {x: inEase, y: 0},
                {x: 1 - outEase, y: 1},
                {x: 1, y: 1}
            );
        this.duration = duration;
        this.start = start;
    }

    /**
     * Retrieves the value for the given time
     * @param time The time
     * @returns The value
     */
    public get(time: number): number {
        if (time < this.start) return 0;
        if (time > this.start + this.duration) return 1;
        return this.bezier.get((time - this.start) / this.duration).y;
    }

    /**
     * Creates a new bezier that branches from this bezier with the same velocity
     * @param time The time to branch at
     * @param data The new bezier data
     * @returns The created bezier
     */
    public branch(
        time: number,
        data: {
            /** The start time of the transition */
            start?: number;
            /** The duration of the transition */
            duration: number;
            /** The amount of easing out of the transition (0-1) */
            outEase?: number;
        }
    ): TransitionBezier {
        time -= this.start;
        const bezier = this.bezier.split(time / this.duration).right;
        const [p1, p2] = bezier.points;
        return new TransitionBezier({
            bezier: new Bezier(
                {x: 0, y: 0},
                {x: p2.x - p1.x, y: p2.y - p1.y},
                {x: 1 - (data?.outEase || 0.5), y: 1},
                {x: 1, y: 1}
            ),
            ...data,
        });
    }
}
