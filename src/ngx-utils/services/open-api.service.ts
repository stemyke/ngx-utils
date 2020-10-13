import {Inject, Injectable} from "@angular/core";
import {API_SERVICE, IApiService, IOpenApiSchema, IOpenApiSchemas} from "../common-types";

@Injectable()
export class OpenApiService {

    private schemasPromise: Promise<IOpenApiSchemas>;

    constructor(@Inject(API_SERVICE) readonly api: IApiService) {

    }

    getSchemas(): Promise<IOpenApiSchemas> {
        this.schemasPromise = this.schemasPromise || new Promise((resolve => {
            const baseUrl = this.api.url("").replace("api/", "api-docs");
            this.api.client.get(baseUrl).subscribe((res: any) => {
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
        const schema = schemas[name];
        if (!schema) return null;
        return schemas[name];
    }
}
