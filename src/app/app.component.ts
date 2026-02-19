import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {ChipOption, ITableColumns, UniversalService} from "../public_api";

@Component({
    standalone: false,
    selector: "app-root",
    templateUrl: "./app.component.html",
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

    options: ChipOption[];
    tableColumns: ITableColumns;
    tableData: any[];

    numberChips: number[];
    stringChips: string[];
    optionChips: string[];
    assets: string[];
    asset: string;
    html: string;

    constructor(private universal: UniversalService) {
        this.options = [
            {
                value: "teszt",
                label: "Teszt 1",
            },
            {
                value: "teszt2",
                label: "Teszt 2",
                picture: "https://i.ytimg.com/vi/YehgM4zSpq8/hqdefault.jpg?sqp=-oaymwEnCNACELwBSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLCUmwTdQb2SPpwyC1TpFOl3dqFa-Q"
            },
            {
                value: "strawberry",
                label: "Eper",
                picture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrMmiDhTiv74rldx41Ov5XatBk87e8o20CsAAEDnErhj5QXW5axw-V4ZtGlnLQgbth7D16PyWSAHHFIEBuyM3EdjqJS7VhdEw0THQaCLKt0g"
            },
            {
                value: "kiwi",
                label: "Kivi",
            },
            {
                value: "banana",
                label: "Banán",
            }
        ];
        this.tableColumns = {
            title: {
                title: "Title",
                filter: true,
                filterType: "enum",
                sort: "title",
                enum: ["Cím1", "Cím2", "Cím3"]
            },
            content: {
                title: "Content",
                sort: "content",
                filter: true,
            },
            fresh: {
                title: "Is fresh?",
                filter: true,
                filterType: "checkbox"
            }
        };
        this.numberChips = [3, 10, 15, 44];
        this.stringChips = ["banana", "kiwi", "strawberry"];
        this.optionChips = ["banana", "kiwi", "strawberry"];
        this.assets = ["639c462c34cfbe9ca7df1a0a", "687f5eefd2cfab7bb7fff3f8", "67e69e44638845f9da9f1278"];
        this.asset = "67e69e44638845f9da9f1278";
        this.html = `<b>Bold</b> <i>Italic</i>`;
    }

    ngOnInit(): void {
        this.tableData = [
            {
                title: "Cím1",
                content: "Teszt",
                fresh: true,
            },
            {
                title: "Cím1",
                content: "Teszt 2",
                fresh: true,
            },
            {
                title: "Cím3",
                content: "Teszt 3",
                fresh: false,
            },
            {
                title: "Cím3",
                content: "Teszt 3",
                fresh: false,
            },
            {
                title: "Cím3",
                content: "Teszt 3",
                fresh: false,
            },
            {
                title: "Cím3",
                content: "Teszt 3",
                fresh: true,
            },
            {
                title: "Cím3",
                content: "Teszt 3",
                fresh: false,
            },
            {
                title: "Cím3",
                content: "Teszt 3",
                fresh: false,
            },
            {
                title: "Cím3",
                content: "Teszt 3",
                fresh: true,
            },
            {
                title: "Cím3",
                content: "Teszt 3",
                fresh: false,
            },
            {
                title: "Cím3",
                content: "Teszt 3",
                fresh: true,
            },
            {
                title: "Cím3",
                content: "Teszt 3",
                fresh: false,
            }
        ];
    }
}
