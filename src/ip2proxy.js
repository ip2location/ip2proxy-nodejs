var net = require("net");
var fs = require("fs");
var bigInt = require("big-integer");

var fd;

var version = "2.0.0";
var binfile = "";
var IPv4ColumnSize = 0;
var IPv6ColumnSize = 0;
var low = 0;
var high = 0;
var mid = 0;

var maxindex = 65536;
var IndexArrayIPv4 = Array(maxindex);
var IndexArrayIPv6 = Array(maxindex);

var country_pos = [0, 2, 3, 3, 3, 3, 3, 3, 3];
var region_pos = [0, 0, 0, 4, 4, 4, 4, 4, 4];
var city_pos = [0, 0, 0, 5, 5, 5, 5, 5, 5];
var isp_pos = [0, 0, 0, 0, 6, 6, 6, 6, 6];
var proxytype_pos = [0, 0, 2, 2, 2, 2, 2, 2, 2];
var domain_pos = [0, 0, 0, 0, 0, 7, 7, 7, 7];
var usagetype_pos = [0, 0, 0, 0, 0, 0, 8, 8, 8];
var asn_pos = [0, 0, 0, 0, 0, 0, 0, 9, 9];
var as_pos = [0, 0, 0, 0, 0, 0, 0, 10, 10];
var lastseen_pos = [0, 0, 0, 0, 0, 0, 0, 0, 11];


var country_pos_offset = 0;
var region_pos_offset = 0;
var city_pos_offset = 0;
var isp_pos_offset = 0;
var proxytype_pos_offset = 0;
var domain_pos_offset = 0;
var usagetype_pos_offset = 0;
var asn_pos_offset = 0;
var as_pos_offset = 0;
var lastseen_pos_offset = 0;

var country_enabled = 0;
var region_enabled = 0;
var city_enabled = 0;
var isp_enabled = 0;
var proxytype_enabled = 0;
var domain_enabled = 0;
var usagetype_enabled = 0;
var asn_enabled = 0;
var as_enabled = 0;
var lastseen_enabled = 0;

var MAX_IPV4_RANGE = bigInt(4294967295);
var MAX_IPV6_RANGE = bigInt("340282366920938463463374607431768211455");

var mydb = {
	"_DBType": 0,
	"_DBColumn": 0,
	"_DBYear": 0,
	"_DBMonth": 0,
	"_DBDay": 0,
	"_DBCount": 0,
	"_BaseAddr": 0,
	"_DBCountIPv6": 0,
	"_BaseAddrIPv6": 0,
	"_IndexBaseAddr": 0,
	"_IndexBaseAddrIPv6": 0
};

var modes = {
	"COUNTRY_SHORT": 1,
	"COUNTRY_LONG": 2,
	"REGION": 3,
	"CITY": 4,
	"ISP": 5,
	"PROXY_TYPE": 6,
	"IS_PROXY": 7,
	"DOMAIN": 8,
	"USAGE_TYPE": 9,
	"ASN": 10,
	"AS": 11,
	"LAST_SEEN": 12,
	"ALL": 100
};

var MSG_NOT_SUPPORTED = "NOT SUPPORTED";
var MSG_INVALID_IP = "INVALID IP ADDRESS";
var MSG_MISSING_FILE = "MISSING FILE";
var MSG_IPV6_UNSUPPORTED = "IPV6 ADDRESS MISSING IN IPV4 BIN";

// Read binary data
function readbin(readbytes, pos, readtype, isbigint) {
	var buff = new Buffer.alloc(readbytes);
	totalread = fs.readSync(fd, buff, 0, readbytes, pos);
	
	if (totalread == readbytes) {
		switch (readtype) {
			case "int8":
				return buff.readUInt8(0);
				break;
			case "int32":
				return buff.readInt32LE(0);
				break;
			case "uint32":
				return (isbigint) ? bigInt(buff.readUInt32LE(0)) : buff.readUInt32LE(0);
				break;
			case "float":
				return buff.readFloatLE(0);
				break;
			case "str":
				return buff.toString("utf8");
				break;
			case "int128":
				var mybig = bigInt(); // zero
				var bitshift = 8;
				for (var x = 0; x < 16; x++) {
					mybig = mybig.add(bigInt(buff.readUInt8(x)).shiftLeft(bitshift * x));
				}
				return mybig;
				break;
		}
	}
	else {
		return 0;
	}
}

// Read 8 bits integer in the database
function read8(pos) {
	readbytes = 1;
	return readbin(readbytes, pos - 1, "int8");
}

// Read 32 bits integer in the database
function read32(pos, isbigint) {
	readbytes = 4;
	return readbin(readbytes, pos - 1, "uint32", isbigint);
}

// Read 32 bits float in the database
function readfloat(pos) {
	readbytes = 4;
	return readbin(readbytes, pos - 1, "float");
}

function read32or128(pos, iptype) {
	if (iptype == 4) {
		return read32(pos, true); // should be bigInt here already
	}
	else if (iptype == 6) {
		return read128(pos); // only IPv6 will run this; already returning bigInt object
	}
	else {
		return 0;
	}
}

// Read 128 bits integer in the database
function read128(pos) {
	readbytes = 16;
	return readbin(readbytes, pos - 1, "int128"); // returning bigInt object
}

// Read strings in the database
function readstr(pos) {
	readbytes = 1;
	return readbin(readbin(readbytes, pos, "int8"), pos + 1, "str");
}

// Convert IPv4 address to number
function dot2num(IPv4) {
	var d = IPv4.split('.');
	return ((((((+d[0])*256)+(+d[1]))*256)+(+d[2]))*256)+(+d[3]);
}

// Convert IPv6 address to number
function ip2no(IPv6) {
	var maxsections = 8; // should have 8 sections
	var sectionbits = 16; // 16 bits per section
	var m = IPv6.split('::');
	
	var total = bigInt(); // zero
	
	if (m.length == 2) {
		var myarrleft = (m[0] != '') ? m[0].split(":") : [];
		var myarrright = (m[1] != '') ? m[1].split(":") : [];
		var myarrmid = maxsections - myarrleft.length - myarrright.length;
		
		for (var x = 0; x < myarrleft.length; x++) {
			total = total.add(bigInt(parseInt("0x" + myarrleft[x])).shiftLeft((maxsections - (x + 1)) * sectionbits));
		}
		
		for (var x = 0; x < myarrright.length; x++) {
			total = total.add(bigInt(parseInt("0x" + myarrright[x])).shiftLeft((myarrright.length - (x + 1)) * sectionbits));
		}
	}
	else if (m.length == 1) {
		var myarr = m[0].split(":");
		
		for (var x = 0; x < myarr.length; x++) {
			total = total.add(bigInt(parseInt("0x" + myarr[x])).shiftLeft((maxsections - (x + 1)) * sectionbits));
		}
	}
	
	return total;
}

// Read metadata and indexes
function loadbin() {
	var loadok = false;
	
	try {
		if (binfile && (binfile != "")) {
			fd = fs.openSync(binfile, 'r');
			
			mydb._DBType = read8(1);
			mydb._DBColumn = read8(2);
			mydb._DBYear = read8(3);
			mydb._DBMonth = read8(4);
			mydb._DBDay = read8(5);
			mydb._DBCount = read32(6);
			mydb._BaseAddr = read32(10);
			mydb._DBCountIPv6 = read32(14);
			mydb._BaseAddrIPv6 = read32(18);
			mydb._IndexBaseAddr = read32(22);
			mydb._IndexBaseAddrIPv6 = read32(26);
			
			IPv4ColumnSize = mydb._DBColumn << 2; // 4 bytes each column
			IPv6ColumnSize = 16 + ((mydb._DBColumn - 1) << 2); // 4 bytes each column, except IPFrom column which is 16 bytes
			
			var dbt = mydb._DBType;
			
			// since both IPv4 and IPv6 use 4 bytes for the below columns, can just do it once here
			country_pos_offset = (country_pos[dbt] != 0) ? (country_pos[dbt] - 1) << 2 : 0;
			region_pos_offset = (region_pos[dbt] != 0) ? (region_pos[dbt] - 1) << 2 : 0;
			city_pos_offset = (city_pos[dbt] != 0) ? (city_pos[dbt] - 1) << 2 : 0;
			isp_pos_offset = (isp_pos[dbt] != 0) ? (isp_pos[dbt] - 1) << 2 : 0;
			proxytype_pos_offset = (proxytype_pos[dbt] != 0) ? (proxytype_pos[dbt] - 1) << 2 : 0;
			domain_pos_offset = (domain_pos[dbt] != 0) ? (domain_pos[dbt] - 1) << 2 : 0;
			usagetype_pos_offset = (usagetype_pos[dbt] != 0) ? (usagetype_pos[dbt] - 1) << 2 : 0;
			asn_pos_offset = (asn_pos[dbt] != 0) ? (asn_pos[dbt] - 1) << 2 : 0;
			as_pos_offset = (as_pos[dbt] != 0) ? (as_pos[dbt] - 1) << 2 : 0;
			lastseen_pos_offset = (lastseen_pos[dbt] != 0) ? (lastseen_pos[dbt] - 1) << 2 : 0;
			
			country_enabled = (country_pos[dbt] != 0) ? 1 : 0;
			region_enabled = (region_pos[dbt] != 0) ? 1 : 0;
			city_enabled = (city_pos[dbt] != 0) ? 1 : 0;
			isp_enabled = (isp_pos[dbt] != 0) ? 1 : 0;
			proxytype_enabled = (proxytype_pos[dbt] != 0) ? 1 : 0;
			domain_enabled = (domain_pos[dbt] != 0) ? 1 : 0;
			usagetype_enabled = (usagetype_pos[dbt] != 0) ? 1 : 0;
			asn_enabled = (asn_pos[dbt] != 0) ? 1 : 0;
			as_enabled = (as_pos[dbt] != 0) ? 1 : 0;
			lastseen_enabled = (lastseen_pos[dbt] != 0) ? 1 : 0;
			
			var pointer = mydb._IndexBaseAddr;
			
			for (var x = 0; x < maxindex; x++) {
				IndexArrayIPv4[x] = Array(2);
				IndexArrayIPv4[x][0] = read32(pointer);
				IndexArrayIPv4[x][1] = read32(pointer + 4);
				pointer += 8;
			}
			
			if (mydb._IndexBaseAddrIPv6 > 0) {
				for (var x = 0; x < maxindex; x++) {
					IndexArrayIPv6[x] = Array(2);
					IndexArrayIPv6[x][0] = read32(pointer);
					IndexArrayIPv6[x][1] = read32(pointer + 4);
					pointer += 8;
				}
			}
			loadok = true;
		}
	}
	catch(err) {
		// do nothing for now
	}
	return loadok;
}

// Initialize the module with the path to the IP2Proxy BIN file
exports.Open = function Open(binpath) {
	if (mydb._DBType == 0) {
		binfile = binpath;
		
		if (!loadbin()) { // problems reading BIN
			return -1;
		}
		else {
			return 0;
		}
	}
	else {
		return 0;
	}
}

// Resets the module
exports.Close = function Close() {
	try {
		mydb._BaseAddr = 0;
		mydb._DBCount = 0;
		mydb._DBColumn = 0;
		mydb._DBType = 0;
		mydb._DBDay = 0;
		mydb._DBMonth = 0;
		mydb._DBYear = 0;
		mydb._BaseAddrIPv6 = 0;
		mydb._DBCountIPv6 = 0;
		mydb._IndexBaseAddr = 0;
		mydb._IndexBaseAddrIPv6 = 0;
		return 0;
	}
	catch(err) {
		return -1;
	}
}

function loadmesg(data, mesg) {
	for (var key in data) {
	if (/^(is_proxy|ip|ip_no)$/i.test(key) === false) {
			data[key] = mesg;
		}
	}
}

function proxyquery_data(myIP, iptype, data, mode) {
	_DBType = mydb._DBType;
	_DBColumn = mydb._DBColumn;
	low = 0;
	mid = 0;
	high = 0;
	countrypos = 0;
	var MAX_IP_RANGE = bigInt();
	
	if (iptype == 4) { // IPv4
		MAX_IP_RANGE = MAX_IPV4_RANGE;
		high = mydb._DBCount;
		_BaseAddr = mydb._BaseAddr;
		_ColumnSize = IPv4ColumnSize;
		ipnum = dot2num(myIP);
		
		indexaddr = ipnum >>> 16;
		low = IndexArrayIPv4[indexaddr][0];
		high = IndexArrayIPv4[indexaddr][1];
	}
	else if (iptype == 6) { // IPv6
		MAX_IP_RANGE = MAX_IPV6_RANGE;
		high = mydb._DBCountIPv6;
		_BaseAddr = mydb._BaseAddrIPv6;
		_ColumnSize = IPv6ColumnSize;
		ipnum = ip2no(myIP);
		
		indexaddr = ipnum.shiftRight(112).toJSNumber();
		low = IndexArrayIPv6[indexaddr][0];
		high = IndexArrayIPv6[indexaddr][1];
	}
	
	data.IP = myIP;
	ipnum = bigInt(ipnum);
	
	if (ipnum.geq(MAX_IP_RANGE)) {
		ipnum = MAX_IP_RANGE.minus(1);
	}
	
	data.IP_No = ipnum.toString();
		
	while (low <= high) {
		mid = parseInt((low + high) / 2);
		rowoffset = _BaseAddr + (mid * _ColumnSize)
		rowoffset2 = rowoffset + _ColumnSize
		
		var ipfrom = read32or128(rowoffset, iptype);
		var ipto = read32or128(rowoffset2, iptype);
		
		ipfrom = bigInt(ipfrom);
		ipto = bigInt(ipto);
		
		if (ipfrom.leq(ipnum) && ipto.gt(ipnum)) {
			loadmesg(data, MSG_NOT_SUPPORTED); // load default message
			
			if (iptype == 6) { // IPv6
				rowoffset = rowoffset + 12; // coz below is assuming all columns are 4 bytes, so got 12 left to go to make 16 bytes total
			}
			
			if (proxytype_enabled) {
				if (mode == modes.ALL || mode == modes.PROXY_TYPE || mode == modes.IS_PROXY) {
					data.Proxy_Type = readstr(read32(rowoffset + proxytype_pos_offset));
				}
			}
			
			if (country_enabled) {
				if (mode == modes.ALL || mode == modes.COUNTRY_SHORT || mode == modes.COUNTRY_LONG || mode == modes.IS_PROXY) {
					countrypos = read32(rowoffset + country_pos_offset);
				}
				if (mode == modes.ALL || mode == modes.COUNTRY_SHORT || mode == modes.IS_PROXY) {
					data.Country_Short = readstr(countrypos);
				}
				if (mode == modes.ALL || mode == modes.COUNTRY_LONG) {
					data.Country_Long = readstr(countrypos + 3);
				}
			}
			
			if (region_enabled) {
				if (mode == modes.ALL || mode == modes.REGION) {
					data.Region = readstr(read32(rowoffset + region_pos_offset));
				}
			}
			
			if (city_enabled) {
				if (mode == modes.ALL || mode == modes.CITY) {
					data.City = readstr(read32(rowoffset + city_pos_offset));
				}
			}
			if (isp_enabled) {
				if (mode == modes.ALL || mode == modes.ISP) {
					data.ISP = readstr(read32(rowoffset + isp_pos_offset));
				}
			}
			if (domain_enabled) {
				if (mode == modes.ALL || mode == modes.DOMAIN) {
					data.Domain = readstr(read32(rowoffset + domain_pos_offset));
				}
			}
			if (usagetype_enabled) {
				if (mode == modes.ALL || mode == modes.USAGE_TYPE) {
					data.Usage_Type = readstr(read32(rowoffset + usagetype_pos_offset));
				}
			}
			if (asn_enabled) {
				if (mode == modes.ALL || mode == modes.ASN) {
					data.ASN = readstr(read32(rowoffset + asn_pos_offset));
				}
			}
			if (as_enabled) {
				if (mode == modes.ALL || mode == modes.AS) {
					data.AS = readstr(read32(rowoffset + as_pos_offset));
				}
			}
			if (lastseen_enabled) {
				if (mode == modes.ALL || mode == modes.LAST_SEEN) {
					data.Last_Seen = readstr(read32(rowoffset + lastseen_pos_offset));
				}
			}
			
			if (data.Country_Short == "-" || data.Proxy_Type == "-") {
				data.Is_Proxy = 0;
			}
			else {
				if ((data.Proxy_Type == "DCH") || (data.Proxy_Type == "SES")) {
					data.Is_Proxy = 2;
				}
				else {
					data.Is_Proxy = 1;
				}
			}
			return;
		}
		else {
			if (ipfrom.gt(ipnum)) {
				high = mid - 1;
			}
			else {
				low = mid + 1;
			}
		}
	}
	loadmesg(data, MSG_INVALID_IP);
}

function proxyquery(myIP, mode) {
	var data = {
		// "IP": "?",
		// "IP_No": "?",
		"Is_Proxy": -1,
		"Proxy_Type": "?",
		"Country_Short": "?",
		"Country_Long": "?",
		"Region": "?",
		"City": "?",
		"ISP": "?",
		"Domain": "?",
		"Usage_Type": "?",
		"ASN": "?",
		"AS": "?",
		"Last_Seen": "?"
	};
	
	if (/^[:0]+:F{4}:(\d+\.){3}\d+$/i.test(myIP)) {
		myIP = myIP.replace(/^[:0]+:F{4}:/i, '');
	}
	else if (/^[:0]+:(\d+\.){3}\d+$/i.test(myIP)) {
		myIP = myIP.replace(/^[:0]+:/i, '');
	}
	
	iptype = net.isIP(myIP);
	
	if (iptype == 0) {
		loadmesg(data, MSG_INVALID_IP);
		return data;
	}
	else if ((!binfile) || (binfile == "") || (!fs.existsSync(binfile))) {
		loadmesg(data, MSG_MISSING_FILE);
		return data;
	}
	else if (mydb._DBType == 0) {
		loadmesg(data, MSG_MISSING_FILE);
		return data;
	}
	else if ((iptype == 6) && (mydb._DBCountIPv6 == 0)) {
		loadmesg(data, MSG_IPV6_UNSUPPORTED);
		return data;
	}
	else {
		proxyquery_data(myIP, iptype, data, mode);
		return data;
	}
}

// Returns the module version
exports.getModuleVersion = function getModuleVersion() {
	return version;
}

// Returns the package version
exports.getPackageVersion = function getPackageVersion() {
	return mydb._DBType;
}

// Returns the IP database version
exports.getDatabaseVersion = function getDatabaseVersion() {
	return "20" + mydb._DBYear + "." + mydb._DBMonth + "." + mydb._DBDay;
}

// Returns an integer to state if is proxy
exports.isProxy = function isProxy(myIP) {
	// -1 is error
	// 0 is not a proxy
	// 1 is proxy except DCH and SES
	// 2 is proxy and DCH or SES
	data = proxyquery(myIP, modes.IS_PROXY);
	return data.Is_Proxy;
}

// Returns a string for the country code
exports.getCountryShort = function getCountryShort(myIP) {
	data = proxyquery(myIP, modes.COUNTRY_SHORT);
	return data.Country_Short;
}

// Returns a string for the country name
exports.getCountryLong = function getCountryLong(myIP) {
	data = proxyquery(myIP, modes.COUNTRY_LONG);
	return data.Country_Long;
}

// Returns a string for the region name
exports.getRegion = function getRegion(myIP) {
	data = proxyquery(myIP, modes.REGION);
	return data.Region;
}

// Returns a string for the city name
exports.getCity = function getCity(myIP) {
	data = proxyquery(myIP, modes.CITY);
	return data.City;
}

// Returns a string for the ISP name
exports.getISP = function getISP(myIP) {
	data = proxyquery(myIP, modes.ISP);
	return data.ISP;
}

// Returns a string for the proxy type
exports.getProxyType = function getProxyType(myIP) {
	data = proxyquery(myIP, modes.PROXY_TYPE);
	return data.Proxy_Type;
}

// Returns a string for the domain
exports.getDomain = function getDomain(myIP) {
	data = proxyquery(myIP, modes.DOMAIN);
	return data.Domain;
}

// Returns a string for the usage type
exports.getUsageType = function getUsageType(myIP) {
	data = proxyquery(myIP, modes.USAGE_TYPE);
	return data.Usage_Type;
}

// Returns a string for the ASN
exports.getASN = function getASN(myIP) {
	data = proxyquery(myIP, modes.ASN);
	return data.ASN;
}

// Returns a string for the AS
exports.getAS = function getAS(myIP) {
	data = proxyquery(myIP, modes.AS);
	return data.AS;
}

// Returns a string for the last seen
exports.getLastSeen = function getLastSeen(myIP) {
	data = proxyquery(myIP, modes.LAST_SEEN);
	return data.Last_Seen;
}

// Returns all results
exports.getAll = function getAll(myIP) {
	data = proxyquery(myIP, modes.ALL);
	return data;
}
