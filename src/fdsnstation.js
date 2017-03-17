
import RSVP from 'rsvp';

RSVP.on('error', function(reason) {
  console.assert(false, reason);
});

import * as model from 'seisplotjs-model';

export { RSVP, model };

export const LEVEL_NETWORK = 'network';
export const LEVEL_STATION = 'station';
export const LEVEL_CHANNEL = 'channel';
export const LEVEL_RESPONSE = 'response';

export const IRIS_HOST = "service.iris.edu";

export const STAML_NS = 'http://www.fdsn.org/xml/station/1';
            
export const FAKE_EMPTY_XML = '<?xml version="1.0" encoding="ISO-8859-1"?> <FDSNStationXML xmlns="http://www.fdsn.org/xml/station/1" schemaVersion="1.0" xsi:schemaLocation="http://www.fdsn.org/xml/station/1 http://www.fdsn.org/xml/station/fdsn-station-1.0.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:iris="http://www.fdsn.org/xml/station/1/iris"> </FDSNStationXML>';
 

export class StationQuery {
  constructor(host) {
    this._specVersion = 1;
    this._protocol = 'http';
    this._host = host;
    if (! host) {
      this._host = IRIS_HOST;
    }
  }
  specVersion(value) {
    return arguments.length ? (this._specVersion = value, this) : this._specVersion;
  }
  protocol(value) {
    return arguments.length ? (this._protocol = value, this) : this._protocol;
  }
  host(value) {
    return arguments.length ? (this._host = value, this) : this._host;
  }
  nodata(value) {
    return arguments.length ? (this._nodata = value, this) : this._nodata;
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
  startBefore(value) {
    return arguments.length ? (this._startBefore = value, this) : this._startBefore;
  }
  startAfter(value) {
    return arguments.length ? (this._startAfter = value, this) : this._startAfter;
  }
  endBefore(value) {
    return arguments.length ? (this._endBefore = value, this) : this._endBefore;
  }
  endAfter(value) {
    return arguments.length ? (this._endAfter = value, this) : this._endAfter;
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
  latitude(value) {
    return arguments.length ? (this._latitude = value, this) : this._latitude;
  }
  longitude(value) {
    return arguments.length ? (this._longitude = value, this) : this._longitude;
  }
  minRadius(value) {
    return arguments.length ? (this._minRadius = value, this) : this._minRadius;
  }
  maxRadius(value) {
    return arguments.length ? (this._maxRadius = value, this) : this._maxRadius;
  }
  includeRestricted(value) {
    return arguments.length ? (this._includeRestricted = value, this) : this._includeRestricted;
  }
  includeAvailability(value) {
    return arguments.length ? (this._includeAvailability = value, this) : this._includeAvailability;
  }
  updatedAfter(value) {
    return arguments.length ? (this._updatedAfter = value, this) : this._updatedAfter;
  }
  matchTimeseries(value) {
    return arguments.length ? (this._matchTimeseries = value, this) : this._matchTimeseries;
  }

  convertToNetwork(xml) {
    let out = new model.Network(xml.getAttribute("code"))
      .startDate(this.toDateUTC(xml.getAttribute("startDate")))
      .restrictedStatus(xml.getAttribute("restrictedStatus"))
      .description(this._grabFirstElText(xml, 'Description'));
    if (xml.getAttribute("endDate")) {
      out.endDate(this.toDateUTC(xml.getAttribute("endDate")));
    }
    let staArray = xml.getElementsByTagNameNS(STAML_NS, "Station");
    let stations = [];
    for (let i=0; i<staArray.length; i++) {
      stations.push(this.convertToStation(out, staArray.item(i)));
    }
    out.stations(stations);
    return out;
  }
  convertToStation(network, xml) {
    let out = new model.Station(network, xml.getAttribute("code"))
      .startDate(this.toDateUTC(xml.getAttribute("startDate")))
      .restrictedStatus(xml.getAttribute("restrictedStatus"))
      .latitude(this._grabFirstElFloat(xml, 'Latitude'))
      .longitude(this._grabFirstElFloat(xml, 'Longitude'))
      .elevation(this._grabFirstElFloat(xml, 'Elevation'))
      .name(this._grabFirstElText(this._grabFirstEl(xml, 'Site'), 'Name'));
    if (xml.getAttribute("endDate")) {
      out.endDate(this.toDateUTC(xml.getAttribute("endDate")));
    }
    let chanArray = xml.getElementsByTagNameNS(STAML_NS, "Channel");
    let channels = [];
    for (let i=0; i<chanArray.length; i++) {
      channels.push(this.convertToChannel(out, chanArray.item(i)));
    }
    out.channels(channels);
    return out;
  }
  convertToChannel(station, xml) {
    let out = new model.Channel(station, xml.getAttribute("code"), xml.getAttribute("locationCode"))
      .startDate(this.toDateUTC(xml.getAttribute("startDate")))
      .restrictedStatus(xml.getAttribute("restrictedStatus"))
      .latitude(this._grabFirstElFloat(xml, 'Latitude'))
      .longitude(this._grabFirstElFloat(xml, 'Longitude'))
      .elevation(this._grabFirstElFloat(xml, 'Elevation'))
      .depth(this._grabFirstElFloat(xml, 'Depth'))
      .azimuth(this._grabFirstElFloat(xml, 'Azimuth'))
      .dip(this._grabFirstElFloat(xml, 'Dip'))
      .sampleRate(this._grabFirstElFloat(xml, 'SampleRate'));
    if (xml.getAttribute("endDate")) {
      out.endDate(this.toDateUTC(xml.getAttribute("endDate")));
    }
    let response = xml.getElementsByTagNameNS(STAML_NS, 'Response');
    let inst = response.item(0).getElementsByTagNameNS(STAML_NS, 'InstrumentSensitivity');
    if (inst && inst.item(0)) {
      out.instrumentSensitivity(this.convertToInstrumentSensitivity(this._grabFirstEl(this._grabFirstEl(xml, 'Response'), 'InstrumentSensitivity')));
    }
    return out;
  }

  convertToInstrumentSensitivity(xml) {
    let sensitivity = this._grabFirstElFloat(xml, 'Value');
    let frequency = this._grabFirstElFloat(xml, 'Frequency');
    let inputUnits = this._grabFirstElText(this._grabFirstEl(xml, 'InputUnits'), 'Name');
    let outputUnits = this._grabFirstElText(this._grabFirstEl(xml, 'OutputUnits'), 'Name');
    return new model.InstrumentSensitivity(sensitivity, frequency, inputUnits, outputUnits);
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
        let top = rawXml.documentElement;
        let netArray = top.getElementsByTagNameNS(STAML_NS, "Network");
        let out = [];
        for (let i=0; i<netArray.length; i++) {
          out[i] = mythis.convertToNetwork(netArray.item(i));
        }
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
      client.responseType = "text"; // use text so error isn't parsed as xml
      client.setRequestHeader("Accept", "application/xml");
      client.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) { 
              let out = new DOMParser().parseFromString(this.response, "text/xml");
              out.url = url;
              resolve(out); 
//            resolve(this.responseXML); 
          } else if (this.status === 204 || (mythis.nodata() && this.status === mythis.nodata())) {

            // 204 is nodata, so successful but empty
            if (DOMParser) {
console.log("204 nodata so return empty xml");
              resolve(new DOMParser().parseFromString(FAKE_EMPTY_XML, "text/xml")); 
            } else {
              throw new Error("Got 204 but can't find DOMParser to generate empty xml");
            }
          } else {
            reject(this); 
          }
        }
      }
    });
    return promise;
  }

  formVersionURL() {
      return this.formBaseURL()+"/version";
  }

  queryVersion() {
    let mythis = this;
    let promise = new RSVP.Promise(function(resolve, reject) {
      let url = mythis.formVersionURL();
      let client = new XMLHttpRequest();
      client.open("GET", url);
      client.onreadystatechange = handler;
      client.responseType = "text";
      client.setRequestHeader("Accept", "text/plain");
      client.send();

      function handler() {
        if (this.readyState === this.DONE) {
          console.log("handle version: "+mythis.host()+" "+this.status);
          if (this.status === 200) { resolve(this.response); }
          else {
            console.log("Reject version: "+mythis.host()+" "+this.status);reject(this); }
        }
      }
    });
    return promise;
  }

  makeParam(name, val) {
    return name+"="+encodeURIComponent(val)+"&";
  }

  formBaseURL() {
    let colon = ":";
    if (this.protocol().endsWith(colon)) {
      colon = "";
    }
    return this.protocol()+colon+"//"+this.host()+"/fdsnws/station/"+this.specVersion();
  }

  formURL(level) {
    let url = this.formBaseURL()+"/query?";
    if (! level) {throw new Error("level not specified, should be one of network, station, channel, response.");}
    url = url+this.makeParam("level", level);
    if (this._networkCode) { url = url+this.makeParam("net", this.networkCode());}
    if (this._stationCode) { url = url+this.makeParam("sta", this.stationCode());}
    if (this._locationCode) { url = url+this.makeParam("loc", this.locationCode());}
    if (this._channelCode) { url = url+this.makeParam("cha", this.channelCode());}
    if (this._startTime) { url = url+this.makeParam("starttime", this.toIsoWoZ(this.startTime()));}
    if (this._endTime) { url = url+this.makeParam("endtime", this.toIsoWoZ(this.endTime()));}
    if (this._startBefore) { url = url+this.makeParam("startbefore", this.toIsoWoZ(this.startBefore()));}
    if (this._startAfter) { url = url+this.makeParam("startafter", this.toIsoWoZ(this.startAfter()));}
    if (this._endBefore) { url = url+this.makeParam("endbefore", this.toIsoWoZ(this.endBefore()));}
    if (this._endAfter) { url = url+this.makeParam("endafter", this.toIsoWoZ(this.endAfter()));}
    if (this._minLat) { url = url+this.makeParam("minlat", this.minLat());}
    if (this._maxLat) { url = url+this.makeParam("maxlat", this.maxLat());}
    if (this._minLon) { url = url+this.makeParam("minlon", this.minLon());}
    if (this._maxLon) { url = url+this.makeParam("maxlon", this.maxLon());}
    if (this._latitude) { url = url+this.makeParam("lat", this.latitude());}
    if (this._longitude) { url = url+this.makeParam("lon", this.longitude());}
    if (this._minRadius) { url = url+this.makeParam("minradius", this.minRadius());}
    if (this._maxRadius) { url = url+this.makeParam("maxradius", this.maxRadius());}
    if (this._includeRestricted) { url = url+this.makeParam("includerestricted", this.includeRestricted());}
    if (this._includeAvailability) { url = url+this.makeParam("includeavailability", this.includeAvailability());}
    if (this._updatedAfter) { url = url+this.makeParam("updatedafter", this.updatedAfter());}
    if (this._matchTimeseries) { url = url+this.makeParam("matchtimeseries", this.matchTimeseries());}
    if (url.endsWith('&') || url.endsWith('?')) {
      url = url.substr(0, url.length-1); // zap last & or ?
    }
    return url;
  }

  // these are similar methods as in seisplotjs-fdsnevent
  // duplicate here to avoid dependency and diff NS, yes that is dumb...

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

  _grabFirstEl(xml, tagName) {
    if ( ! xml) { return null;}
    let out = xml.getElementsByTagNameNS(STAML_NS, tagName);
    if (out && out.length > 0) {
      return out.item(0);
    } else {
      return null;
    }
  }

  _grabFirstElText(xml, tagName) {
    let out = this._grabFirstEl(xml, tagName);
    if (out) {
      out = out.textContent;
    }
    return out;
  }

  _grabFirstElFloat(xml, tagName) {
    let out = this._grabFirstElText(xml, tagName);
    if (out) {
      out = parseFloat(out); 
    }
    return out;
  }
}

