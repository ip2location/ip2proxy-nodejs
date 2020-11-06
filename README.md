[![npm](https://img.shields.io/npm/v/ip2proxy-nodejs.svg)](http://npm.im/ip2proxy-nodejs)
[![npm](https://img.shields.io/npm/dm/ip2proxy-nodejs.svg)](http://npm.im/ip2proxy-nodejs)

# IP2Proxy Node.js Module

This module allows user to query an IP address if it was being used as VPN anonymizer, open proxies, web proxies, Tor exits, data center, web hosting (DCH) range, search engine robots (SES) and residential (RES). It lookup the proxy IP address from **IP2Proxy BIN Data** file. This data file can be downloaded at

* Free IP2Proxy BIN Data: https://lite.ip2location.com
* Commercial IP2Proxy BIN Data: https://www.ip2location.com/database/ip2proxy


## Installation

To install this module type the following:

```bash

npm install ip2proxy-nodejs

```

## Methods
Below are the methods supported in this class.

|Method Name|Description|
|---|---|
|Open|Open the IP2Proxy BIN data for lookup.|
|Close|Close and clean up the file pointer.|
|getPackageVersion|Get the package version (1 to 10 for PX1 to PX10 respectively).|
|getModuleVersion|Get the module version.|
|getDatabaseVersion|Get the database version.|
|isProxy|Check whether if an IP address was a proxy. Returned value:<ul><li>-1 : errors</li><li>0 : not a proxy</li><li>1 : a proxy</li><li>2 : a data center IP address or search engine robot</li></ul>|
|getAll|Return the proxy information in an object.|
|getProxyType|Return the proxy type. Please visit <a href="https://www.ip2location.com/database/px10-ip-proxytype-country-region-city-isp-domain-usagetype-asn-lastseen-threat-residential" target="_blank">IP2Location</a> for the list of proxy types supported|
|getCountryShort|Return the ISO3166-1 country code (2-digits) of the proxy.|
|getCountryLong|Return the ISO3166-1 country name of the proxy.|
|getRegion|Return the ISO3166-2 region name of the proxy. Please visit <a href="https://www.ip2location.com/free/iso3166-2" target="_blank">ISO3166-2 Subdivision Code</a> for the information of ISO3166-2 supported|
|getCity|Return the city name of the proxy.|
|getISP|Return the ISP name of the proxy.|
|getDomain|Return the domain name of the proxy.|
|getUsageType|Return the usage type classification of the proxy. Please visit <a href="https://www.ip2location.com/database/px10-ip-proxytype-country-region-city-isp-domain-usagetype-asn-lastseen-threat-residential" target="_blank">IP2Location</a> for the list of usage types supported.|
|getASN|Return the autonomous system number of the proxy.|
|getAS|Return the autonomous system name of the proxy.|
|getLastSeen|Return the number of days that the proxy was last seen.|
|getThreat|Return the threat type of the proxy.|

## Usage

```javascript

var ip2proxy = require("ip2proxy-nodejs");

if (ip2proxy.Open("./IP2PROXY-IP-PROXYTYPE-COUNTRY-REGION-CITY-ISP-DOMAIN-USAGETYPE-ASN-LASTSEEN-THREAT-RESIDENTIAL.BIN") == 0) {
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
	
	// function for all fields
	var all = ip2proxy.getAll(ip);
	console.log("isProxy: " + all.Is_Proxy);
	console.log("ProxyType: " + all.Proxy_Type);
	console.log("CountryShort: " + all.Country_Short);
	console.log("CountryLong: " + all.Country_Long);
	console.log("Region: " + all.Region);
	console.log("City: " + all.City);
	console.log("ISP: " + all.ISP);
	console.log("Domain: " + all.Domain);
	console.log("UsageType: " + all.Usage_Type);
	console.log("ASN: " + all.ASN);
	console.log("AS: " + all.AS);
	console.log("LastSeen: " + all.Last_Seen);
	console.log("Threat: " + all.Threat);
}
else {
	console.log("Error reading BIN file.");
}
ip2proxy.Close();

```
