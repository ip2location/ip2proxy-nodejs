# IP2Proxy Node.js Module

This module allows user to query an IP address if it was being used as open proxy, web proxy, VPN anonymizer and TOR exits. It lookup the proxy IP address from **IP2Proxy BIN Data** file. This data file can be downloaded at

* Free IP2Proxy BIN Data: https://lite.ip2location.com
* Commercial IP2Proxy BIN Data: https://www.ip2location.com/proxy-database


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
|getPackageVersion|Get the package version (1 to 4 for PX1 to PX4 respectively).|
|getModuleVersion|Get the module version.|
|getDatabaseVersion|Get the database version.|
|isProxy|Check whether if an IP address was a proxy. Returned value:<ul><li>-1 : errors</li><li>0 : not a proxy</li><li>1 : a proxy</li><li>2 : a data center IP address</li></ul>|
|getAll|Return the proxy information in an object.|
|getProxyType|Return the proxy type. Please visit <a href="https://www.ip2location.com/databases/px4-ip-proxytype-country-region-city-isp" target="_blank">IP2Location</a> for the list of proxy types supported|
|getCountryShort|Return the ISO3166-1 country code (2-digits) of the proxy.|
|getCountryLong|Return the ISO3166-1 country name of the proxy.|
|getRegion|Return the ISO3166-2 region name of the proxy. Please visit <a href="https://www.ip2location.com/free/iso3166-2" target="_blank">ISO3166-2 Subdivision Code</a> for the information of ISO3166-2 supported|
|getCity|Return the city name of the proxy.|
|getISP|Return the ISP name of the proxy.|

## Usage

```javascript

var ip2proxy = require("ip2proxy-nodejs");

if (ip2proxy.Open("./IP2PROXY-IP-PROXYTYPE-COUNTRY-REGION-CITY-ISP.BIN") == 0) {
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

	// function for all fields
	var all = ip2proxy.getAll(ip);
	console.log("isProxy: " + all.Is_Proxy);
	console.log("ProxyType: " + all.Proxy_Type);
	console.log("CountryShort: " + all.Country_Short);
	console.log("CountryLong: " + all.Country_Long);
	console.log("Region: " + all.Region);
	console.log("City: " + all.City);
	console.log("ISP: " + all.ISP);
}
else {
	console.log("Error reading BIN file.");
}
ip2proxy.Close();

```
