import {Inject, Injectable} from "@angular/core";
import {
    DynamicSchemaRef,
    IApiService,
    OpenApiSchema,
    OpenApiSchemaProperty, OpenApiSchemaRef,
    OpenApiSchemas
} from "../common-types";
import {API_SERVICE} from "../tokens";
import {ObjectUtils} from "../utils/object.utils";

@Injectable()
export class OpenApiService {

    private apiDocs: Promise<any>;
    private schemas: Promise<OpenApiSchemas>;
    private readonly dynamicSchemas: Record<string, OpenApiSchema>;

    constructor(@Inject(API_SERVICE) readonly api: IApiService) {
        this.dynamicSchemas = {};
    }

    isDynamicSchema(value: any): value is Required<DynamicSchemaRef> {
        if (!ObjectUtils.isObject(value)) {
            return false;
        }
        const definition = value as DynamicSchemaRef;
        return ObjectUtils.isStringWithValue(definition.dynamicSchema)
            || ObjectUtils.isStringWithValue(definition.dynamicSchemaUrl)
            || ObjectUtils.isStringWithValue(definition.dynamicSchemaName);
    }

    async getSchemas(): Promise<OpenApiSchemas> {
        const cache = this.api.cached("auth");
        const apiDocs = this.api.get("api-docs", {cache});
        if (apiDocs !== this.apiDocs) {
            this.apiDocs = apiDocs;
            this.schemas = apiDocs.then(res => this.extractSchemas(res));
        }
        return this.schemas;
    }

    async getReferences(property: OpenApiSchemaProperty, schema: OpenApiSchema): Promise<OpenApiSchema[]> {
        const props = !property.items ? [property] : [property, property.items];
        const references: Array<OpenApiSchemaRef | DynamicSchemaRef> = [];
        for (const prop of props) {
            if (this.isDynamicSchema(prop) || ObjectUtils.isStringWithValue(prop.$ref)) {
                references.push(prop);
                continue;
            }
            if (ObjectUtils.isArray(prop.allOf)) {
                prop.allOf
                    .filter(ref => ObjectUtils.isStringWithValue(ref.$ref))
                    .forEach(ref => references.push(ref));
            }
            if (ObjectUtils.isArray(prop.oneOf)) {
                prop.oneOf
                    .filter(ref => ObjectUtils.isStringWithValue(ref.$ref))
                    .forEach(ref => references.push(ref));
            }
        }

        return Promise.all(references.map(ref => {
            if (this.isDynamicSchema(ref)) {
                return this.getDynamicSchema(ref);
            }
            return this.getSchema((ref as OpenApiSchemaRef).$ref.split("/").pop());
        }));
    }

    async getSchema(name: string): Promise<OpenApiSchema> {
        const schemas = await this.getSchemas();
        return schemas[name] || null;
    }

    protected async getDynamicSchema(definition: DynamicSchemaRef): Promise<OpenApiSchema> {
        const cache = this.api.cached("auth");
        const dynamicDocs = await this.api.get(
            definition.dynamicSchema || definition.dynamicSchemaUrl || "dynamic-schemas",
            {cache}
        );
        const dynamicSchemas = this.extractSchemas(dynamicDocs);
        const dynamicSchema = dynamicSchemas[definition.dynamicSchemaName || "DTO"];
        delete dynamicSchemas[definition.dynamicSchemaName || "DTO"];
        Object.assign(this.dynamicSchemas, dynamicSchemas);
        return dynamicSchema;
    }

    protected extractSchemas(res: any): OpenApiSchemas {
        const schemas: OpenApiSchemas = Object.assign({}, res.components?.schemas || res.definitions || {});
        Object.values(schemas).forEach(schema => {
            Object.keys(schema.properties || {}).forEach(p => {
                schema.properties[p].id = p;
            });
        });
        return schemas;
    }
}
