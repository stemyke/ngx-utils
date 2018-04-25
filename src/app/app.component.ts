import {Component} from "@angular/core";
import "../../extensions";
import {StaticLanguageService} from "../public_api";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"],
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
            diamondSetting: "none",
            diamondCount: 0,
            diamondCarat: 0,
            diamondQuality: "white/normal",
            diamondCut: "brilliant",
            diamondSpreading: "together",
            diamondOrientation: "center",
            diamondPosition: null,
            diamondRows: 1,
            diamondQuantity: 1,
            normalGroovePositions: [],
            normalGrooveType: null,
            normalGrooveSurface: null,
            normalGrooveWidth: 0,
            normalGrooveWidths: [],
            normalGrooveDepth: 0,
            normalGrooveAngle: null,
            normalGrooveColors: [],
            normalGrooveCount: 0,
            hasNormalGrooves: "no",
            separationGroovePositions: [
                1.3333333333333333,
                2.666666666666666
            ],
            separationGrooveType: "v",
            separationGrooveSurface: "polished",
            separationGrooveWidth: 0.3,
            separationGrooveWidths: [
                0.3,
                0.3
            ],
            separationGrooveDepth: 0.12586494467659198,
            separationGrooveAngle: {},
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
            coloritGrooveAngle: null,
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
                    width: 1.3333333333333333,
                    height: 1.7,
                    density: 12.9,
                    volume: 0.096381,
                    color: "white",
                    fineness: 585,
                    surface: "polished"
                },
                {
                    width: 1.3333333333333333,
                    height: 1.7,
                    density: 13.05,
                    volume: 0.145279,
                    color: "rose",
                    fineness: 585,
                    surface: "polished"
                },
                {
                    width: 1.3333333333333333,
                    height: 1.7,
                    density: 13.12,
                    volume: 0.107001,
                    color: "yellow",
                    fineness: 585,
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
            divisionPreset: "vertical-1-1-1",
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
            diamondQuality: "white/normal",
            diamondCut: "brilliant",
            diamondSpreading: "together",
            diamondOrientation: "center",
            diamondPosition: null,
            diamondRows: 1,
            diamondQuantity: 1,
            normalGroovePositions: [],
            normalGrooveType: null,
            normalGrooveSurface: null,
            normalGrooveWidth: 0,
            normalGrooveWidths: [],
            normalGrooveDepth: 0,
            normalGrooveAngle: null,
            normalGrooveColors: [],
            normalGrooveCount: 0,
            hasNormalGrooves: "no",
            separationGroovePositions: [
                1.3333333333333333,
                2.6666666666666665
            ],
            separationGrooveType: "v",
            separationGrooveSurface: "polished",
            separationGrooveWidth: 0.3,
            separationGrooveWidths: [
                0.3,
                0.3
            ],
            separationGrooveDepth: 0.12586494467659198,
            separationGrooveAngle: {},
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
            coloritGrooveAngle: null,
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
                    width: 1.3333333333333333,
                    height: 1.7,
                    density: 12.9,
                    volume: 0.08496100000000002,
                    color: "white",
                    fineness: 585,
                    surface: "polished"
                },
                {
                    width: 1.3333333333333333,
                    height: 1.7,
                    density: 13.05,
                    volume: 0.128024,
                    color: "rose",
                    fineness: 585,
                    surface: "polished"
                },
                {
                    width: 1.3333333333333333,
                    height: 1.7,
                    density: 13.12,
                    volume: 0.09431999999999999,
                    color: "yellow",
                    fineness: 585,
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
            divisionPreset: "vertical-1-1-1",
            outerRadius: 3.9,
            innerRadius: 3.2,
            cornerRadiusOuter: 0.25,
            cornerRadiusInner: 0.25,
            slope: 0
        }
    };

    reviewMap = [
        {
            keys: [
                "profile",
                "ringWidth",
                "ringHeight",
                "ringSize"
            ],
            group: "profileAndSizeSetting"
        },
        {
            keys: [
                "divisionPreset",
                "discs"
            ],
            group: "metalSetting"
        },
        {
            keys: [
                "normalGrooveType",
                "normalGrooveAngle",
                "normalGrooveWidth",
                "normalGrooveDepth",
                "normalGrooveSurface",
                "normalGroovePositions"
            ],
            group: "normalGrooves"
        },
        {
            keys: [
                "separationGrooveType",
                "separationGrooveAngle",
                "separationGrooveWidth",
                "separationGrooveDepth",
                "separationGrooveSurface",
                "separationGroovePositions"
            ],
            group: "separationGrooves"
        },
        {
            keys: [
                "coloritGrooveType",
                "coloritGrooveAngle",
                "coloritGrooveWidth",
                "coloritGrooveDepth",
                "coloritGrooveSurface",
                "coloritGroovePositions"
            ],
            group: "coloritGrooves"
        },
        {
            keys: [
                "diamondSetting",
                "diamondCut",
                "diamondCarat",
                "diamondQuality",
                "diamondCount",
                "diamondPlacements"
            ],
            group: "diamonds"
        },
        {
            keys: [
                "engravingType",
                "engravingFont",
                "engravingText"
            ],
            group: "engraving"
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
