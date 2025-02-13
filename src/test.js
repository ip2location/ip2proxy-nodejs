const {IP2Proxy, IP2ProxyWebService} = require("ip2proxy-nodejs");
// const {IP2Proxy, IP2ProxyWebService} = require("./ip2proxy.js");

let ip2proxy = new IP2Proxy();

ip2proxy.open('PX12.BIN');

console.log("Module version " + ip2proxy.getModuleVersion());
console.log("Package version " + ip2proxy.getPackageVersion());
console.log("Database version " + ip2proxy.getDatabaseVersion());

testip = ['8.8.8.8', '199.83.103.79', '199.83.103.279'];

for (let x = 0; x < testip.length; x++) {
	result = ip2proxy.getAll(testip[x]);
	for (let key in result) {
		console.log(key + ": " + result[key]);
	}
	console.log("--------------------------------------------------------------");
}

ip2proxy.close();

let ws = new IP2ProxyWebService();

let ip = "8.8.8.8";
let apiKey = "YOUR_API_KEY";
let apiPackage = "PX12";
let useSSL = true;

ws.open(apiKey, apiPackage, useSSL);

ws.lookup(ip, (err, data) => {
	if (!err) {
		console.log(data);
		
		ws.getCredit((err, data) => {
			if (!err) {
				console.log(data);
			}
		});
	}
});

