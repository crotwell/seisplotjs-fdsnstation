
import RSVP from 'rsvp';

RSVP.on('error', function(reason) {
  console.assert(false, reason);
});

import * as model from 'seisplotjs-model';

export { RSVP, model };

export const moment = model.moment;

export const LEVEL_NETWORK = 'network';
export const LEVEL_STATION = 'station';
export const LEVEL_CHANNEL = 'channel';
export const LEVEL_RESPONSE = 'response';

export const LEVELS = [ LEVEL_NETWORK, LEVEL_STATION, LEVEL_CHANNEL, LEVEL_RESPONSE];

export const IRIS_HOST = "service.iris.edu";

export const STAML_NS = 'http://www.fdsn.org/xml/station/1';

export const FAKE_EMPTY_XML = '<?xml version="1.0" encoding="ISO-8859-1"?> <FDSNStationXML xmlns="http://www.fdsn.org/xml/station/1" schemaVersion="1.0" xsi:schemaLocation="http://www.fdsn.org/xml/station/1 http://www.fdsn.org/xml/station/fdsn-station-1.0.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:iris="http://www.fdsn.org/xml/station/1/iris"> </FDSNStationXML>';


export class StationQuery {
  constructor(host) {
    this._specVersion = 1;
    this._protocol = 'http';
    if (document && document.location && "https:" == document.location.protocol) {
      this._protocol = 'https:'
    }
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
    return arguments.length ? (this._startTime = model.checkStringOrDate(value), this) : this._startTime;
  }
  endTime(value) {
    return arguments.length ? (this._endTime = model.checkStringOrDate(value), this) : this._endTime;
  }
  startBefore(value) {
    return arguments.length ? (this._startBefore = model.checkStringOrDate(value), this) : this._startBefore;
  }
  startAfter(value) {
    return arguments.length ? (this._startAfter = model.checkStringOrDate(value), this) : this._startAfter;
  }
  endBefore(value) {
    return arguments.length ? (this._endBefore = model.checkStringOrDate(value), this) : this._endBefore;
  }
  endAfter(value) {
    return arguments.length ? (this._endAfter = model.checkStringOrDate(value), this) : this._endAfter;
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
    return arguments.length ? (this._updatedAfter = model.checkStringOrDate(value), this) : this._updatedAfter;
  }
  matchTimeseries(value) {
    return arguments.length ? (this._matchTimeseries = value, this) : this._matchTimeseries;
  }

  convertToNetwork(xml) {
    let out = new model.Network(xml.getAttribute("code"))
      .startDate(xml.getAttribute("startDate"))
      .restrictedStatus(xml.getAttribute("restrictedStatus"))
      .description(this._grabFirstElText(xml, 'Description'));
    if (xml.getAttribute("endDate")) {
      out.endDate(xml.getAttribute("endDate"));
    }
    var totSta = xml.getElementsByTagNameNS(STAML_NS, "TotalNumberStations");
    if (totSta && totSta.length >0) {
      out.totalNumberStations = parseInt(this._grabFirstElText(xml, "TotalNumberStations"));
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
      .startDate(xml.getAttribute("startDate"))
      .restrictedStatus(xml.getAttribute("restrictedStatus"))
      .latitude(this._grabFirstElFloat(xml, 'Latitude'))
      .longitude(this._grabFirstElFloat(xml, 'Longitude'))
      .elevation(this._grabFirstElFloat(xml, 'Elevation'))
      .name(this._grabFirstElText(this._grabFirstEl(xml, 'Site'), 'Name'));
    if (xml.getAttribute("endDate")) {
      out.endDate(xml.getAttribute("endDate"));
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
      .startDate(xml.getAttribute("startDate"))
      .restrictedStatus(xml.getAttribute("restrictedStatus"))
      .latitude(this._grabFirstElFloat(xml, 'Latitude'))
      .longitude(this._grabFirstElFloat(xml, 'Longitude'))
      .elevation(this._grabFirstElFloat(xml, 'Elevation'))
      .depth(this._grabFirstElFloat(xml, 'Depth'))
      .azimuth(this._grabFirstElFloat(xml, 'Azimuth'))
      .dip(this._grabFirstElFloat(xml, 'Dip'))
      .sampleRate(this._grabFirstElFloat(xml, 'SampleRate'));
    if (xml.getAttribute("endDate")) {
      out.endDate(xml.getAttribute("endDate"));
    }
    let responseXml = xml.getElementsByTagNameNS(STAML_NS, 'Response');
    if (responseXml && responseXml.length > 0 ) {
      out.response(this.convertToResponse(responseXml.item(0)));
    }
    return out;
  }

  convertToResponse(responseXml) {
    let mythis = this;
    let out;
    let inst = responseXml.getElementsByTagNameNS(STAML_NS, 'InstrumentSensitivity');
    if (inst && inst.item(0)) {
      out = new model.Response(this.convertToInstrumentSensitivity(inst.item(0)));
    } else {
      // DMC returns empty response element when they know nothing (instead
      // of just leaving it out). Return empty object in this case
      out = new model.Response(null);
    }
    let xmlStages = responseXml.getElementsByTagNameNS(STAML_NS, 'Stage');
    if (xmlStages && xmlStages.length > 0) {
      let jsStages = Array.from(xmlStages).map(function(stageXml) {
        return mythis.convertToStage(stageXml);
      });
      out.stages(jsStages);
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

  convertToStage(stageXml) {
    let mythis = this;
    let subEl = stageXml.firstElementChild;
    let filter;
    let description = this._grabFirstElText(stageXml, 'Description');
    let inputUnits = this._grabFirstElText(this._grabFirstEl(stageXml, 'InputUnits'), 'Name');
    let outputUnits = this._grabFirstElText(this._grabFirstEl(stageXml, 'OutputUnits'), 'Name');
    if (subEl.localName == 'PolesZeros') {
      filter = new model.PolesZeros(inputUnits, outputUnits);
      filter.pzTransferFunctionType(this._grabFirstElText(stageXml, 'PzTransferFunctionType'))
            .normalizationFactor(this._grabFirstElFloat(stageXml, 'NormalizationFactor'))
            .normalizationFrequency(this._grabFirstElFloat(stageXml, 'NormalizationFrequency'));
      let zeros = Array.from(stageXml.getElementsByTagNameNS(STAML_NS, 'Zero'))
          .map(function(zeroEl) {
            return model.createComplex(mythis._grabFirstElFloat(zeroEl, 'Real'),
                               mythis._grabFirstElFloat(zeroEl, 'Imaginary'));
          });
      let poles = Array.from(stageXml.getElementsByTagNameNS(STAML_NS, 'Pole'))
          .map(function(poleEl) {
            return model.createComplex(mythis._grabFirstElFloat(poleEl, 'Real'),
                               mythis._grabFirstElFloat(poleEl, 'Imaginary'));
          });
      filter.zeros(zeros)
        .poles(poles);
    } else if (subEl.localName == 'Coefficients') {
      let coeffXml = subEl;
      filter = new model.CoefficientsFilter(inputUnits, outputUnits);
      filter.cfTransferFunction(this._grabFirstElText(coeffXml, 'CfTransferFunctionType'));
      filter.numerator(Array.from(coeffXml.getElementsByTagNameNS(STAML_NS, 'Numerator'))
          .map(function(numerEl) {
            return parseFloat(numerEl.textContent);
          }));
      filter.denominator(Array.from(coeffXml.getElementsByTagNameNS(STAML_NS, 'Denominator'))
          .map(function(denomEl) {
            return parseFloat(denomEl.textContent);
          }));
    } else if (subEl.localName == 'ResponseList') {
      throw new Error("ResponseList not supported: ");
    } else if (subEl.localName == 'FIR') {
      let firXml = subEl;
      filter = new model.FIR(inputUnits, outputUnits);
      filter.symmetry(this._grabFirstElText(firXml, 'Symmetry'));
      filter.numerator(Array.from(firXml.getElementsByTagNameNS(STAML_NS, 'NumeratorCoefficient'))
          .map(function(numerEl) {
            return parseFloat(numerEl.textContent);
          }));
    } else if (subEl.localName == 'Polynomial') {
      throw new Error("Polynomial not supported: ");
    } else if (subEl.localName == 'StageGain') {
      // gain only stage, pick it up below
    } else {
      throw new Error("Unknown Stage type: "+ subEl.localName);
    }
    // add description if it was there
    if (description) {
      filter.description(description);
    }
    if (stageXml.hasAttribute('name')) {
      filter.name(stageXml.getAttribute('name'));
    }
    var decimationXml = this._grabFirstEl(stageXml, 'Decimation');
    var decimation = null;
    if (decimationXml) {
      decimation = this.convertToDecimation(decimationXml);
    }
    var gainXml = this._grabFirstEl(stageXml, 'StageGain');
    var gain = null;
    if (gainXml) {
      gain = this.convertToGain(gainXml);
    }
    return new model.Stage(filter, decimation, gain);
  }

  convertToDecimation(decXml) {
    let out = new model.Decimation();
    return out
      .inputSampleRate(this._grabFirstElFloat(decXml, 'InputSampleRate'))
      .factor(this._grabFirstElInt(decXml, 'Factor'))
      .offset(this._grabFirstElInt(decXml, 'Offset'))
      .delay(this._grabFirstElFloat(decXml, 'Delay'))
      .correction(this._grabFirstElFloat(decXml, 'Correction'));
  }

  convertToGain(gainXml) {
    let out = new model.Gain();
    return out
      .value(this._grabFirstElFloat(gainXml, 'Value'))
      .frequency(this._grabFirstElFloat(gainXml, 'Frequency'));
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
    if (! LEVELS.includes(level)) {throw new Error("Unknown level: '"+level+"'");}
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
      client.ontimeout = function(e) {
        this.statusText = "Timeout "+this.statusText;
        reject(this);
      };
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
    if (this._updatedAfter) { url = url+this.makeParam("updatedafter", this.toIsoWoZ(this.updatedAfter()));}
    if (this._matchTimeseries) { url = url+this.makeParam("matchtimeseries", this.matchTimeseries());}
    if (url.endsWith('&') || url.endsWith('?')) {
      url = url.substr(0, url.length-1); // zap last & or ?
    }
    return url;
  }

  // these are similar methods as in seisplotjs-fdsnevent
  // duplicate here to avoid dependency and diff NS, yes that is dumb...


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

  _grabFirstElInt(xml, tagName) {
    let out = this._grabFirstElText(xml, tagName);
    if (out) {
      out = parseInt(out);
    }
    return out;
  }
}
