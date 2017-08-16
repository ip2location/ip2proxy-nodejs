IP2Proxy Node.js Module
=======================
This is the Node.js module to detect proxy servers with country, region, city, ISP and proxy type information using IP2Proxy binary database.

IP2Proxy database contains a list of daily-updated IP addresses which are being used as VPN anonymizer, open proxies, web proxies and Tor exits. The database includes records for IPv4 addresses.

You can access to the commercial databases from https://www.ip2location.com/proxy-database or use the free IP2Proxy LITE database from http://lite.ip2location.com


Installation
============

To install this module type the following:

    npm install ip2proxy-nodejs


Example
=======

```javascript

var ip2proxy = require("ip2proxy-nodejs");

ip2proxy.Open("./IP2PROXY-IP-PROXYTYPE-COUNTRY-REGION-CITY-ISP.BIN");

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

ip2proxy.Close();

```


Copyright
=========
Copyright (C) 2017 by IP2Location.com

Licensed under LGPLv3