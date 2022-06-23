var net = require("net");
var fs = require("fs");
var bigInt = require("big-integer");
var https = require("https");

// For BIN queries
const VERSION = "4.2.0";
const MAX_INDEX = 65536;
const COUNTRY_POSITION = [0, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
const REGION_POSITION = [0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4];
const CITY_POSITION = [0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5];
const ISP_POSITION = [0, 0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6];
const PROXY_TYPE_POSITION = [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
const DOMAIN_POSITION = [0, 0, 0, 0, 0, 7, 7, 7, 7, 7, 7, 7];
const USAGE_TYPE_POSITION = [0, 0, 0, 0, 0, 0, 8, 8, 8, 8, 8, 8];
const ASN_POSITION = [0, 0, 0, 0, 0, 0, 0, 9, 9, 9, 9, 9];
const AS_POSITION = [0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 10, 10];
const LAST_SEEN_POSITION = [0, 0, 0, 0, 0, 0, 0, 0, 11, 11, 11, 11];
const THREAT_POSITION = [0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 12, 12];
const PROVIDER_POSITION = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13];
const MAX_IPV4_RANGE = bigInt(4294967295);
const MAX_IPV6_RANGE = bigInt("340282366920938463463374607431768211455");
const FROM_6TO4 = bigInt("42545680458834377588178886921629466624");
const TO_6TO4 = bigInt("42550872755692912415807417417958686719");
const FROM_TEREDO = bigInt("42540488161975842760550356425300246528");
const TO_TEREDO = bigInt("42540488241204005274814694018844196863");
const LAST_32_BITS = bigInt("4294967295");
const MODES = {
  COUNTRY_SHORT: 1,
  COUNTRY_LONG: 2,
  REGION: 3,
  CITY: 4,
  ISP: 5,
  PROXY_TYPE: 6,
  IS_PROXY: 7,
  DOMAIN: 8,
  USAGE_TYPE: 9,
  ASN: 10,
  AS: 11,
  LAST_SEEN: 12,
  THREAT: 13,
  PROVIDER: 14,
  ALL: 100,
};
const MSG_NOT_SUPPORTED = "NOT SUPPORTED";
const MSG_INVALID_IP = "INVALID IP ADDRESS";
const MSG_MISSING_FILE = "MISSING FILE";
const MSG_IPV6_UNSUPPORTED = "IPV6 ADDRESS MISSING IN IPV4 BIN";
const MSG_INVALID_BIN =
  "Incorrect IP2Proxy BIN file format. Please make sure that you are using the latest IP2Proxy BIN file.";
const REGEX_TEXT_FIELD = /^(isproxy|ip|ipno)$/i;
const REGEX_IPV4_1_MATCH = /^[:0]+:F{4}:(\d+\.){3}\d+$/i;
const REGEX_IPV4_1_REPLACE = /^[:0]+:F{4}:/i;
const REGEX_IPV4_2_MATCH = /^[:0]+:(\d+\.){3}\d+$/i;
const REGEX_IPV4_2_REPLACE = /^[:0]+:/i;

// For API queries
const REGEX_API_KEY = /^[\dA-Z]{10}$/;
const REGEX_API_PACKAGE = /^PX\d+$/;
const BASE_URL = "api.ip2proxy.com/";
const MSG_INVALID_API_KEY = "Invalid API key.";
const MSG_INVALID_API_PACKAGE = "Invalid package name.";

// BIN query class
class IP2Proxy {
  #binFile = "";
  #indexArrayIPV4 = Array(MAX_INDEX);
  #indexArrayIPV6 = Array(MAX_INDEX);
  #ipV4ColumnSize = 0;
  #ipV6ColumnSize = 0;

  #countryPositionOffset = 0;
  #regionPositionOffset = 0;
  #cityPositionOffset = 0;
  #ispPositionOffset = 0;
  #proxyTypePositionOffset = 0;
  #domainPositionOffset = 0;
  #usageTypePositionOffset = 0;
  #asnPositionOffset = 0;
  #asPositionOffset = 0;
  #lastSeenPositionOffset = 0;
  #threatPositionOffset = 0;
  #providerPositionOffset = 0;

  #countryEnabled = 0;
  #regionEnabled = 0;
  #cityEnabled = 0;
  #ispEnabled = 0;
  #proxyTypeEnabled = 0;
  #domainEnabled = 0;
  #usageTypeEnabled = 0;
  #asnEnabled = 0;
  #asEnabled = 0;
  #lastSeenEnabled = 0;
  #threatEnabled = 0;
  #providerEnabled = 0;

  #myDB = {
    dbType: 0,
    dbColumn: 0,
    dbYear: 0,
    dbMonth: 0,
    dbDay: 0,
    dbCount: 0,
    baseAddress: 0,
    dbCountIPV6: 0,
    baseAddressIPV6: 0,
    indexed: 0,
    indexedIPV6: 0,
    indexBaseAddress: 0,
    indexBaseAddressIPV6: 0,
    productCode: 0,
    productType: 0,
    fileSize: 0,
  };
  #fd;

  constructor() {}

  // Read row data
  readRow(readBytes, position) {
    let buffer = new Buffer.alloc(readBytes);
    let totalRead = fs.readSync(this.#fd, buffer, 0, readBytes, position - 1);
    return buffer;
  }

  // Read binary data
  readBin(readBytes, position, readType, isBigInt) {
    let buffer = new Buffer.alloc(readBytes);
    let totalRead = fs.readSync(this.#fd, buffer, 0, readBytes, position);

    if (totalRead == readBytes) {
      switch (readType) {
        case "int8":
          return buffer.readUInt8(0);
          break;
        case "int32":
          return buffer.readInt32LE(0);
          break;
        case "uint32":
          return isBigInt
            ? bigInt(buffer.readUInt32LE(0))
            : buffer.readUInt32LE(0);
          break;
        case "float":
          return buffer.readFloatLE(0);
          break;
        case "str":
          return buffer.toString("utf8");
          break;
        case "int128":
          let myBig = bigInt(); // zero
          let bitShift = 8;
          for (let x = 0; x < 16; x++) {
            myBig = myBig.add(
              bigInt(buffer.readUInt8(x)).shiftLeft(bitShift * x)
            );
          }
          return myBig;
          break;
      }
    } else {
      return 0;
    }
  }

  // Read 8 bits integer in the database
  read8(position) {
    let readBytes = 1;
    return this.readBin(readBytes, position - 1, "int8");
  }

  // Read 8 bits integer in the buffer
  read8Row(position, buffer) {
    return buffer.readUInt8(position);
  }

  // Read 32 bits integer in the database
  read32(position, isBigInt) {
    let readBytes = 4;
    return this.readBin(readBytes, position - 1, "uint32", isBigInt);
  }

  // Read 32 bits integer in the buffer
  read32Row(position, buffer) {
    return buffer.readUInt32LE(position);
  }

  // Read 128 bits integer in the buffer
  read128Row(position, buffer) {
    let myBig = bigInt(); // zero
    let bitShift = 8;
    for (let x = 0; x < 16; x++) {
      let pos = position + x;
      myBig = myBig.add(
        bigInt(this.read8Row(pos, buffer)).shiftLeft(bitShift * x)
      );
    }
    return myBig;
  }

  read32Or128Row(position, buffer, len) {
    if (len == 4) {
      return this.read32Row(position, buffer);
    } else if (len == 16) {
      return this.read128Row(position, buffer);
    } else {
      return 0;
    }
  }

  read32Or128(position, ipType) {
    if (ipType == 4) {
      return this.read32(position, true);
    } else if (ipType == 6) {
      return this.read128(position);
    } else {
      return 0;
    }
  }

  // Read 128 bits integer in the database
  read128(position) {
    let readBytes = 16;
    return this.readBin(readBytes, position - 1, "int128");
  }

  // Read strings in the database
  readStr(position) {
    let readBytes = 256; // max size of string field + 1 byte for the length
    let row = this.readRow(readBytes, position + 1);
    let len = this.read8Row(0, row);
    return row.toString("utf8", 1, len + 1);
  }

  // Read metadata and indexes
  loadBin() {
    let loadOK = false;

    try {
      if (this.#binFile && this.#binFile != "") {
        this.#fd = fs.openSync(this.#binFile, "r");

        let len = 64; // 64-byte header
        let row = this.readRow(len, 1);

        this.#myDB.dbType = this.read8Row(0, row);
        this.#myDB.dbColumn = this.read8Row(1, row);
        this.#myDB.dbYear = this.read8Row(2, row);
        this.#myDB.dbMonth = this.read8Row(3, row);
        this.#myDB.dbDay = this.read8Row(4, row);
        this.#myDB.dbCount = this.read32Row(5, row);
        this.#myDB.baseAddress = this.read32Row(9, row);
        this.#myDB.dbCountIPV6 = this.read32Row(13, row);
        this.#myDB.baseAddressIPV6 = this.read32Row(17, row);
        this.#myDB.indexBaseAddress = this.read32Row(21, row);
        this.#myDB.indexBaseAddressIPV6 = this.read32Row(25, row);
        this.#myDB.productCode = this.read8Row(29, row);
        // below 2 fields just read for now, not being used yet
        this.#myDB.productType = this.read8Row(30, row);
        this.#myDB.fileSize = this.read32Row(31, row);

        // check if is correct BIN (should be 2 for IP2Proxy BIN file), also checking for zipped file (PK being the first 2 chars)
        if (
          (this.#myDB.productCode != 2 && this.#myDB.dbYear >= 21) ||
          (this.#myDB.dbType == 80 && this.#myDB.dbColumn == 75)
        ) {
          // only BINs from Jan 2021 onwards have this byte set
          throw new Error(MSG_INVALID_BIN);
        }

        if (this.#myDB.indexBaseAddress > 0) {
          this.#myDB.indexed = 1;
        }

        if (this.#myDB.dbCountIPV6 > 0 && this.#myDB.indexBaseAddressIPV6 > 0) {
          this.#myDB.indexedIPV6 = 1;
        }

        this.#ipV4ColumnSize = this.#myDB.dbColumn << 2; // 4 bytes each column
        this.#ipV6ColumnSize = 16 + ((this.#myDB.dbColumn - 1) << 2); // 4 bytes each column, except IPFrom column which is 16 bytes

        let dbt = this.#myDB.dbType;

        this.#countryPositionOffset =
          COUNTRY_POSITION[dbt] != 0 ? (COUNTRY_POSITION[dbt] - 2) << 2 : 0;
        this.#regionPositionOffset =
          REGION_POSITION[dbt] != 0 ? (REGION_POSITION[dbt] - 2) << 2 : 0;
        this.#cityPositionOffset =
          CITY_POSITION[dbt] != 0 ? (CITY_POSITION[dbt] - 2) << 2 : 0;
        this.#ispPositionOffset =
          ISP_POSITION[dbt] != 0 ? (ISP_POSITION[dbt] - 2) << 2 : 0;
        this.#proxyTypePositionOffset =
          PROXY_TYPE_POSITION[dbt] != 0
            ? (PROXY_TYPE_POSITION[dbt] - 2) << 2
            : 0;
        this.#domainPositionOffset =
          DOMAIN_POSITION[dbt] != 0 ? (DOMAIN_POSITION[dbt] - 2) << 2 : 0;
        this.#usageTypePositionOffset =
          USAGE_TYPE_POSITION[dbt] != 0
            ? (USAGE_TYPE_POSITION[dbt] - 2) << 2
            : 0;
        this.#asnPositionOffset =
          ASN_POSITION[dbt] != 0 ? (ASN_POSITION[dbt] - 2) << 2 : 0;
        this.#asPositionOffset =
          AS_POSITION[dbt] != 0 ? (AS_POSITION[dbt] - 2) << 2 : 0;
        this.#lastSeenPositionOffset =
          LAST_SEEN_POSITION[dbt] != 0 ? (LAST_SEEN_POSITION[dbt] - 2) << 2 : 0;
        this.#threatPositionOffset =
          THREAT_POSITION[dbt] != 0 ? (THREAT_POSITION[dbt] - 2) << 2 : 0;
        this.#providerPositionOffset =
          PROVIDER_POSITION[dbt] != 0 ? (PROVIDER_POSITION[dbt] - 2) << 2 : 0;

        this.#countryEnabled = COUNTRY_POSITION[dbt] != 0 ? 1 : 0;
        this.#regionEnabled = REGION_POSITION[dbt] != 0 ? 1 : 0;
        this.#cityEnabled = CITY_POSITION[dbt] != 0 ? 1 : 0;
        this.#ispEnabled = ISP_POSITION[dbt] != 0 ? 1 : 0;
        this.#proxyTypeEnabled = PROXY_TYPE_POSITION[dbt] != 0 ? 1 : 0;
        this.#domainEnabled = DOMAIN_POSITION[dbt] != 0 ? 1 : 0;
        this.#usageTypeEnabled = USAGE_TYPE_POSITION[dbt] != 0 ? 1 : 0;
        this.#asnEnabled = ASN_POSITION[dbt] != 0 ? 1 : 0;
        this.#asEnabled = AS_POSITION[dbt] != 0 ? 1 : 0;
        this.#lastSeenEnabled = LAST_SEEN_POSITION[dbt] != 0 ? 1 : 0;
        this.#threatEnabled = THREAT_POSITION[dbt] != 0 ? 1 : 0;
        this.#providerEnabled = PROVIDER_POSITION[dbt] != 0 ? 1 : 0;

        if (this.#myDB.indexed == 1) {
          len = MAX_INDEX;
          if (this.#myDB.indexedIPV6 == 1) {
            len += MAX_INDEX;
          }
          len *= 8; // 4 bytes for both From/To

          row = this.readRow(len, this.#myDB.indexBaseAddress);

          let pointer = 0;

          for (let x = 0; x < MAX_INDEX; x++) {
            this.#indexArrayIPV4[x] = Array(2);
            this.#indexArrayIPV4[x][0] = this.read32Row(pointer, row);
            this.#indexArrayIPV4[x][1] = this.read32Row(pointer + 4, row);
            pointer += 8;
          }

          if (this.#myDB.indexedIPV6 == 1) {
            for (let x = 0; x < MAX_INDEX; x++) {
              this.#indexArrayIPV6[x] = Array(2);
              this.#indexArrayIPV6[x][0] = this.read32Row(pointer, row);
              this.#indexArrayIPV6[x][1] = this.read32Row(pointer + 4, row);
              pointer += 8;
            }
          }
        }
        loadOK = true;
      }
    } catch (err) {
      // do nothing for now
    }
    return loadOK;
  }

  // Initialize the module with the path to the IP2Proxy BIN file
  open(binPath) {
    if (this.#myDB.dbType == 0) {
      this.#binFile = binPath;

      if (!this.loadBin()) {
        // problems reading BIN
        return -1;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  // Reset everything
  close() {
    try {
      this.#myDB.baseAddress = 0;
      this.#myDB.dbCount = 0;
      this.#myDB.dbColumn = 0;
      this.#myDB.dbType = 0;
      this.#myDB.dbDay = 0;
      this.#myDB.dbMonth = 0;
      this.#myDB.dbYear = 0;
      this.#myDB.baseAddressIPV6 = 0;
      this.#myDB.dbCountIPV6 = 0;
      this.#myDB.indexed = 0;
      this.#myDB.indexedIPV6 = 0;
      this.#myDB.indexBaseAddress = 0;
      this.#myDB.indexBaseAddressIPV6 = 0;
      this.#myDB.productCode = 0;
      this.#myDB.productType = 0;
      this.#myDB.fileSize = 0;
      fs.closeSync(this.#fd);
      return 0;
    } catch (err) {
      return -1;
    }
  }

  // Search BIN for the data
  proxyQueryData(myIP, ipType, data, mode) {
    let MAX_IP_RANGE;
    let low;
    let mid;
    let high;
    let countryPosition;
    let baseAddress;
    let columnSize;
    let ipNumber;
    let indexAddress;
    let rowOffset;
    let rowOffset2;
    let ipFrom;
    let ipTo;
    let firstCol = 4; // IP From is 4 bytes
    let row;
    let fullRow;

    if (ipType == 4) {
      MAX_IP_RANGE = MAX_IPV4_RANGE;
      high = this.#myDB.dbCount;
      baseAddress = this.#myDB.baseAddress;
      columnSize = this.#ipV4ColumnSize;
      ipNumber = dot2Num(myIP);

      if (this.#myDB.indexed == 1) {
        indexAddress = ipNumber >>> 16;
        low = this.#indexArrayIPV4[indexAddress][0];
        high = this.#indexArrayIPV4[indexAddress][1];
      }
    } else if (ipType == 6) {
      MAX_IP_RANGE = MAX_IPV6_RANGE;
      high = this.#myDB.dbCountIPV6;
      baseAddress = this.#myDB.baseAddressIPV6;
      columnSize = this.#ipV6ColumnSize;
      ipNumber = ip2No(myIP);

      if (
        (ipNumber.geq(FROM_6TO4) && ipNumber.leq(TO_6TO4)) ||
        (ipNumber.geq(FROM_TEREDO) && ipNumber.leq(TO_TEREDO))
      ) {
        ipType = 4;
        MAX_IP_RANGE = MAX_IPV4_RANGE;
        high = this.#myDB.dbCount;
        baseAddress = this.#myDB.baseAddress;
        columnSize = this.#ipV4ColumnSize;

        if (ipNumber.geq(FROM_6TO4) && ipNumber.leq(TO_6TO4)) {
          ipNumber = ipNumber.shiftRight(80).and(LAST_32_BITS).toJSNumber();
        } else {
          ipNumber = ipNumber.not().and(LAST_32_BITS).toJSNumber();
        }
        if (this.#myDB.indexed == 1) {
          indexAddress = ipNumber >>> 16;
          low = this.#indexArrayIPV4[indexAddress][0];
          high = this.#indexArrayIPV4[indexAddress][1];
        }
      } else {
        firstCol = 16; // IPv6 is 16 bytes
        if (this.#myDB.indexedIPV6 == 1) {
          indexAddress = ipNumber.shiftRight(112).toJSNumber();
          low = this.#indexArrayIPV6[indexAddress][0];
          high = this.#indexArrayIPV6[indexAddress][1];
        }
      }
    }

    data.ip = myIP;
    ipNumber = bigInt(ipNumber);

    if (ipNumber.geq(MAX_IP_RANGE)) {
      ipNumber = MAX_IP_RANGE.minus(1);
    }

    data.ipNo = ipNumber.toString();

    while (low <= high) {
      mid = Math.trunc((low + high) / 2);
      rowOffset = baseAddress + mid * columnSize;
      rowOffset2 = rowOffset + columnSize;

      // reading IP From + whole row + next IP From
      fullRow = this.readRow(columnSize + firstCol, rowOffset);
      ipFrom = this.read32Or128Row(0, fullRow, firstCol);
      ipTo = this.read32Or128Row(columnSize, fullRow, firstCol);

      ipFrom = bigInt(ipFrom);
      ipTo = bigInt(ipTo);

      if (ipFrom.leq(ipNumber) && ipTo.gt(ipNumber)) {
        loadMesg(data, MSG_NOT_SUPPORTED); // load default message

        let rowLen = columnSize - firstCol;
        row = fullRow.subarray(firstCol, firstCol + rowLen); // extract the actual row data

        if (this.#proxyTypeEnabled) {
          if (
            mode == MODES.ALL ||
            mode == MODES.PROXY_TYPE ||
            mode == MODES.IS_PROXY
          ) {
            data.proxyType = this.readStr(
              this.read32Row(this.#proxyTypePositionOffset, row)
            );
          }
        }

        if (this.#countryEnabled) {
          if (
            mode == MODES.ALL ||
            mode == MODES.COUNTRY_SHORT ||
            mode == MODES.COUNTRY_LONG ||
            mode == MODES.IS_PROXY
          ) {
            countryPosition = this.read32Row(this.#countryPositionOffset, row);
          }
          if (
            mode == MODES.ALL ||
            mode == MODES.COUNTRY_SHORT ||
            mode == MODES.IS_PROXY
          ) {
            data.countryShort = this.readStr(countryPosition);
          }
          if (mode == MODES.ALL || mode == MODES.COUNTRY_LONG) {
            data.countryLong = this.readStr(countryPosition + 3);
          }
        }

        if (this.#regionEnabled) {
          if (mode == MODES.ALL || mode == MODES.REGION) {
            data.region = this.readStr(
              this.read32Row(this.#regionPositionOffset, row)
            );
          }
        }

        if (this.#cityEnabled) {
          if (mode == MODES.ALL || mode == MODES.CITY) {
            data.city = this.readStr(
              this.read32Row(this.#cityPositionOffset, row)
            );
          }
        }
        if (this.#ispEnabled) {
          if (mode == MODES.ALL || mode == MODES.ISP) {
            data.isp = this.readStr(
              this.read32Row(this.#ispPositionOffset, row)
            );
          }
        }
        if (this.#domainEnabled) {
          if (mode == MODES.ALL || mode == MODES.DOMAIN) {
            data.domain = this.readStr(
              this.read32Row(this.#domainPositionOffset, row)
            );
          }
        }
        if (this.#usageTypeEnabled) {
          if (mode == MODES.ALL || mode == MODES.USAGE_TYPE) {
            data.usageType = this.readStr(
              this.read32Row(this.#usageTypePositionOffset, row)
            );
          }
        }
        if (this.#asnEnabled) {
          if (mode == MODES.ALL || mode == MODES.ASN) {
            data.asn = this.readStr(
              this.read32Row(this.#asnPositionOffset, row)
            );
          }
        }
        if (this.#asEnabled) {
          if (mode == MODES.ALL || mode == MODES.AS) {
            data.as = this.readStr(this.read32Row(this.#asPositionOffset, row));
          }
        }
        if (this.#lastSeenEnabled) {
          if (mode == MODES.ALL || mode == MODES.LAST_SEEN) {
            data.lastSeen = this.readStr(
              this.read32Row(this.#lastSeenPositionOffset, row)
            );
          }
        }
        if (this.#threatEnabled) {
          if (mode == MODES.ALL || mode == MODES.THREAT) {
            data.threat = this.readStr(
              this.read32Row(this.#threatPositionOffset, row)
            );
          }
        }
        if (this.#providerEnabled) {
          if (mode == MODES.ALL || mode == MODES.PROVIDER) {
            data.provider = this.readStr(
              this.read32Row(this.#providerPositionOffset, row)
            );
          }
        }

        if (data.countryShort == "-" || data.proxyType == "-") {
          data.isProxy = 0;
        } else {
          if (data.proxyType == "DCH" || data.proxyType == "SES") {
            data.isProxy = 2;
          } else {
            data.isProxy = 1;
          }
        }
        return;
      } else {
        if (ipFrom.gt(ipNumber)) {
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }
    }
    loadMesg(data, MSG_INVALID_IP);
  }

  // Query IP for proxy info
  proxyQuery(myIP, mode) {
    let data = {
      ip: "?",
      ipNo: "?",
      isProxy: -1,
      proxyType: "?",
      countryShort: "?",
      countryLong: "?",
      region: "?",
      city: "?",
      isp: "?",
      domain: "?",
      usageType: "?",
      asn: "?",
      as: "?",
      lastSeen: "?",
      threat: "?",
      provider: "?",
    };

    if (REGEX_IPV4_1_MATCH.test(myIP)) {
      myIP = myIP.replace(REGEX_IPV4_1_REPLACE, "");
    } else if (REGEX_IPV4_2_MATCH.test(myIP)) {
      myIP = myIP.replace(REGEX_IPV4_2_REPLACE, "");
    }

    let ipType = net.isIP(myIP);

    if (ipType == 0) {
      loadMesg(data, MSG_INVALID_IP);
      return data;
    } else if (
      !this.#binFile ||
      this.#binFile == "" ||
      !fs.existsSync(this.#binFile)
    ) {
      loadMesg(data, MSG_MISSING_FILE);
      return data;
    } else if (this.#myDB.dbType == 0) {
      loadMesg(data, MSG_MISSING_FILE);
      return data;
    } else if (ipType == 6 && this.#myDB.dbCountIPV6 == 0) {
      loadMesg(data, MSG_IPV6_UNSUPPORTED);
      return data;
    } else {
      this.proxyQueryData(myIP, ipType, data, mode);
      return data;
    }
  }

  // Return the module version
  getModuleVersion() {
    return VERSION;
  }

  // Return the package version
  getPackageVersion() {
    return this.#myDB.dbType;
  }

  // Return the IP database version
  getDatabaseVersion() {
    return (
      "20" +
      this.#myDB.dbYear +
      "." +
      this.#myDB.dbMonth +
      "." +
      this.#myDB.dbDay
    );
  }

  // Return an integer to state if is proxy
  isProxy(myIP) {
    // -1 is error
    // 0 is not a proxy
    // 1 is proxy except DCH and SES
    // 2 is proxy and DCH or SES
    let data = this.proxyQuery(myIP, MODES.IS_PROXY);
    return data.isProxy;
  }

  // Return a string for the country code
  getCountryShort(myIP) {
    let data = this.proxyQuery(myIP, MODES.COUNTRY_SHORT);
    return data.countryShort;
  }

  // Return a string for the country name
  getCountryLong(myIP) {
    let data = this.proxyQuery(myIP, MODES.COUNTRY_LONG);
    return data.countryLong;
  }

  // Return a string for the region name
  getRegion(myIP) {
    let data = this.proxyQuery(myIP, MODES.REGION);
    return data.region;
  }

  // Return a string for the city name
  getCity(myIP) {
    let data = this.proxyQuery(myIP, MODES.CITY);
    return data.city;
  }

  // Return a string for the ISP name
  getISP(myIP) {
    let data = this.proxyQuery(myIP, MODES.ISP);
    return data.isp;
  }

  // Return a string for the proxy type
  getProxyType(myIP) {
    let data = this.proxyQuery(myIP, MODES.PROXY_TYPE);
    return data.proxyType;
  }

  // Return a string for the domain
  getDomain(myIP) {
    let data = this.proxyQuery(myIP, MODES.DOMAIN);
    return data.domain;
  }

  // Return a string for the usage type
  getUsageType(myIP) {
    let data = this.proxyQuery(myIP, MODES.USAGE_TYPE);
    return data.usageType;
  }

  // Return a string for the ASN
  getASN(myIP) {
    let data = this.proxyQuery(myIP, MODES.ASN);
    return data.asn;
  }

  // Return a string for the AS
  getAS(myIP) {
    let data = this.proxyQuery(myIP, MODES.AS);
    return data.as;
  }

  // Return a string for the last seen
  getLastSeen(myIP) {
    let data = this.proxyQuery(myIP, MODES.LAST_SEEN);
    return data.lastSeen;
  }

  // Return a string for the threat
  getThreat(myIP) {
    let data = this.proxyQuery(myIP, MODES.THREAT);
    return data.threat;
  }

  // Return a string for the provider
  getProvider(myIP) {
    let data = this.proxyQuery(myIP, MODES.PROVIDER);
    return data.provider;
  }

  // Return all results
  getAll(myIP) {
    let data = this.proxyQuery(myIP, MODES.ALL);
    return data;
  }
}

// Convert IPv4 address to number
function dot2Num(ipV4) {
  let d = ipV4.split(".");
  return ((+d[0] * 256 + +d[1]) * 256 + +d[2]) * 256 + +d[3];
}

// Convert IPv6 address to number
function ip2No(ipV6) {
  let maxSections = 8; // should have 8 sections
  let sectionBits = 16; // 16 bits per section
  let m = ipV6.split("::");

  let total = bigInt(); // zero

  if (m.length == 2) {
    let myArrLeft = m[0] != "" ? m[0].split(":") : [];
    let myArrRight = m[1] != "" ? m[1].split(":") : [];
    let myArrMid = maxSections - myArrLeft.length - myArrRight.length;

    for (let x = 0; x < myArrLeft.length; x++) {
      total = total.add(
        bigInt(parseInt("0x" + myArrLeft[x])).shiftLeft(
          (maxSections - (x + 1)) * sectionBits
        )
      );
    }

    for (let x = 0; x < myArrRight.length; x++) {
      total = total.add(
        bigInt(parseInt("0x" + myArrRight[x])).shiftLeft(
          (myArrRight.length - (x + 1)) * sectionBits
        )
      );
    }
  } else if (m.length == 1) {
    let myArr = m[0].split(":");

    for (let x = 0; x < myArr.length; x++) {
      total = total.add(
        bigInt(parseInt("0x" + myArr[x])).shiftLeft(
          (maxSections - (x + 1)) * sectionBits
        )
      );
    }
  }

  return total;
}

function loadMesg(data, mesg) {
  for (let key in data) {
    if (REGEX_TEXT_FIELD.test(key) === false) {
      data[key] = mesg;
    }
  }
}

// API query class
class IP2ProxyWebService {
  #apiKey = "";
  #apiPackage = "";
  #useSSL = true;

  constructor() {}

  // Set the API key and package to query
  open(apiKey, apiPackage, useSSL = true) {
    this.#apiKey = apiKey;
    this.#apiPackage = apiPackage;
    this.#useSSL = useSSL;

    this.checkParams();
  }

  // Validate API key and package
  checkParams() {
    if (REGEX_API_KEY.test(this.#apiKey) === false && this.#apiKey != "demo") {
      throw new Error(MSG_INVALID_API_KEY);
    }

    if (REGEX_API_PACKAGE.test(this.#apiPackage) === false) {
      throw new Error(MSG_INVALID_API_PACKAGE);
    }
  }

  // Query web service to get proxy information by IP address
  lookup(myIP, callback) {
    this.checkParams(); // check here in case user haven't called open yet

    let data = {
      key: this.#apiKey,
      package: this.#apiPackage,
      ip: myIP,
    };

    let protocol = this.#useSSL ? "https" : "http";
    let url = protocol + "://" + BASE_URL + "?";

    Object.keys(data).forEach(function (key, index) {
      if (this[key] != "") {
        url += key + "=" + encodeURIComponent(this[key]) + "&";
      }
    }, data);

    url = url.substring(0, url.length - 1);

    let d = "";
    let req = https.get(url, function (res) {
      res.on("data", (chunk) => (d = d + chunk));
      res.on("end", function () {
        callback(null, JSON.parse(d));
      });
    });

    req.on("error", function (e) {
      callback(e);
    });
  }

  // Check web service credit balance
  getCredit(callback) {
    this.checkParams(); // check here in case user haven't called open yet

    let data = {
      key: this.#apiKey,
      check: "true",
    };

    let protocol = this.#useSSL ? "https" : "http";
    let url = protocol + "://" + BASE_URL + "?";

    Object.keys(data).forEach(function (key, index) {
      if (this[key] != "") {
        url += key + "=" + encodeURIComponent(this[key]) + "&";
      }
    }, data);

    url = url.substring(0, url.length - 1);

    let d = "";
    let req = https.get(url, function (res) {
      res.on("data", (chunk) => (d = d + chunk));
      res.on("end", function () {
        callback(null, JSON.parse(d));
      });
    });

    req.on("error", function (e) {
      callback(e);
    });
  }
}

module.exports = {
  IP2Proxy: IP2Proxy,
  IP2ProxyWebService: IP2ProxyWebService,
};
