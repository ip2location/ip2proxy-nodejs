export class IP2Proxy {
    /**
     * Reads bytes from file into buffer.
     *
     * @param readBytes The number of bytes to read.
     * @param position The file offset to start reading.
     * @returns buffer containing the read bytes.
     */
    readRow(readBytes: number, position: number): any;
    /**
     * Reads bytes from file into buffer asynchronously.
     *
     * @param readBytes The number of bytes to read.
     * @param position The file offset to start reading.
     * @returns The promise of the buffer containing the read bytes.
     */
    readRowAsync(readBytes: number, position: number): Promise<any>;
    /**
     * Reads bytes from file and convert to specified data type.
     *
     * @param readBytes The number of bytes to read.
     * @param position The file offset to start reading.
     * @param readType The data type to convert the bytes to. (Valid values: int8|int32|uint32|float|str|int128)
     * @param isBigInt Whether to convert to BigInt.
     * @returns The value of the specified data type.
     */
    readBin(readBytes: number, position: number, readType: string, isBigInt: boolean): any;
    /**
     * Reads unsigned 8-bit integer from file.
     *
     * @param position The file offset to start reading.
     * @returns Unsigned 8-bit integer.
     */
    read8(position: number): number;
    /**
     * Reads unsigned 8-bit integer from buffer.
     *
     * @param position The buffer offset to start reading.
     * @param buffer The buffer containing the data.
     * @returns Unsigned 8-bit integer.
     */
    read8Row(position: number, buffer: any): number;
    /**
     * Reads unsigned 32-bit integer from file.
     *
     * @param position The file offset to start reading.
     * @param isBigInt Whether to convert to BigInt.
     * @returns Unsigned 32-bit integer.
     */
    read32(position: number, isBigInt: boolean): number;
    /**
     * Reads unsigned 32-bit integer from buffer.
     *
     * @param position The buffer offset to start reading.
     * @param buffer The buffer containing the data.
     * @returns Unsigned 32-bit integer.
     */
    read32Row(position: number, buffer: any): number;
    /**
     * Reads unsigned 128-bit integer from buffer.
     *
     * @param position The buffer offset to start reading.
     * @param buffer The buffer containing the data.
     * @returns BigInt.
     */
    read128Row(position: number, buffer: any): any;
    /**
     * Reads either unsigned 32-bit or 128-bit integer from buffer.
     *
     * @param position The buffer offset to start reading.
     * @param buffer The buffer containing the data.
     * @param len The number of bytes to read.
     * @returns BigInt or unsigned 32-bit integer.
     */
    read32Or128Row(position: number, buffer: any, len: number): any;
    /**
     * Reads either unsigned 32-bit or 128-bit integer from file.
     *
     * @param position The file offset to start reading.
     * @param ipType 4 for IPv4 or 6 for IPv6.
     * @returns BigInt or unsigned 32-bit integer.
     */
    read32Or128(position: number, ipType: number): any;
    /**
     * Reads unsigned 128-bit integer from file.
     *
     * @param position The file offset to start reading.
     * @returns BigInt.
     */
    read128(position: number): any;
    /**
     * Reads string from file.
     *
     * @param position The file offset to start reading.
     * @returns String.
     */
    readStr(position: number): string;
    /**
     * Reads string from file asynchronously.
     *
     * @param position The file offset to start reading.
     * @returns The promise of the string.
     */
    readStrAsync(position: number): Promise<string>;
    /**
     * Reads BIN file metadata.
     *
     * @returns Whether metadata read successfully.
     */
    loadBin(): boolean;
    /**
     * Reads BIN file metadata asynchronously.
     *
     * @returns The promise of whether metadata read successfully.
     */
    loadBinAsync(): Promise<boolean>;
    /**
     * Initializes with BIN file path and pre-loads metadata.
     *
     * @param binPath The path to the BIN file.
     * @returns 0 if successful else -1 for errors.
     */
    open(binPath: string): 0 | -1;
    /**
     * Initializes with BIN file path and pre-loads metadata asynchronously.
     *
     * @param binPath The path to the BIN file.
     * @returns Promise of 0 if successful else -1 for errors.
     */
    openAsync(binPath: string): Promise<0 | -1>;
    /**
     * Resets metadata and closes file handle.
     *
     * @returns 0 if successful else -1 for errors.
     */
    close(): 0 | -1;
    /**
     * Retrieves proxy data into supplied object.
     *
     * @param myIP The IP address to query.
     * @param ipType 4 for IPv4 or 6 for IPv6.
     * @param data The object to store the results.
     * @param mode The fields to read.
     */
    proxyQueryData(myIP: string, ipType: number, data: any, mode: any): void;
    /**
     * Retrieves proxy data into supplied object asynchronously.
     *
     * @param myIP The IP address to query.
     * @param ipType 4 for IPv4 or 6 for IPv6.
     * @param data The object to store the results.
     * @param mode The fields to read.
     */
    proxyQueryDataAsync(myIP: string, ipType: number, data: any, mode: any): Promise<void>;
    /**
     * Performs validations and returns proxy data.
     *
     * @param myIP The IP address to query.
     * @param mode The fields to read.
     * @returns The proxy data.
     */
    proxyQuery(myIP: string, mode: any): {
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
        fraudScore: string;
    };
    /**
     * Performs validations and returns proxy data asynchronously.
     *
     * @param myIP The IP address to query.
     * @param mode The fields to read.
     * @returns The promise of the proxy data.
     */
    proxyQueryAsync(myIP: string, mode: any): Promise<{
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
        fraudScore: string;
    }>;
    /**
     * Returns the module version.
     *
     * @returns The module version.
     */
    getModuleVersion(): string;
    /**
     * Returns the database package.
     *
     * @returns The database package.
     */
    getPackageVersion(): number;
    /**
     * Returns the database version.
     *
     * @returns The database version.
     */
    getDatabaseVersion(): string;
    /**
     * Whether IP is a proxy server.
     *
     * @param myIP The IP address to query.
     * @returns -1 if error, 0 if not a proxy, 1 if proxy except DCH and SES, 2 if proxy and DCH or SES
     */
    isProxy(myIP: string): number;
    /**
     * Whether IP is a proxy server asynchronously.
     *
     * @param myIP The IP address to query.
     * @returns Promise of -1 if error, 0 if not a proxy, 1 if proxy except DCH and SES, 2 if proxy and DCH or SES
     */
    isProxyAsync(myIP: string): Promise<number>;
    /**
     * Returns the ISO 3166 country code.
     *
     * @param myIP The IP address to query.
     * @returns The country code.
     */
    getCountryShort(myIP: string): string;
    /**
     * Returns the ISO 3166 country code asynchronously.
     *
     * @param myIP The IP address to query.
     * @returns The promise of the country code.
     */
    getCountryShortAsync(myIP: string): Promise<string>;
    /**
     * Returns the country name.
     *
     * @param myIP The IP address to query.
     * @returns The country name.
     */
    getCountryLong(myIP: string): string;
    /**
     * Returns the country name asynchronously.
     *
     * @param myIP The IP address to query.
     * @returns The promise of the country name.
     */
    getCountryLongAsync(myIP: string): Promise<string>;
    /**
     * Returns the region or state.
     *
     * @param myIP The IP address to query.
     * @returns The region or state.
     */
    getRegion(myIP: string): string;
    /**
     * Returns the region or state asynchronously.
     *
     * @param myIP The IP address to query.
     * @returns The promise of the region or state.
     */
    getRegionAsync(myIP: string): Promise<string>;
    /**
     * Returns the city.
     *
     * @param myIP The IP address to query.
     * @returns The city.
     */
    getCity(myIP: string): string;
    /**
     * Returns the city asynchronously.
     *
     * @param myIP The IP address to query.
     * @returns The promise of the city.
     */
    getCityAsync(myIP: string): Promise<string>;
    /**
     * Returns the Internet Service Provider.
     *
     * @param myIP The IP address to query.
     * @returns The ISP.
     */
    getISP(myIP: string): string;
    /**
     * Returns the Internet Service Provider asynchronously.
     *
     * @param myIP The IP address to query.
     * @returns The promise of the ISP.
     */
    getISPAsync(myIP: string): Promise<string>;
    /**
     * Returns the proxy type.
     *
     * @param myIP The IP address to query.
     * @returns The proxy type.
     */
    getProxyType(myIP: string): string;
    /**
     * Returns the proxy type asynchronously.
     *
     * @param myIP The IP address to query.
     * @returns The promise of the proxy type.
     */
    getProxyTypeAsync(myIP: string): Promise<string>;
    /**
     * Returns the domain name.
     *
     * @param myIP The IP address to query.
     * @returns The domain name.
     */
    getDomain(myIP: string): string;
    /**
     * Returns the domain name asynchronously.
     *
     * @param myIP The IP address to query.
     * @returns The promise of the domain name.
     */
    getDomainAsync(myIP: string): Promise<string>;
    /**
     * Returns the usage type.
     *
     * @param myIP The IP address to query.
     * @returns The usage type.
     */
    getUsageType(myIP: string): string;
    /**
     * Returns the usage type asynchronously.
     *
     * @param myIP The IP address to query.
     * @returns The promise of the usage type.
     */
    getUsageTypeAsync(myIP: string): Promise<string>;
    /**
     * Returns the autonomous system number.
     *
     * @param myIP The IP address to query.
     * @returns The ASN.
     */
    getASN(myIP: string): string;
    /**
     * Returns the autonomous system number asynchronously.
     *
     * @param myIP The IP address to query.
     * @returns The promise of the ASN.
     */
    getASNAsync(myIP: string): Promise<string>;
    /**
     * Returns the autonomous system name.
     *
     * @param myIP The IP address to query.
     * @returns The AS.
     */
    getAS(myIP: string): string;
    /**
     * Returns the autonomous system name asynchronously.
     *
     * @param myIP The IP address to query.
     * @returns The promise of the AS.
     */
    getASAsync(myIP: string): Promise<string>;
    /**
     * Returns the number of days ago the proxy was last seen.
     *
     * @param myIP The IP address to query.
     * @returns The number of days ago the proxy was last seen.
     */
    getLastSeen(myIP: string): string;
    /**
     * Returns the number of days ago the proxy was last seen asynchronously.
     *
     * @param myIP The IP address to query.
     * @returns The promise of the number of days ago the proxy was last seen.
     */
    getLastSeenAsync(myIP: string): Promise<string>;
    /**
     * Returns the security threat reported.
     *
     * @param myIP The IP address to query.
     * @returns SPAM if spammer, SCANNER if network scanner, BOTNET if malware infected device.
     */
    getThreat(myIP: string): string;
    /**
     * Returns the security threat reported asynchronously.
     *
     * @param myIP The IP address to query.
     * @returns The promise of SPAM if spammer, SCANNER if network scanner, BOTNET if malware infected device.
     */
    getThreatAsync(myIP: string): Promise<string>;
    /**
     * Returns the name of the VPN provider.
     *
     * @param myIP The IP address to query.
     * @returns The name of the VPN provider.
     */
    getProvider(myIP: string): string;
    /**
     * Returns the name of the VPN provider asynchronously.
     *
     * @param myIP The IP address to query.
     * @returns The promise of the name of the VPN provider.
     */
    getProviderAsync(myIP: string): Promise<string>;
    /**
     * Returns the fraud score.
     *
     * @param myIP The IP address to query.
     * @returns The fraud score.
     */
    getFraudScore(myIP: string): string;
    /**
     * Returns the fraud score asynchronously.
     *
     * @param myIP The IP address to query.
     * @returns The promise of the fraud score.
     */
    getFraudScoreAsync(myIP: string): Promise<string>;
    /**
     * Returns all fields.
     *
     * @param myIP The IP address to query.
     * @returns All proxy fields.
     */
    getAll(myIP: string): {
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
        fraudScore: string;
    };
    /**
     * Returns all fields asynchronously.
     *
     * @param myIP The IP address to query.
     * @returns The promise of all proxy fields.
     */
    getAllAsync(myIP: string): Promise<{
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
        fraudScore: string;
    }>;
    #private;
}
export class IP2ProxyWebService {
    /**
     * Initializes with the IP2Proxy Web Service API key and the package to query.
     *
     * @param apiKey The IP2Proxy Web Service API key.
     * @param apiPackage The web service package to query.
     * @param useSSL Whether to use SSL to call the web service.
     */
    open(apiKey: string, apiPackage: string, useSSL?: boolean): void;
    /**
     * Performs parameter validations.
     *
     */
    checkParams(): void;
    /**
     * Queries the IP2Proxy Web Service for proxy data on the IP address.
     *
     * @param myIP The IP address to query.
     * @param callback Callback function to receive the proxy data.
     */
    lookup(myIP: string, callback: any): void;
    /**
     * Queries the IP2Proxy Web Service for credit balance.
     *
     * @param callback Callback function to receive the credit balance.
     */
    getCredit(callback: any): void;
    #private;
}