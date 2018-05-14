import {Component, ViewEncapsulation} from "@angular/core";
import "../ngx-utils/extensions";
import {StaticLanguageService} from "../public_api";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent {
    title = "app".pad(10);
    data = [
        {
            "olla": [
                "ize",
                "bigyo",
                "egyeb.fd"
            ]
        },
        {
            ize: "test2",
            bigyo: [
                "d", "c", "b", "a"
            ],
            egyeb: {
                "kola": 3,
                "sprite": 4,
            }
        }
    ];

    map = {
        ize: "test",
        bigyo: [
            "a", "b", "c", "d"
        ],
        egyeb: {
            "kola": 3,
            "sprite": 4,
        }
    };

    manufacturing = {
        left: {
            diamondSetting: "rubbed",
            diamondCount: 1,
            diamondCarat: 0.009,
            diamondCut: "brilliant",
            diamondQuality: "white/normal",
            diamondSpreading: "together",
            diamondQuantity: 1,
            diamondRows: 1,
            diamondOrientation: "center",
            diamondRotation: "0°",
            diamondPosition: 2,
            diamondPlacements: [
                {
                    carat: 0.009,
                    width: 1.3,
                    height: 1.3,
                    rotation: 0,
                    x: 2,
                    y: 0
                }
            ],
            diamondRowGap: 0.8,
            diamondGap: 0.8,
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
            separationGroovePositions: [
                1.6,
                2.4000000000000004
            ],
            separationGrooveType: "v",
            separationGrooveSurface: "polished",
            separationGrooveWidth: 0.3,
            separationGrooveWidths: [
                0.3,
                0.3
            ],
            separationGrooveDepth: 0.12586494467659198,
            separationGrooveAngle: "100°",
            separationGrooveColors: [
                null,
                null
            ],
            separationGrooveCount: 2,
            hasSeparationGrooves: "yes",
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
            engravingFont: "greatvibes-regular",
            engravingText: "",
            edgePositions: [],
            edgeDepths: [],
            edgeSurfaces: [],
            edgeWidths: [],
            discs: [
                {
                    width: 1.6,
                    height: 1.7,
                    density: 14.87,
                    volume: 0.128948,
                    color: "white",
                    fineness: 750,
                    surface: "polished"
                },
                {
                    width: 0.8,
                    height: 1.7,
                    density: 14.79,
                    volume: 0.09078200000000002,
                    color: "rose",
                    fineness: 750,
                    surface: "polished"
                },
                {
                    width: 1.6,
                    height: 1.7,
                    density: 14.92,
                    volume: 0.128931,
                    color: "yellow",
                    fineness: 750,
                    surface: "polished"
                }
            ],
            id: "left",
            active: true,
            profile: "V1",
            ringDesign: "three-color",
            ringSize: 62,
            ringDiameter: 19.735212943395023,
            ringWidth: 4,
            ringHeight: 1.7,
            divisionPreset: "vertical-2-1-2",
            outerRadius: 3.9,
            innerRadius: 3.2,
            cornerRadiusOuter: 0.25,
            cornerRadiusInner: 0.25,
            slope: 0
        },
        right: {
            diamondSetting: "none",
            diamondCount: 0,
            diamondCarat: 0,
            diamondCut: "brilliant",
            diamondQuality: "white/normal",
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
            separationGroovePositions: [
                1.6,
                2.4000000000000004
            ],
            separationGrooveType: "v",
            separationGrooveSurface: "polished",
            separationGrooveWidth: 0.3,
            separationGrooveWidths: [
                0.3,
                0.3
            ],
            separationGrooveDepth: 0.12586494467659198,
            separationGrooveAngle: "100°",
            separationGrooveColors: [
                null,
                null
            ],
            separationGrooveCount: 2,
            hasSeparationGrooves: "yes",
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
            engravingFont: "greatvibes-regular",
            engravingText: "",
            edgePositions: [],
            edgeDepths: [],
            edgeSurfaces: [],
            edgeWidths: [],
            discs: [
                {
                    width: 1.6,
                    height: 1.7,
                    density: 14.87,
                    volume: 0.11366100000000004,
                    color: "white",
                    fineness: 750,
                    surface: "polished"
                },
                {
                    width: 0.8,
                    height: 1.7,
                    density: 14.79,
                    volume: 0.07999800000000001,
                    color: "rose",
                    fineness: 750,
                    surface: "polished"
                },
                {
                    width: 1.6,
                    height: 1.7,
                    density: 14.92,
                    volume: 0.11364599999999997,
                    color: "yellow",
                    fineness: 750,
                    surface: "polished"
                }
            ],
            id: "right",
            active: true,
            profile: "V1",
            ringDesign: "three-color",
            ringSize: 54,
            ringDiameter: 17.188733853924695,
            ringWidth: 4,
            ringHeight: 1.7,
            divisionPreset: "vertical-2-1-2",
            outerRadius: 3.9,
            innerRadius: 3.2,
            cornerRadiusOuter: 0.25,
            cornerRadiusInner: 0.25,
            slope: 0
        }
    };

    reviewMap = [
        {
            group: "profileAndSizeSetting",
            keys: [
                "profile",
                "ringWidth",
                "ringHeight",
                "ringSize"
            ]
        },
        {
            group: "metalSetting",
            keys: [
                "divisionPreset",
                "discs"
            ]
        },
        {
            group: "normalGroove",
            keys: [
                "normalGrooveType",
                "normalGrooveAngle",
                "normalGrooveWidth",
                "normalGrooveDepth",
                "normalGrooveSurface",
                "normalGroovePositions"
            ]
        },
        {
            group: "separationGroove",
            keys: [
                "separationGrooveType",
                "separationGrooveAngle",
                "separationGrooveWidth",
                "separationGrooveDepth",
                "separationGrooveSurface",
                "separationGroovePositions"
            ]
        },
        {
            group: "coloritGroove",
            keys: [
                "coloritGrooveType",
                "coloritGrooveAngle",
                "coloritGrooveWidth",
                "coloritGrooveDepth",
                "coloritGrooveSurface",
                "coloritGroovePositions"
            ]
        },
        {
            group: "diamonds",
            keys: [
                "diamondSetting",
                "diamondCut",
                "diamondCarat",
                "diamondQuality",
                "diamondCount",
                "diamondPlacements"
            ]
        },
        {
            group: "engraving",
            keys: [
                "engravingType",
                "engravingFont",
                "engravingText"
            ]
        }
    ];

    groupFilter = "item.key !== 'diamonds' || params.diamondSetting !== 'none'";
    keyFilter = "(typeof params[item]).has('object', 'number', 'string')";
    mmFormat = "num + ' mm'";

    constructor(lang: StaticLanguageService) {
        lang.dictionary = {
            test: {
                olla: "Ollé",
                ize: "Izé",
                bigyo: "Bigyó",
                egyeb: "Egyéb",
            }
        };
    }
}
