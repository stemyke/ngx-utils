import * as FontFaceObserver from "fontfaceobserver";
import * as JsZip from "jszip";
import { saveAs } from "file-saver";
import {AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from "@angular/core";
import {ObjectUtils} from "../ngx-utils/utils/object.utils";
import {CanvasUtils, LoaderUtils, StringUtils, UniversalService} from "../public_api";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, AfterViewInit {

    text: string = "Tgéza\n" +
        "Tebgszt\n" +
        "gbéza\n" +
        "bélgja";
    multiplier: number = .1;
    manufacturing: any = {
        left: {
            diamondSetting: "none",
            diamondCount: 0,
            diamondCarat: 0,
            diamondCut: "brilliant",
            diamondQuality: "W/Si",
            diamondSpreading: "together",
            diamondQuantity: 1,
            diamondRows: 1,
            diamondOrientation: "center",
            diamondRotation: "0°",
            diamondPosition: 0,
            diamondPlacements: [],
            normalGroovePositions: [],
            normalGrooveType: null,
            normalGrooveSurface: null,
            normalGrooveWidth: 0,
            normalGrooveWidths: [],
            normalGrooveDepth: 0,
            normalGrooveAngle: "0°",
            normalGrooveColors: [],
            normalGrooveCount: 0,
            hasNormalGrooves: "no",
            separationGroovePositions: [],
            separationGrooveType: null,
            separationGrooveSurface: null,
            separationGrooveWidth: 0,
            separationGrooveWidths: [],
            separationGrooveDepth: 0,
            separationGrooveAngle: "0°",
            separationGrooveColors: [],
            separationGrooveCount: 0,
            hasSeparationGrooves: "no",
            coloritGroovePositions: [],
            coloritGrooveType: null,
            coloritGrooveSurface: null,
            coloritGrooveWidth: 0,
            coloritGrooveWidths: [],
            coloritGrooveDepth: 0,
            coloritGrooveAngle: "0°",
            coloritGrooveColors: [],
            coloritGrooveCount: 0,
            hasColoritGrooves: "no",
            engravingType: "diamond",
            engravingFont: "01_Helvetica",
            engravingText: "≠≥≈≈",
            edgePositions: [],
            edgeDepths: [],
            edgeSurfaces: [],
            edgeWidths: [],
            ringDesign: "one-color",
            divisionProto: "none",
            divisionAngle: null,
            divisionPercentage: null,
            divisionNumberOfCycles: null,
            discs: [
                {
                    width: 5,
                    height: 1.5,
                    density: 0,
                    volume: 0.4096430000000001,
                    color: "yellow",
                    fineness: 585,
                    surface: "polished"
                }
            ],
            ringDiameter: 20.690142601946395,
            ringWidth: 5,
            ringHeight: 1.5,
            ringSize: 65,
            profile: "25",
            outerRadius: 5.508333333333334,
            innerRadius: 8.860555555555555,
            cornerRadiusOuter: 0.4,
            cornerRadiusInner: 0.3,
            slope: 0,
            id: "left",
            active: true,
            divisionPreset: "none"
        },
        right: {
            diamondSetting: "rubbed",
            diamondCount: 1,
            diamondCarat: 0.025,
            diamondCut: "brilliant",
            diamondQuality: "W/Si",
            diamondSpreading: "together",
            diamondQuantity: 1,
            diamondRows: 1,
            diamondOrientation: "center",
            diamondRotation: "0°",
            diamondPosition: 2.5,
            diamondPlacements: [
                {
                    carat: 0.025,
                    width: 1.8,
                    height: 1.8,
                    rotation: 0,
                    x: 0,
                    y: 0
                }
            ],
            diamondRowGap: 0,
            diamondGap: 0,
            normalGroovePositions: [],
            normalGrooveType: null,
            normalGrooveSurface: null,
            normalGrooveWidth: 0,
            normalGrooveWidths: [],
            normalGrooveDepth: 0,
            normalGrooveAngle: "0°",
            normalGrooveColors: [],
            normalGrooveCount: 0,
            hasNormalGrooves: "no",
            separationGroovePositions: [],
            separationGrooveType: null,
            separationGrooveSurface: null,
            separationGrooveWidth: 0,
            separationGrooveWidths: [],
            separationGrooveDepth: 0,
            separationGrooveAngle: "0°",
            separationGrooveColors: [],
            separationGrooveCount: 0,
            hasSeparationGrooves: "no",
            coloritGroovePositions: [],
            coloritGrooveType: null,
            coloritGrooveSurface: null,
            coloritGrooveWidth: 0,
            coloritGrooveWidths: [],
            coloritGrooveDepth: 0,
            coloritGrooveAngle: "0°",
            coloritGrooveColors: [],
            coloritGrooveCount: 0,
            hasColoritGrooves: "no",
            engravingType: "diamond",
            engravingFont: "01_Helvetica",
            engravingText: "",
            edgePositions: [],
            edgeDepths: [],
            edgeSurfaces: [],
            edgeWidths: [],
            ringDesign: "one-color",
            divisionProto: "none",
            divisionAngle: null,
            divisionPercentage: null,
            divisionNumberOfCycles: null,
            discs: [
                {
                    width: 5,
                    height: 1.5,
                    density: 0,
                    volume: 0.3566170000000001,
                    color: "yellow",
                    fineness: 585,
                    surface: "polished"
                }
            ],
            ringDiameter: 17.82535362629228,
            ringWidth: 5,
            ringHeight: 1.5,
            ringSize: 56,
            profile: "25",
            outerRadius: 5.508333333333334,
            innerRadius: 8.860555555555555,
            cornerRadiusOuter: 0.4,
            cornerRadiusInner: 0.3,
            slope: 0,
            id: "right",
            active: true,
            divisionPreset: "none"
        }
    };
    orderdata: any;
    reviewMap: any;

    configuratorReviewMap: any = [
        "profile",
        "ringSize",
        "ringDiameter",
        "ringWidth",
        "ringHeight",
        "ringDesign",
        "divisionPreset",
        "divisionAngle",
        "divisionPercentage",
        "divisionNumberOfCycles",
        "outerRadius",
        "innerRadius",
        "cornerRadiusOuter",
        "cornerRadiusInner",
        "slope",
        "discs",
        "hasNormalGrooves",
        "normalGrooveCount",
        "normalGrooveType",
        "normalGrooveWidth",
        "normalGrooveSurface",
        "normalGrooveAngle",
        "normalGrooveDepth",
        "normalGroovePositions",
        "hasSeparationGrooves",
        "separationGrooveCount",
        "separationGrooveType",
        "separationGrooveWidth",
        "separationGrooveSurface",
        "separationGrooveAngle",
        "separationGrooveDepth",
        "separationGroovePositions",
        "edgeWidths",
        "edgePositions",
        "edgeSurfaces",
        "engravingType",
        "engravingFont",
        "engravingText",
        "diamondSetting",
        "diamondCut",
        "diamondCount",
        "diamondCarat",
        "diamondQuality",
        "diamondSpreading",
        "diamondOrientation",
        "diamondRows",
        "diamondPosition",
        "diamondPlacements"
    ];

    modificatorReviewMap: any = [];

    tableData: any[];

    i18n: any = {};
    images: any = [];
    ids: any;
    font: Promise<any>;
    fonts: any;

    @ViewChild("textCanvas", {static: false})
    textCanvas: ElementRef;

    @ViewChild("measureCanvas", {static: false})
    measureCanvas: ElementRef;

    get canvas(): HTMLCanvasElement {
        return this.textCanvas.nativeElement;
    }

    constructor(private universal: UniversalService) {

    }

    ngOnInit(): void {
        console.log(this.universal.isFirefox, this.universal.isChrome);
        if (!this.manufacturing) return;
        let ids = Object.keys(this.manufacturing);
        const order = this.orderdata;
        if (order && order.selection) {
            if (Array.isArray(order.selection)) {
                ids = order.selection;
            } else if (ids.indexOf(order.selection) >= 0) {
                ids = [order.selection];
            }
        }
        if (!Array.isArray(this.reviewMap)) {
            const isModificator = ids.findIndex(id => !this.manufacturing[id].productId) < 0;
            this.reviewMap = isModificator ? this.modificatorReviewMap : this.configuratorReviewMap;
        }
        ids.forEach(id => {
            const ring = this.manufacturing[id];
            ring.sex = !ring.sex ? this.i18n["ring.mode." + id] : this.i18n["tab.yourrings.ring." + ring.sex];
            ring.image = this.images[id];
        });
        this.ids = ids;
        this.fonts = {
            "garden-grown": .38,
            "limon-script-bold": .25,
            "helvetica-neue": .23,
            "baskerville": .3
        };
        this.tableData = [
            {
                title: "Cím1",
                content: "Teszt",
            },
            {
                title: "Cím1",
                content: "Teszt 2",
            },
            {
                title: "Cím3",
                content: "Teszt 3",
            },
            {
                title: "Cím3",
                content: "Teszt 3",
            },
            {
                title: "Cím3",
                content: "Teszt 3",
            },
            {
                title: "Cím3",
                content: "Teszt 3",
            },
            {
                title: "Cím3",
                content: "Teszt 3",
            },
            {
                title: "Cím3",
                content: "Teszt 3",
            },
            {
                title: "Cím3",
                content: "Teszt 3",
            },
            {
                title: "Cím3",
                content: "Teszt 3",
            },
            {
                title: "Cím3",
                content: "Teszt 3",
            },
            {
                title: "Cím3",
                content: "Teszt 3",
            }
        ];
    }

    onResizeEvent(): void {
        console.log("Something target is resized...");
    }

    ngAfterViewInit(): void {
        // this.changeFont(Object.keys(this.fonts)[0]);
    }

    changeText(text: string): void {
        this.text = text;
        this.drawText();
    }

    changeMultiplier(multi: string): void {
        this.multiplier = parseFloat(multi);
        this.drawText();
    }

    changeFont(font: string): void {
        this.font = new FontFaceObserver(font).load();
        this.drawText();
    }

    drawText(): void {
        const bsize = 5000;
        const size = 3500;
        const msize = (bsize - size) * .5;
        this.canvas.width = bsize;
        this.canvas.height = bsize;
        const ctx = this.canvas.getContext("2d");
        const img = new Image();
        const pages = [0, -size];
        let imgIndex = 1;
        const zip = new JsZip();
        const readPrefix = "PDFtoJPG.me";
        const prefix = "linear-prog";
        const lastIndex = 26;
        const pad = lastIndex.toString(10).length;
        const loadNext = () => {
            if (imgIndex <= lastIndex) {
                img.src = `/assets/${readPrefix}-${ObjectUtils.pad(imgIndex, pad)}.jpg`;
                imgIndex++;
                return;
            }
            zip.generateAsync({type: "blob"}).then(function(content) {
                // see FileSaver.js
                saveAs(content, `${prefix}.zip`);
            });
            console.log("End");
        };
        img.onload = () => {
            const halfHeight = img.height * .5;
            const scale = size / halfHeight;
            let ix = 0;
            const genPage = () => {
                if (ix < pages.length) {
                    ctx.save();
                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, bsize, bsize);
                    ctx.translate(0, pages[ix] + msize);
                    ctx.scale(scale, scale);
                    ctx.drawImage(img, 0, 0);
                    ctx.restore();
                    CanvasUtils.manipulatePixels(this.canvas, ctx, color => {
                        const greyscale = 255 - (color.r * .3 + color.g * .59 + color.b * .11);
                        color.r = greyscale;
                        color.g = greyscale;
                        color.b = greyscale;
                        return color;
                    });
                    this.canvas.toBlob(blob => {
                        zip.file(`${prefix}-${ObjectUtils.pad(imgIndex, pad)}-${ix}.jpg`, blob);
                        genPage();
                    }, "image/jpeg", .98);
                    ix++;
                    return;
                }
                loadNext();
            };
            genPage();
        };
        loadNext();
        // this.font.then(fontInfo => {
        //     const lineHeight = 1.1;
        //     const settings = {canvasWidth: 1417, canvasHeight: 590, boxWidth: 1370.07873876, boxHeight: 531.49606245};
        //     const lines: string[] = this.text.split("\n");
        //     this.canvas.width = settings.canvasWidth;
        //     this.canvas.height = settings.canvasHeight;
        //     const size = CanvasUtils.measureTextFontSize(settings.boxWidth, settings.boxHeight, lines, fontInfo.family, lineHeight, this.measureCanvas.nativeElement);
        //     const ctx = this.canvas.getContext("2d");
        //     const lineSize = size * lineHeight;
        //     const textBlockSize = lines.length * lineSize;
        //     const x = settings.canvasWidth * .5;
        //     let y = (settings.canvasHeight - textBlockSize) * .5;
        //     console.log({textBlockSize, y, x, size});
        //     ctx.strokeRect(0, y, settings.canvasWidth, textBlockSize);
        //     if (true || this.universal.isFirefox) {
        //         console.log("Firefox");
        //         const multi = !ObjectUtils.isNumber(this.fonts[fontInfo.family]) ? this.multiplier : this.fonts[fontInfo.family];
        //         y = y + lineSize - lineSize * multi;
        //         CanvasUtils.drawLines(ctx, lines, fontInfo.family, size, lineHeight, "center", "alphabetic", x, y);
        //     } else {
        //         const baseLine = fontInfo.family == "limon-script-bold" ? "top" : "hanging";
        //         CanvasUtils.drawLines(ctx, lines, fontInfo.family, size, lineHeight, "center", baseLine, x, y);
        //     }
        //     ctx.fillStyle = "black";
        // }, () => {
        //     console.log("Cant load font");
        // });
    }

    getValue(path: string): any {
        return ObjectUtils.getValue(this.manufacturing, path, undefined, false);
    }
}
