import {DurationInputArg1, DurationInputArg2} from "moment";
import {ObjectUtils} from "./ngx-utils/utils/object.utils";
import {StringUtils} from "./ngx-utils/utils/string.utils";
import {DateUtils} from "./ngx-utils/utils/date.utils";
import {ArrayUtils} from "./ngx-utils/utils/array.utils";
import {SetUtils} from "./ngx-utils/utils/set.utils";

export {
    IResolveFactory,
    ITranslation,
    ITranslations,
    ILanguageService,
    LANGUAGE_SERVICE,
    IAuthService,
    RouteValidator,
    IRouteData,
    IRoute,
    AUTH_SERVICE,
    IAclComponent,
    IRouteStateInfo,
    StorageMode,
    IToasterService,
    TOASTER_SERVICE,
    IAsyncMessage,
    AsyncMethod,
    UnorederedListTemplate,
    UnorderedListTemplates,
    UnorderedListStyle,
    IAjaxRequestDetails,
    AjaxRequestCallback,
    IScriptPromises,
    ISearchObservable,
    FactoryDependencies,
    ITimer,
    IExtraProperties,
    IGroupMap,
    TranslationQuery,
    IPaginationData,
    PaginationDataLoader,
    PaginationItemContext,
    ResourceIfContext
} from "./ngx-utils/common-types";

export {AjaxRequestHandler} from "./ngx-utils/utils/ajax-request-handler";
export {ObjectUtils} from "./ngx-utils/utils/object.utils";
export {DateUtils} from "./ngx-utils/utils/date.utils";
export {FileUtils} from "./ngx-utils/utils/file.utils";
export {ReflectUtils} from "./ngx-utils/utils/reflect.utils";
export {LoaderUtils} from "./ngx-utils/utils/loader.utils";
export {MathUtils} from "./ngx-utils/utils/math.utils";
export {AuthGuard} from "./ngx-utils/utils/auth.guard";
export {ObservableUtils} from "./ngx-utils/utils/observable.utils";
export {StringUtils} from "./ngx-utils/utils/string.utils";
export {ArrayUtils} from "./ngx-utils/utils/array.utils";
export {SetUtils} from "./ngx-utils/utils/set.utils";
export {TimerUtils} from "./ngx-utils/utils/timer.utils";
export {UniqueUtils} from "./ngx-utils/utils/unique.utils";

export {UniversalService} from "./ngx-utils/services/universal.service";
export {IStateInfo, StateService} from "./ngx-utils/services/state.service";
export {AclService} from "./ngx-utils/services/acl.service";
export {StaticAuthService} from "./ngx-utils/services/auth.service";
export {EventsService} from "./ngx-utils/services/events.service";
export {FormatterService} from "./ngx-utils/services/formatter.service";
export {StaticLanguageService} from "./ngx-utils/services/language.service";
export {StorageService} from "./ngx-utils/services/storage.service";
export {ConsoleToasterService} from "./ngx-utils/services/toaster.service";

export {ScrollEventPlugin} from "./ngx-utils/plugins/scroll-event.plugin";

export {ChunkPipe} from "./ngx-utils/pipes/chunk.pipe";
export {EntriesPipe} from "./ngx-utils/pipes/entries.pipe";
export {ExtraItemPropertiesPipe} from "./ngx-utils/pipes/extra-item-properties.pipe";
export {FilterPipe} from "./ngx-utils/pipes/filter.pipe";
export {FormatNumberPipe} from "./ngx-utils/pipes/format-number.pipe";
export {GetOffsetPipe} from "./ngx-utils/pipes/get-offset.pipe";
export {GroupByPipe} from "./ngx-utils/pipes/group-by.pipe";
export {JoinPipe} from "./ngx-utils/pipes/join.pipe";
export {KeysPipe} from "./ngx-utils/pipes/keys.pipe";
export {MinPipe} from "./ngx-utils/pipes/min.pipe";
export {MaxPipe} from "./ngx-utils/pipes/max.pipe";
export {RemapPipe} from "./ngx-utils/pipes/remap.pipe";
export {ReplacePipe} from "./ngx-utils/pipes/replace.pipe";
export {ReversePipe} from "./ngx-utils/pipes/reverse.pipe";
export {RoundPipe} from "./ngx-utils/pipes/round.pipe";
export {TranslatePipe} from "./ngx-utils/pipes/translate.pipe";
export {ValuesPipe} from "./ngx-utils/pipes/values.pipe";

export {AsyncMethodDirective} from "./ngx-utils/directives/async-method.directive";
export {BackgroundDirective} from "./ngx-utils/directives/background.directive";
export {IconDirective} from "./ngx-utils/directives/icon.directive";
export {PaginationDirective} from "./ngx-utils/directives/pagination.directive";
export {PaginationItemDirective} from "./ngx-utils/directives/pagination-item.directive";
export {ResourceIfDirective} from "./ngx-utils/directives/resource-if.directive";
export {StickyDirective} from "./ngx-utils/directives/sticky.directive";
export {UnorderedListItemDirective} from "./ngx-utils/directives/unordered-list-item.directive";
export {UnorderedListTemplateDirective} from "./ngx-utils/directives/unordered-list-template.directive";

export {UnorderedListComponent} from "./ngx-utils/components/unordered-list.component";

export {NgxUtilsModule} from "./ngx-utils/ngx-utils.module";

// --- Interfaces ---
export const propDescriptor: PropertyDescriptor = {
    writable: true,
    enumerable: false
};

declare global {
    interface Object {
        pad(width: number, chr?: string): string;
    }

    interface String {
        has(...parts: string[]): boolean;
        lcFirst(): string;
        ucFirst(): string;
        startsWith(start: string): boolean;
    }

    interface Date {
        isHoliday(): boolean;
        isBusinessDay(): boolean;
        add(amount?: DurationInputArg1, unit?: DurationInputArg2): Date;
        businessAdd(amount: number, unit?: DurationInputArg2): Date;
        businessSubtract (amount: number, unit?: DurationInputArg2): Date;
    }

    interface Set<T> {
        equals(obj: any): boolean;
        addArray(items: Array<T>): void;
    }

    interface Array<T> {
        has(...values: T[]): boolean;
        match(str: string): boolean;
        any(cb: (item: T) => boolean): boolean;
        move(oldIndex: number, newIndex: number): T[];
        reversed(): T[];
        min(cb: (item: T, index?: number) => number): T;
        max(cb: (item: T, index?: number) => number): T;
    }
}

// --- Object extensions ---
Object.prototype.pad = function(width: number, chr: string = "0"): string {
    return ObjectUtils.pad(this, width, chr);
};
Object.defineProperties(Object.prototype, {
    pad: propDescriptor
});

// --- String extensions ---
String.prototype.has = function(...parts: string[]): boolean {
    parts.unshift(this);
    return StringUtils.has.apply(null, parts);
};
String.prototype.lcFirst = function(): string {
    return StringUtils.lcFirst(this);
};
String.prototype.ucFirst = function(): string {
    return StringUtils.ucFirst(this);
};
String.prototype.startsWith = function(start: string): boolean {
    return StringUtils.startsWith(this, start);
};
Object.defineProperties(Object.prototype, {
    has: propDescriptor,
    lcFirst: propDescriptor,
    ucFirst: propDescriptor,
    startsWith: propDescriptor
});

// --- Date extensions ---
Date.prototype.isHoliday = function(): boolean {
    return DateUtils.isHoliday(this);
};
Date.prototype.isBusinessDay = function(): boolean {
    return DateUtils.isBusinessDay(this);
};
Date.prototype.add = function(amount?: DurationInputArg1, unit?: DurationInputArg2): Date {
    return DateUtils.add(this, amount, unit);
};
Date.prototype.businessAdd = function(amount: number, unit?: DurationInputArg2): Date {
    return DateUtils.businessAdd(this, amount, unit);
};
Date.prototype.businessSubtract = function(amount: number, unit?: DurationInputArg2): Date {
    return DateUtils.businessSubtract(this, amount, unit);
};
Object.defineProperties(Date.prototype, {
    isHoliday: propDescriptor,
    isBusinessDay: propDescriptor,
    add: propDescriptor,
    businessAdd: propDescriptor,
    businessSubtract: propDescriptor
});

// --- Set extensions ---
Set.prototype.equals = function(obj: any): boolean {
    return SetUtils.equals(this, obj);
};
Set.prototype.addArray = function(items: any[]): void {
    SetUtils.addArray(this, items);
};
Object.defineProperties(Set.prototype, {
    equals: propDescriptor,
    addArray: propDescriptor
});

// --- Array extensions ---
Array.prototype.has = function(...items: any[]): boolean {
    items.unshift(this);
    return ArrayUtils.has.apply(null, items);
};
Array.prototype.match = function(str: string): boolean {
    return ArrayUtils.match(this, str);
};
Array.prototype.any = function(cb: (item: any) => boolean) {
    return ArrayUtils.any(this, cb);
};
Array.prototype.move = function(oldIndex: number, newIndex: number): any[] {
    return ArrayUtils.move(this, oldIndex, newIndex);
};
Array.prototype.reversed = function(): any[] {
    return ArrayUtils.reversed(this);
};
Array.prototype.min = function(cb: (item: any, index?: number) => number): any {
    return ArrayUtils.min(this, cb);
};
Array.prototype.max = function (cb: (item: any, index?: number) => number): any {
    return ArrayUtils.max(this, cb);
};
Object.defineProperties(Array.prototype, {
    has: propDescriptor,
    match: propDescriptor,
    any: propDescriptor,
    move: propDescriptor,
    reversed: propDescriptor,
    min: propDescriptor,
    max: propDescriptor
});

if (typeof XMLHttpRequest !== "undefined") {
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method: string, url?: string, async?: boolean, user?: string, password?: string): void {
        originalOpen.apply(this, arguments);
        window.dispatchEvent(new CustomEvent("ajaxRequest", {
            detail: {
                request: this,
                method: method,
                url: url
            }
        }))
    };
}
