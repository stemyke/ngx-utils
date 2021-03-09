import {Inject, Injectable} from "@angular/core";
import {DefaultUrlSerializer, UrlSegment, UrlSegmentGroup, UrlTree} from "@angular/router";
import {ILanguageService, LANGUAGE_SERVICE} from "../common-types";

export interface IUrlDictionary {
    [key: string]: string
}

@Injectable()
export class TranslatedUrlSerializer extends DefaultUrlSerializer {

    protected cache: {[lang: string]: IUrlDictionary};

    constructor(@Inject(LANGUAGE_SERVICE) readonly language: ILanguageService) {
        super();
        this.cache = {};
    }

    serialize(tree: UrlTree): string {
        const copy = new UrlTree();
        const dictionary = this.getDictionary(true);
        copy.root = this.modifyTreeRecursive(tree.root, segment => {
            segment.path = dictionary[segment.path] || segment.path;
        });
        copy.queryParams = tree.queryParams;
        return super.serialize(copy);
    }

    parse(url: string): UrlTree {
        const tree = super.parse(url);
        const dictionary = this.getDictionary(false);
        tree.root = this.modifyTreeRecursive(tree.root, segment => {
            segment.path = dictionary[segment.path] || segment.path;
        });
        return tree;
    }

    getDictionary(serialize: boolean): IUrlDictionary {
        const method = serialize ? `serialize` : `parse`;
        const key = `${this.language.currentLanguage}-${method}`;
        if (!this.cache[key]) {
            const dict = this.language.dictionary;
            this.cache[key] = Object.keys(dict).reduce((res, key) => {
                if (!key.startsWith("route.")) return res;
                const value = dict[key];
                key = key.replace("route.", "");
                res[serialize ? key : value] = serialize ? value : key;
                return res;
            }, {});
        }
        return this.cache[key];
    }

    modifyTreeRecursive(segmentGroup: UrlSegmentGroup, cb: (segment: UrlSegment) => void): UrlSegmentGroup {
        if (!segmentGroup) return null;
        const childrenArr = [];
        const children = Object.keys(segmentGroup.children || {}).reduce((res, key) => {
            const child = this.modifyTreeRecursive(segmentGroup.children[key], cb);
            childrenArr.push(child);
            res[key] = child;
            return res;
        }, {});
        const newGroup = new UrlSegmentGroup(segmentGroup.segments.map(s => {
            s = new UrlSegment(s.path, Object.assign({}, s.parameters));
            cb(s);
            return s;
        }), children);
        childrenArr.forEach(c => {
            c.parent = newGroup;
        });
        return newGroup;
    }
}
