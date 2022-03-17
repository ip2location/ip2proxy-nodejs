export class IP2Proxy {
    readRow(readBytes: any, position: any): any;
    readBin(readBytes: any, position: any, readType: any, isBigInt: any): any;
    read8(position: any): any;
    read32(position: any, isBigInt: any): any;
    read32Row(position: any, buffer: any): any;
    read32Or128(position: any, ipType: any): any;
    read128(position: any): any;
    readStr(position: any): any;
    loadBin(): boolean;
    open(binPath: any): 0 | -1;
    close(): 0 | -1;
    proxyQueryData(myIP: any, ipType: any, data: any, mode: any): void;
    proxyQuery(myIP: any, mode: any): {
        ip: string;
        ipNo: string;
        isProxy: number;
        proxyType: string;
        countryShort: string;
        countryLong: string;
        region: string;
        city: string;
        isp: string;
        domain: string;
        usageType: string;
        asn: string;
        as: string;
        lastSeen: string;
        threat: string;
        provider: string;
    };
    getModuleVersion(): string;
    getPackageVersion(): number;
    getDatabaseVersion(): string;
    isProxy(myIP: any): number;
    getCountryShort(myIP: any): string;
    getCountryLong(myIP: any): string;
    getRegion(myIP: any): string;
    getCity(myIP: any): string;
    getISP(myIP: any): string;
    getProxyType(myIP: any): string;
    getDomain(myIP: any): string;
    getUsageType(myIP: any): string;
    getASN(myIP: any): string;
    getAS(myIP: any): string;
    getLastSeen(myIP: any): string;
    getThreat(myIP: any): string;
    getProvider(myIP: any): string;
    getAll(myIP: any): {
        ip: string;
        ipNo: string;
        isProxy: number;
        proxyType: string;
        countryShort: string;
        countryLong: string;
        region: string;
        city: string;
        isp: string;
        domain: string;
        usageType: string;
        asn: string;
        as: string;
        lastSeen: string;
        threat: string;
        provider: string;
    };
    #private;
}
export class IP2ProxyWebService {
    open(apiKey: any, apiPackage: any, useSSL?: boolean): void;
    checkParams(): void;
    lookup(myIP: any, callback: any): void;
    getCredit(callback: any): void;
    #private;
}
