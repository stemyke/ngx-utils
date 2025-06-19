import {Inject, Injectable} from "@angular/core";
import {IApiService, IOpenApiSchema, IOpenApiSchemas} from "../common-types";
import {API_SERVICE} from "../tokens";

@Injectable()
export class OpenApiService {

    private schemasPromise: Promise<IOpenApiSchemas>;

    constructor(@Inject(API_SERVICE) readonly api: IApiService) {

    }

    getSchemas(): Promise<IOpenApiSchemas> {
        this.schemasPromise = this.schemasPromise || new Promise((resolve => {
            this.api.get("api-docs").then(res => {
                const schemas: IOpenApiSchemas = res.components?.schemas || res.definitions || {};
                Object.values(schemas).forEach(schema => {
                    Object.keys(schema.properties || {}).forEach(p => {
                        schema.properties[p].id = p;
                    });
                });
                resolve(schemas);
            }, () => {
                resolve({});
            });
        }));
        return this.schemasPromise;
    }

    async getSchema(name: string): Promise<IOpenApiSchema> {
        const schemas = await this.getSchemas();
        return schemas[name] || null;
    }
}
