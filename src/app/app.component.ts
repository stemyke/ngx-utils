import {Component} from "@angular/core";
import "../../extensions";
import {StaticLanguageService} from "../public_api";
import {HttpClient} from "@angular/common/http";
import {AjaxRequestHandler, IAjaxRequestDetails} from "../ngx-utils/utils";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"],
})
export class AppComponent {
    title = "app".pad(10);
    data = [
        {
            ize: "test",
            bigyo: [
                "a", "b", "c", "d"
            ],
            egyeb: {
                "kola": 3,
                "sprite": 4,
            }
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

    constructor(lang: StaticLanguageService, http: HttpClient) {
        lang.dictionary = {
            test: {
                ize: "Izé",
                bigyo: "Bigyó",
                egyeb: "Egyéb",
            }
        };
        const handler = new AjaxRequestHandler(/jsonplaceholder/g, (details: IAjaxRequestDetails, params: any) => {
            console.log(details, params);
        }).listen();
        http.get("https://jsonplaceholder.typicode.com/posts/1").subscribe(t => {
            console.log(t);
        });
        handler.forget();
    }
}
