import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {ObjectUtils} from "../ngx-utils/utils/object.utils";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

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

    i18n: any = {};
    images: any = [];
    ids: any;

    ngOnInit(): void {
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
            this.reviewMap = isModificator ? this.modificatorReviewMap: this.configuratorReviewMap;
        }
        ids.forEach(id => {
            const ring = this.manufacturing[id];
            ring.sex =  !ring.sex ? this.i18n["ring.mode." + id] : this.i18n["tab.yourrings.ring." + ring.sex];
            ring.image = this.images[id];
        });
        this.ids = ids;
    }

    getValue(path: string): any {
        return ObjectUtils.getValue(this.manufacturing, path, undefined, false);
    }
}
