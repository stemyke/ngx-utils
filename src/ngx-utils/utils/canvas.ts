import {CanvasColor} from "../common-types";
import {ObjectUtils} from "./object.utils";

declare const netscape: any;

class BlurStack {
    r: number = 0;
    g: number = 0;
    b: number = 0;
    a: number = 0;
    next: BlurStack = null;
}

const mul_table = [
    512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512,
    454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512,
    482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456,
    437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512,
    497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328,
    320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456,
    446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335,
    329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512,
    505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405,
    399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328,
    324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271,
    268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456,
    451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388,
    385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335,
    332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292,
    289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];

const shg_table = [
    9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17,
    17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19,
    19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
    20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
    21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
    21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
    22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
    22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];

export function drawRect(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.beginPath();
    ctx.rect(-w / 2, -h / 2, w, h);
    ctx.closePath();
}

export function drawOval(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.beginPath();
    ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.closePath();
}

export function drawPoint(ctx: CanvasRenderingContext2D): void {
    drawOval(ctx, 4, 4);
}

export class CanvasUtils {

    static manipulatePixels(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, colorTransformer: (color: CanvasColor, greyscale?: number) => CanvasColor): void {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imgData.data;
        for (let i = 0, n = pixels.length; i < n; i += 4) {
            const clr = new CanvasColor(pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3]);
            const greyscale = clr.r * .3 + clr.g * .59 + clr.b * .11;
            const color = colorTransformer(clr, greyscale);
            pixels[i] = color.r;
            pixels[i + 1] = color.g;
            pixels[i + 2] = color.b;
            pixels[i + 3] = color.a;
        }
        ctx.putImageData(imgData, 0, 0);
    }

    static thresholding(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, threshold: number = 50, colorTransformer: (color: CanvasColor, limit: boolean, greyscale?: number) => CanvasColor): void {
        const min = new CanvasColor(0, 0, 0, 255);
        const max = new CanvasColor(0, 0, 0, 0);
        colorTransformer = ObjectUtils.isFunction(colorTransformer) ? colorTransformer : ((color: CanvasColor, limit: boolean): CanvasColor => {
            return limit ? max : min;
        });
        CanvasUtils.manipulatePixels(canvas, ctx, (color, greyscale) => {
            return colorTransformer(color, greyscale > threshold, greyscale);
        });
    }

    static stackBlur(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, radius: number = 10): void {
        if (isNaN(radius) || radius < 1) return;
        radius |= 0;

        const top_x = 0;
        const top_y = 0;
        const width = canvas.width;
        const height = canvas.height;

        let imageData = null;

        try {
            try {
                imageData = ctx.getImageData(top_x, top_y, width, height);
            } catch (e) {

                // NOTE: this part is supposedly only needed if you want to work with local files
                // so it might be okay to remove the whole try/catch block and just use
                // imageData = ctx.getImageData( top_x, top_y, width, height );
                try {
                    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
                    imageData = ctx.getImageData(top_x, top_y, width, height);
                } catch (e) {
                    alert("Cannot access local image");
                    throw new Error("unable to access local image data: " + e);
                }
            }
        } catch (e) {
            alert("Cannot access image");
            throw new Error("unable to access image data: " + e);
        }

        const pixels = imageData.data;

        let x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum,
            r_out_sum, g_out_sum, b_out_sum, a_out_sum,
            r_in_sum, g_in_sum, b_in_sum, a_in_sum,
            pr, pg, pb, pa, rbs;

        const div = radius + radius + 1;
        const widthMinus1 = width - 1;
        const heightMinus1 = height - 1;
        const radiusPlus1 = radius + 1;
        const sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;

        const stackStart = new BlurStack();
        let stackEnd = null;
        let stack = stackStart;

        for (i = 1; i < div; i++) {
            stack = stack.next = new BlurStack();
            if (i == radiusPlus1) {
                stackEnd = stack;
            }
        }
        stack.next = stackStart;
        let stackIn = null;
        let stackOut = null;

        yw = yi = 0;

        const mul_sum = mul_table[radius];
        const shg_sum = shg_table[radius];

        for (y = 0; y < height; y++) {
            r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;

            r_out_sum = radiusPlus1 * (pr = pixels[yi]);
            g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
            b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
            a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);

            r_sum += sumFactor * pr;
            g_sum += sumFactor * pg;
            b_sum += sumFactor * pb;
            a_sum += sumFactor * pa;

            stack = stackStart;

            for (i = 0; i < radiusPlus1; i++) {
                stack.r = pr;
                stack.g = pg;
                stack.b = pb;
                stack.a = pa;
                stack = stack.next;
            }

            for (i = 1; i < radiusPlus1; i++) {
                p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
                r_sum += (stack.r = (pr = pixels[p])) * (rbs = radiusPlus1 - i);
                g_sum += (stack.g = (pg = pixels[p + 1])) * rbs;
                b_sum += (stack.b = (pb = pixels[p + 2])) * rbs;
                a_sum += (stack.a = (pa = pixels[p + 3])) * rbs;

                r_in_sum += pr;
                g_in_sum += pg;
                b_in_sum += pb;
                a_in_sum += pa;

                stack = stack.next;
            }


            stackIn = stackStart;
            stackOut = stackEnd;
            for (x = 0; x < width; x++) {
                pixels[yi + 3] = pa = (a_sum * mul_sum) >> shg_sum;
                if (pa != 0) {
                    pa = 255 / pa;
                    pixels[yi] = ((r_sum * mul_sum) >> shg_sum) * pa;
                    pixels[yi + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
                    pixels[yi + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
                } else {
                    pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
                }

                r_sum -= r_out_sum;
                g_sum -= g_out_sum;
                b_sum -= b_out_sum;
                a_sum -= a_out_sum;

                r_out_sum -= stackIn.r;
                g_out_sum -= stackIn.g;
                b_out_sum -= stackIn.b;
                a_out_sum -= stackIn.a;

                p = (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;

                r_in_sum += (stackIn.r = pixels[p]);
                g_in_sum += (stackIn.g = pixels[p + 1]);
                b_in_sum += (stackIn.b = pixels[p + 2]);
                a_in_sum += (stackIn.a = pixels[p + 3]);

                r_sum += r_in_sum;
                g_sum += g_in_sum;
                b_sum += b_in_sum;
                a_sum += a_in_sum;

                stackIn = stackIn.next;

                r_out_sum += (pr = stackOut.r);
                g_out_sum += (pg = stackOut.g);
                b_out_sum += (pb = stackOut.b);
                a_out_sum += (pa = stackOut.a);

                r_in_sum -= pr;
                g_in_sum -= pg;
                b_in_sum -= pb;
                a_in_sum -= pa;

                stackOut = stackOut.next;

                yi += 4;
            }
            yw += width;
        }


        for (x = 0; x < width; x++) {
            g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;

            yi = x << 2;
            r_out_sum = radiusPlus1 * (pr = pixels[yi]);
            g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
            b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
            a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);

            r_sum += sumFactor * pr;
            g_sum += sumFactor * pg;
            b_sum += sumFactor * pb;
            a_sum += sumFactor * pa;

            stack = stackStart;

            for (i = 0; i < radiusPlus1; i++) {
                stack.r = pr;
                stack.g = pg;
                stack.b = pb;
                stack.a = pa;
                stack = stack.next;
            }

            yp = width;

            for (i = 1; i <= radius; i++) {
                yi = (yp + x) << 2;

                r_sum += (stack.r = (pr = pixels[yi])) * (rbs = radiusPlus1 - i);
                g_sum += (stack.g = (pg = pixels[yi + 1])) * rbs;
                b_sum += (stack.b = (pb = pixels[yi + 2])) * rbs;
                a_sum += (stack.a = (pa = pixels[yi + 3])) * rbs;

                r_in_sum += pr;
                g_in_sum += pg;
                b_in_sum += pb;
                a_in_sum += pa;

                stack = stack.next;

                if (i < heightMinus1) {
                    yp += width;
                }
            }

            yi = x;
            stackIn = stackStart;
            stackOut = stackEnd;
            for (y = 0; y < height; y++) {
                p = yi << 2;
                pixels[p + 3] = pa = (a_sum * mul_sum) >> shg_sum;
                if (pa > 0) {
                    pa = 255 / pa;
                    pixels[p] = ((r_sum * mul_sum) >> shg_sum) * pa;
                    pixels[p + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
                    pixels[p + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
                } else {
                    pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
                }

                r_sum -= r_out_sum;
                g_sum -= g_out_sum;
                b_sum -= b_out_sum;
                a_sum -= a_out_sum;

                r_out_sum -= stackIn.r;
                g_out_sum -= stackIn.g;
                b_out_sum -= stackIn.b;
                a_out_sum -= stackIn.a;

                p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width)) << 2;

                r_sum += (r_in_sum += (stackIn.r = pixels[p]));
                g_sum += (g_in_sum += (stackIn.g = pixels[p + 1]));
                b_sum += (b_in_sum += (stackIn.b = pixels[p + 2]));
                a_sum += (a_in_sum += (stackIn.a = pixels[p + 3]));

                stackIn = stackIn.next;

                r_out_sum += (pr = stackOut.r);
                g_out_sum += (pg = stackOut.g);
                b_out_sum += (pb = stackOut.b);
                a_out_sum += (pa = stackOut.a);

                r_in_sum -= pr;
                g_in_sum -= pg;
                b_in_sum -= pb;
                a_in_sum -= pa;

                stackOut = stackOut.next;

                yi += width;
            }
        }

        ctx.putImageData(imageData, top_x, top_y);
    }

    static measureTextFontSize(maxWidth: number, maxHeight: number, lines: string[], font: string, lineHeightPercent: number = 1.1, canvas?: HTMLCanvasElement): number {

        const startSize: number = maxHeight;
        const context: CanvasRenderingContext2D = canvas.getContext("2d");

        if (!canvas) {
            canvas = <HTMLCanvasElement>document.createElement("canvas");
            document.body.appendChild(canvas);
        }

        canvas.width = maxWidth + maxHeight;
        canvas.height = maxHeight * 2;

        let fontSize: number = CanvasUtils.halveValidateFontSize(startSize, (size: number) => {
            CanvasUtils.setFontProps(context, font, size);
            const maxTextLinesWidth = CanvasUtils.getTextWidth(context, lines);
            return maxWidth - maxTextLinesWidth;
        });

        const bitmapHeight: number = CanvasUtils.getTextBitmapHeight(canvas, context, lines, font, fontSize, lineHeightPercent);
        if (bitmapHeight > maxHeight) {
            fontSize = CanvasUtils.halveValidateFontSize(fontSize, (size: number) => {
                return maxHeight - CanvasUtils.getTextBitmapHeight(canvas, context, lines, font, size, lineHeightPercent);
            });
        }

        return fontSize;
    }

    static drawLines(context: CanvasRenderingContext2D, lines: string[], font: string, size: number, lineHeightPercent: number = 1.1, align: string = "left", baseLine: string = "top", x: number = 0, y: number = 0): number {
        CanvasUtils.setFontProps(context, font, size, align, baseLine);
        for (let i: number = 0; i < lines.length; i++) {
            const line: string = lines[i];
            context.fillText(line, x, y);
            if (i < lines.length - 1) {
                y += size * lineHeightPercent;
            }
        }
        return y;
    }

    static wrapText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number): void {
        const words = text.split(" ");
        const lineHeight = context.measureText("M").width * 1.3;
        const lines: string[] = [];
        let line = "";
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + " ";
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                lines.push(line);
                line = words[n] + " ";
            }
            else {
                line = testLine;
            }
        }
        lines.push(line);
        y -= lineHeight * .5 * lines.length;
        lines.forEach(l => {
            context.fillText(l, x, y);
            y += lineHeight;
        });
    }

    static setFontProps(context: CanvasRenderingContext2D, font: string, fontSize: number, align: string = "left", baseLine: string = "top"): void {
        context.font = `${fontSize}px ${font}`;
        context.textAlign = <any>align;
        context.textBaseline = <any>baseLine;
    }

    private static getTextWidth(context: CanvasRenderingContext2D, lines: string[]): number {
        let maxWidth: number = 0;
        for (let i: number = 0; i < lines.length; i++) {
            const line: string = lines[i];
            maxWidth = Math.max(maxWidth, context.measureText(line).width);
        }
        return maxWidth;
    }

    private static getTextBitmapHeight(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, lines: string[], font: string, fontSize: number, lineHeightPercent: number): number {
        const width: number = canvas.width;
        const height: number = canvas.height;
        context.clearRect(0, 0, width, height);

        const textY = CanvasUtils.drawLines(context, lines, font, fontSize, lineHeightPercent, "left", "top", fontSize * .5, fontSize * .5);
        const imageData: ImageData = context.getImageData(0, 0, width, height);

        let textHeight: number = 0;

        yLoop:for (let y: number = 0; y < height; y++) {
            for (let x: number = 0; x < width; x++) {
                const index: number = (x + y * width) * 4;
                if (imageData.data[index + 3] > 0) {
                    textHeight = y + 1;
                    continue yLoop;
                }
            }
        }

        return Math.max(textHeight, textY + fontSize);
    }

    private static halveValidateFontSize(startSize: number, callback: (size: number) => number): number {
        let fontSize: number = startSize;
        let lastFontSize: number = 0;
        let direction: number;

        for (let i: number = 0; i < 20; i++) {
            direction = callback(fontSize);
            const tempSize: number = fontSize;
            if (direction < 0) {
                fontSize = fontSize - (Math.abs(fontSize - lastFontSize) / 2);
            } else {
                fontSize = fontSize + (Math.abs(fontSize - lastFontSize) / 2);
            }
            lastFontSize = tempSize;
            if (Math.abs(fontSize - lastFontSize) < 0.1) {
                break;
            }
        }
        fontSize = Math.floor(fontSize);
        return fontSize;
    }
}
