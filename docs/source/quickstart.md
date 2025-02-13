# Quickstart

## Dependencies

This library requires IP2Proxy BIN database to function. You may download the BIN database at

-   IP2Proxy LITE BIN Data (Free): <https://lite.ip2location.com>
-   IP2Proxy Commercial BIN Data (Comprehensive):
    <https://www.ip2location.com>

## Installation

Install this package using the command as below:

```bash

npm install ip2proxy-nodejs

```

## Sample Codes

### Query proxy information from BIN database

You can query the proxy information from the IP2Proxy BIN database as below:

```javascript
const {IP2Proxy} = require("ip2proxy-nodejs");

let ip2proxy = new IP2Proxy();

if (ip2proxy.open("./IP2PROXY-IP-PROXYTYPE-COUNTRY-REGION-CITY-ISP-DOMAIN-USAGETYPE-ASN-LASTSEEN-THREAT-RESIDENTIAL-PROVIDER-FRAUDSCORE.BIN") == 0) {
	ip = '199.83.103.79';
	
	console.log("GetModuleVersion: " + ip2proxy.getModuleVersion());
	console.log("GetPackageVersion: " + ip2proxy.getPackageVersion());
	console.log("GetDatabaseVersion: " + ip2proxy.getDatabaseVersion());
	
	// functions for individual fields
	console.log("isProxy: " + ip2proxy.isProxy(ip));
	console.log("ProxyType: " + ip2proxy.getProxyType(ip));
	console.log("CountryShort: " + ip2proxy.getCountryShort(ip));
	console.log("CountryLong: " + ip2proxy.getCountryLong(ip));
	console.log("Region: " + ip2proxy.getRegion(ip));
	console.log("City: " + ip2proxy.getCity(ip));
	console.log("ISP: " + ip2proxy.getISP(ip));
	console.log("Domain: " + ip2proxy.getDomain(ip));
	console.log("UsageType: " + ip2proxy.getUsageType(ip));
	console.log("ASN: " + ip2proxy.getASN(ip));
	console.log("AS: " + ip2proxy.getAS(ip));
	console.log("LastSeen: " + ip2proxy.getLastSeen(ip));
	console.log("Threat: " + ip2proxy.getThreat(ip));
	console.log("Provider: " + ip2proxy.getProvider(ip));
	console.log("FraudScore: " + ip2proxy.getFraudScore(ip));
	
	// function for all fields
	let all = ip2proxy.getAll(ip);
	console.log("isProxy: " + all.isProxy);
	console.log("proxyType: " + all.proxyType);
	console.log("countryShort: " + all.countryShort);
	console.log("countryLong: " + all.countryLong);
	console.log("region: " + all.region);
	console.log("city: " + all.city);
	console.log("isp: " + all.isp);
	console.log("domain: " + all.domain);
	console.log("usagetype: " + all.usageType);
	console.log("asn: " + all.asn);
	console.log("as: " + all.as);
	console.log("lastSeen: " + all.lastSeen);
	console.log("threat: " + all.threat);
	console.log("provider: " + all.provider);
	console.log("fraudScore: " + all.fraudScore);
}
else {
	console.log("Error reading BIN file.");
}
ip2proxy.close();
```

You can query the proxy information asynchronously from the IP2Proxy BIN database as below:

```javascript
const {IP2Proxy} = require("ip2proxy-nodejs");

let ip2proxy = new IP2Proxy();

ip2proxy.openAsync("./IP2PROXY-IP-PROXYTYPE-COUNTRY-REGION-CITY-ISP-DOMAIN-USAGETYPE-ASN-LASTSEEN-THREAT-RESIDENTIAL-PROVIDER-FRAUDSCORE.BIN").then((status) => {
	if (status == 0) {
		ip = '199.83.103.79';
		ip2proxy.getAllAsync(ip).then(all => {
			console.log("isProxy: " + all.isProxy);
			console.log("proxyType: " + all.proxyType);
			console.log("countryShort: " + all.countryShort);
			console.log("countryLong: " + all.countryLong);
			console.log("region: " + all.region);
			console.log("city: " + all.city);
			console.log("isp: " + all.isp);
			console.log("domain: " + all.domain);
			console.log("usagetype: " + all.usageType);
			console.log("asn: " + all.asn);
			console.log("as: " + all.as);
			console.log("lastSeen: " + all.lastSeen);
			console.log("threat: " + all.threat);
			console.log("provider: " + all.provider);
			console.log("fraudScore: " + all.fraudScore);
		});
	}
	else {
		console.log("Error reading BIN.");
	}
});

```

