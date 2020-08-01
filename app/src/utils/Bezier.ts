import {IPoint} from "./_types/IPoint";

/**
 * Adds a number of points together
 * @param points The points to add
 * @returns The resulting point
 */
export function add(...points: IPoint[]): IPoint {
    const p = {x: 0, y: 0};
    points.forEach(({x, y}) => {
        p.x += x;
        p.y += y;
    });
    return p;
}

/**
 * Multiplies a point by a given amount
 * @param point The point to scale
 * @returns The resulting point
 */
export function mul(point: IPoint, amount: number): IPoint {
    return {
        x: point.x * amount,
        y: point.y * amount,
    };
}

/**
 * A simple class with some bezier curve utilities
 */
export class Bezier {
    public p1: IPoint;
    public p2: IPoint;
    public p3: IPoint;
    public p4: IPoint;

    /**
     * Creates a new bezier curve with the given points
     * @param p1 The start point
     * @param p2 The first direction point
     * @param p3 The second direction point
     * @param p4 The end point
     */
    public constructor(p1: IPoint, p2: IPoint, p3: IPoint, p4: IPoint) {
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        this.p4 = p4;
    }

    // Bezier utilities

    /**
     * Retrieves a point on the bezier curve
     * @param time The fraction on the line (0 to 1)
     * @returns The point at this time
     */
    public getPoint(time: number): IPoint {
        const t = time;
        const n = 1 - t;
        return add(
            mul(this.p1, t * t * t),
            mul(this.p2, t * t * n),
            mul(this.p3, t * n * n),
            mul(this.p4, n * n * n)
        );
    }

    /**
     * Splits 1 bezier into 2 parts
     * @param time The time at which to spit the curve
     * @returns Two bezier representing the part before and after the given time
     */
    public split(time: number): [Bezier, Bezier] {
        const t = time;
        const n = 1 - t;
        const p12 = add(mul(this.p1, n), mul(this.p2, t));
        const p23 = add(mul(this.p2, n), mul(this.p3, t));
        const p34 = add(mul(this.p3, n), mul(this.p4, t));
        const p123 = add(mul(p12, n), mul(p23, t));
        const p234 = add(mul(p23, n), mul(p34, t));
        const p1234 = add(mul(p123, n), mul(p234, t)); // (equivalent to getPoint(t))

        return [
            new Bezier(this.p1, p12, p123, p1234),
            new Bezier(p1234, p234, p34, this.p4),
        ];
    }
}
