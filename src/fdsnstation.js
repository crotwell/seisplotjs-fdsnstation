
import RSVP from 'rsvp';

RSVP.on('error', function(reason) {
  console.assert(false, reason);
});

export { RSVP };

export const LEVEL_NETWORK = 'network';
export const LEVEL_STATION = 'station';
export const LEVEL_CHANNEL = 'channel';
export const LEVEL_RESPONSE = 'response';

export const IRIS_HOST = "service.iris.edu";

export const STAML_NS = 'http://www.fdsn.org/xml/station/1';

export class StationQuery {
  constructor(host) {
    this._protocol = 'http';
    this._host = host;
    if (! host) {
      this._host = IRIS_HOST;
    }
  }
  protocol(value) {
    return arguments.length ? (this._protocol = value, this) : this._protocol;
  }
  host(value) {
    return arguments.length ? (this._host = value, this) : this._host;
  }
  networkCode(value) {
    return arguments.length ? (this._networkCode = value, this) : this._networkCode;
  }
  stationCode(value) {
    return arguments.length ? (this._stationCode = value, this) : this._stationCode;
  }
  locationCode(value) {
    return arguments.length ? (this._locationCode = value, this) : this._locationCode;
  }
  channelCode(value) {
    return arguments.length ? (this._channelCode = value, this) : this._channelCode;
  }
  startTime(value) {
    return arguments.length ? (this._startTime = value, this) : this._startTime;
  }
  endTime(value) {
    return arguments.length ? (this._endTime = value, this) : this._endTime;
  }
  minMag(value) {
    return arguments.length ? (this._minMag = value, this) : this._minMag;
  }
  maxMag(value) {
    return arguments.length ? (this._maxMag = value, this) : this._maxMag;
  }
  minLat(value) {
    return arguments.length ? (this._minLat = value, this) : this._minLat;
  }
  maxLat(value) {
    return arguments.length ? (this._maxLat = value, this) : this._maxLat;
  }
  minLon(value) {
    return arguments.length ? (this._minLon = value, this) : this._minLon;
  }
  maxLon(value) {
    return arguments.length ? (this._maxLon = value, this) : this._maxLon;
  }
  convertToNetwork(xml) {
console.log("convertToNetwork");
    let out = {};
    out.code = xml.getAttribute("code");
    out.startDate = this.toDateUTC(xml.getAttribute("startDate"));
    out.endDate = this.toDateUTC(xml.getAttribute("endDate"));
    out.restrictedStatus = xml.getAttribute("restrictedStatus");
    out.description = xml.getElementsByTagNameNS(STAML_NS, 'Description').item(0)
        .textContent;
    let staArray = xml.getElementsByTagNameNS(STAML_NS, "Station");
console.log(out.code+" found "+staArray.length+" stations"); 
        out.stations = [];
        for (let i=0; i<staArray.length; i++) {
          out.stations[i] = this.convertToStation(staArray.item(i));
        }
    return out;
  }
  convertToStation(xml) {
console.log("convert to station");
    let out = {};
    out.code = xml.getAttribute("code");
    out.startDate = this.toDateUTC(xml.getAttribute("startDate"));
    out.endDate = this.toDateUTC(xml.getAttribute("endDate"));
    out.restrictedStatus = xml.getAttribute("restrictedStatus");
    out.latitude = parseFloat(xml.getElementsByTagNameNS(STAML_NS, 'Latitude').item(0)
        .textContent);
    out.longitude = parseFloat(xml.getElementsByTagNameNS(STAML_NS, 'Longitude').item(0)
        .textContent);
    out.name = xml.getElementsByTagNameNS(STAML_NS, 'Site').item(0)
        .getElementsByTagNameNS(STAML_NS, 'Name').item(0)
        .textContent;
    return out;
  }

  queryNetworks() {
    return this.query(LEVEL_NETWORK);
  }
  queryStations() {
    return this.query(LEVEL_STATION);
  }
  queryChannels() {
    return this.query(LEVEL_CHANNEL);
  }
  queryResponse() {
    return this.query(LEVEL_RESPONSE);
  }

  query(level) {
    let mythis = this;
    return this.queryRawXml(level).then(function(rawXml) {
console.log("in query then");
        let top = rawXml.documentElement;
        let netArray = top.getElementsByTagNameNS(STAML_NS, "Network");
console.log("found "+netArray.length+" nets");
        let out = [];
        for (let i=0; i<netArray.length; i++) {
          out[i] = mythis.convertToNetwork(netArray.item(i));
        }
console.log("convert to networks promise resolve: "+out.length);
        return out;
    });
  }

  queryRawXml(level) {
    let mythis = this;
    let mylevel = level;
    let promise = new RSVP.Promise(function(resolve, reject) {
      let client = new XMLHttpRequest();
      let url = mythis.formURL(mylevel);
      client.open("GET", url);
      client.onreadystatechange = handler;
      client.responseType = "document";
      client.setRequestHeader("Accept", "application/xml");
      client.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) { 
console.log("resolve xml: ");
            resolve(this.responseXML); }
          else { reject(this); }
        }
      }
    });
    return promise;
  }

  formURL(level) {
    if (! level) {throw new Error("level not specified, should be one of network, station, channel, response.");}
    let url = this.protocol()+"://"+this.host()+"/fdsnws/station/1/query?";
    url = url+"level="+level+"&";
    if (this._networkCode) { url = url+"net="+this.networkCode()+"&";}
    if (this._stationCode) { url = url+"sta="+this.stationCode()+"&";}
    if (this._locationCode) { url = url+"loc="+this.locationCode()+"&";}
    if (this._channelCode) { url = url+"cha="+this.channelCode()+"&";}
    if (this._startTime) { url = url+"starttime="+this.toIsoWoZ(this.startTime())+"&";}
    if (this._endTime) { url = url+"endtime="+this.toIsoWoZ(this.endTime())+"&";}
    if (this._minLat) { url = url+"minlat="+this.minLat()+"&";}
    if (this._maxLat) { url = url+"maxlat="+this.maxLat()+"&";}
    if (this._minLon) { url = url+"minlon="+this.minLon()+"&";}
    if (this._maxLon) { url = url+"maxlon="+this.maxLon()+"&";}
    return url.substr(0, url.length-1); // zap last & or ?
  }

  toDateUTC(str) {
    if (! str.endsWith('Z')) {
      str = str + 'Z';
    }
    return new Date(Date.parse(str));
  }

  /** converts to ISO8601 but removes the trailing Z as FDSN web services 
    do not allow that. */
  toIsoWoZ(date) {
    let out = date.toISOString();
    return out.substring(0, out.length-1);
  }
}
