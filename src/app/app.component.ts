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
