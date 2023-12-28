import V2 from '../geometry/v2';

export default class TilemapHelper {
    public static raycast(v0: V2, v1: V2, isTerminatePoint: (pos: V2) => boolean): V2[]
        {
            var x0 = v0.x;
            var y0 = v0.y;
            var x1 = v1.x;
            var y1 = v1.y;

            var steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
            if (steep)
            {
                var temp = x0;
                x0 = y0;
                y0 = temp;

                temp = x1;
                x1 = y1;
                y1 = temp;
            }

            var xstep = (x0 < x1) ? 1 : -1;

            var dx: number = Math.abs(x1 - x0);
            var dy: number = Math.abs(y1 - y0);
            var error: number = Math.round(Math.abs(dx)  / 2);
            var ystep: number = (y0 < y1) ? 1 : -1;
            var y: number = y0;
            var result: V2[] = [];
            for (var x: number = x0; x * xstep <= x1 * xstep; x+= xstep)
            {
                var point = new V2(steep ? y : x, steep ? x : y);
                result.push(point);
                if (x != x0 && isTerminatePoint(point))
                {
                    break;
                }
                error -= dy;
                if (error < 0)
                {
                    y += ystep;
                    error += dx;
                }
            }
            return result;
        }

    public static getCircle(center: V2, radius: number): V2[] {
        var result: V2[] = [];
        var xc = center.x;
        var yc = center.y;

        var x = 0;
        var y = radius;
        var d = 3 - 2 * y;
        while (x <= y) {
            result = result.concat(this.octantPoints(x, y, xc, yc));
            if (d < 0)
            {
                d = d + 4 * x + 6;
            }
            else
            {
                d = d + 4 * (x - y) + 10;
                --y;
                result = result.concat(this.octantPoints(x, y, xc, yc));
            }
            x++;
        }
        return result;
    }

    private static octantPoints(x: number, y: number, xc: number, yc: number): V2[]{
        return [
        new V2(x + xc, y + yc),
        new V2(x + xc, -y + yc),
        new V2(-x + xc, -y + yc),
        new V2(-x + xc, y + yc),
        new V2(y + xc, x + yc),
        new V2(y + xc, -x + yc),
        new V2(-y + xc, -x + yc),
        new V2(-y + xc, x + yc)
        ];
    }
}