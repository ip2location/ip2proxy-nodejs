// var ip2proxy = require("./ip2proxy.js");
var ip2proxy = require("ip2proxy-nodejs");

ip2proxy.Open("PX8.BIN");

testip = ['8.8.8.8', '199.83.103.79'];

for (var x = 0; x < testip.length; x++) {
	result = ip2proxy.getAll(testip[x]);
	for (var key in result) {
		console.log(key + ": " + result[key]);
	}
	// console.log(result);
	console.log("--------------------------------------------------------------");
}
