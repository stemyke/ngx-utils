export class ForbiddenZone {

    static isForbidden(name: string): boolean {
        return Zone.current.name === `forbidden-${name}`;
    }

    static run<T>(name: string, cb: () => T): T {
        const forbiddenZone = Zone.current.fork({
            name: `forbidden-${name}`
        });
        return forbiddenZone.run(cb);
    }
}
