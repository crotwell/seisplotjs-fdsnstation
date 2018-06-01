
import * as fdsnstation from '../src/fdsnstation';
import * as util from '../src/util';

test( "station parse test", () => {
  const xml = new DOMParser().parseFromString(RAW_XML_STATION, "text/xml");
  let stationQuery = new fdsnstation.StationQuery();
  let networks = stationQuery.parseRawXml(xml);
  expect(networks.length).toBe(2);
  expect(networks[0].stations.length).toBe(1);
});

test( "channel parse test", () => {
  const xml = new DOMParser().parseFromString(RAW_XML_CHANNEL, "text/xml");
  let stationQuery = new fdsnstation.StationQuery();
  let networks = stationQuery.parseRawXml(xml);
  expect(networks.length).toBe(1);
  expect(networks[0].stations().length).toBe(1);
  expect(networks[0].stations()[0].channels().length).toBe(1);
});

const RAW_XML_STATION = `<?xml version="1.0" encoding="ISO-8859-1"?>

<FDSNStationXML xmlns="http://www.fdsn.org/xml/station/1" schemaVersion="1.0" xsi:schemaLocation="http://www.fdsn.org/xml/station/1 http://www.fdsn.org/xml/station/fdsn-station-1.0.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:iris="http://www.fdsn.org/xml/station/1/iris">
 <Source>IRIS-DMC</Source>
 <Sender>IRIS-DMC</Sender>
 <Module>IRIS WEB SERVICE: fdsnws-station | version: 1.1.33</Module>
 <ModuleURI>http://service.iris.edu/fdsnws/station/1/query?level=station&amp;net=TA%2CCO&amp;sta=109C%2CJSC</ModuleURI>
 <Created>2018-06-01T12:29:16</Created>
 <Network code="CO" startDate="1987-01-01T00:00:00" endDate="2500-12-31T23:59:59" restrictedStatus="open">
  <Description>South Carolina Seismic Network</Description>
  <TotalNumberStations>14</TotalNumberStations>
  <SelectedNumberStations>1</SelectedNumberStations>
  <Station code="JSC" startDate="2009-04-13T00:00:00" endDate="2599-12-31T23:59:59" restrictedStatus="open" iris:alternateNetworkCodes="_CEUSN,.GREG,.CEUSN-CONTRIB,_US-REGIONAL,_REALTIME,.UNRESTRICTED">
   <Latitude>34.2818</Latitude>
   <Longitude>-81.25966</Longitude>
   <Elevation>103.0</Elevation>
   <Site>
    <Name>Jenkinsville, South Carolina</Name>
   </Site>
   <CreationDate>2009-04-13T00:00:00</CreationDate>
   <TotalNumberChannels>78</TotalNumberChannels>
   <SelectedNumberChannels>0</SelectedNumberChannels>
  </Station>
 </Network>
 <Network code="TA" startDate="2003-01-01T00:00:00" endDate="2500-12-31T23:59:59" restrictedStatus="open">
  <Description>USArray Transportable Array (NSF EarthScope Project)</Description>
  <TotalNumberStations>1890</TotalNumberStations>
  <SelectedNumberStations>1</SelectedNumberStations>
  <Station code="109C" startDate="2004-05-04T00:00:00" endDate="2599-12-31T23:59:59" restrictedStatus="open" iris:alternateNetworkCodes="_US-ALL,.EARTHSCOPE,_US-TA,_REALTIME,.UNRESTRICTED">
   <Latitude>32.8889</Latitude>
   <Longitude>-117.1051</Longitude>
   <Elevation>150.0</Elevation>
   <Site>
    <Name>Camp Elliot, Miramar, CA, USA</Name>
   </Site>
   <CreationDate>2004-05-04T00:00:00</CreationDate>
   <TotalNumberChannels>172</TotalNumberChannels>
   <SelectedNumberChannels>0</SelectedNumberChannels>
  </Station>
 </Network>
</FDSNStationXML>`;

const RAW_XML_CHANNEL = `<?xml version="1.0" encoding="ISO-8859-1"?>

<FDSNStationXML xmlns="http://www.fdsn.org/xml/station/1" schemaVersion="1.0" xsi:schemaLocation="http://www.fdsn.org/xml/station/1 http://www.fdsn.org/xml/station/fdsn-station-1.0.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:iris="http://www.fdsn.org/xml/station/1/iris">
 <Source>IRIS-DMC</Source>
 <Sender>IRIS-DMC</Sender>
 <Module>IRIS WEB SERVICE: fdsnws-station | version: 1.1.33</Module>
 <ModuleURI>http://service.iris.edu/fdsnws/station/1/query?level=channel&amp;net=CO&amp;sta=JSC&amp;cha=VMW&amp;endafter=2018-06-01</ModuleURI>
 <Created>2018-06-01T15:15:01</Created>
 <Network code="CO" startDate="1987-01-01T00:00:00" endDate="2500-12-31T23:59:59" restrictedStatus="open">
  <Description>South Carolina Seismic Network</Description>
  <TotalNumberStations>14</TotalNumberStations>
  <SelectedNumberStations>1</SelectedNumberStations>
  <Station code="JSC" startDate="2009-04-13T00:00:00" endDate="2599-12-31T23:59:59" restrictedStatus="open" iris:alternateNetworkCodes="_CEUSN,.GREG,.CEUSN-CONTRIB,_US-REGIONAL,_REALTIME,.UNRESTRICTED">
   <Latitude>34.2818</Latitude>
   <Longitude>-81.25966</Longitude>
   <Elevation>103.0</Elevation>
   <Site>
    <Name>Jenkinsville, South Carolina</Name>
   </Site>
   <CreationDate>2009-04-13T00:00:00</CreationDate>
   <TotalNumberChannels>78</TotalNumberChannels>
   <SelectedNumberChannels>1</SelectedNumberChannels>
   <Channel code="VMW" endDate="2599-12-31T23:59:59" locationCode="00" restrictedStatus="open" startDate="2017-06-08T20:42:30">
    <Comment>
     <Value>Install equipment [SENSOR::EPISENSOR ES-T::3309], [SENSOR::TRILLIUM 12</Value>
     <BeginEffectiveTime>2014-05-29T18:43:20</BeginEffectiveTime>
     <EndEffectiveTime>2599-12-31T23:59:59</EndEffectiveTime>
    </Comment>
    <Comment>
     <Value>Reconfigure Hub Logger and change instrumentation</Value>
     <BeginEffectiveTime>2014-05-29T18:43:20</BeginEffectiveTime>
     <EndEffectiveTime>2599-12-31T23:59:59</EndEffectiveTime>
    </Comment>
    <Comment>
     <Value>Install a configured logger and its instruments [SENSOR::EPISENSOR ES-</Value>
     <BeginEffectiveTime>2014-05-29T18:43:20</BeginEffectiveTime>
     <EndEffectiveTime>2599-12-31T23:59:59</EndEffectiveTime>
    </Comment>
    <Comment>
     <Value>Instrument Swap</Value>
     <BeginEffectiveTime>2017-06-08T20:42:30</BeginEffectiveTime>
     <EndEffectiveTime>2599-12-31T23:59:59</EndEffectiveTime>
    </Comment>
    <Comment>
     <Value>Swap [SENSOR::TRILLIUM 120PA::00732]</Value>
     <BeginEffectiveTime>2017-06-08T20:42:30</BeginEffectiveTime>
     <EndEffectiveTime>2599-12-31T23:59:59</EndEffectiveTime>
    </Comment>
    <Latitude>34.281799</Latitude>
    <Longitude>-81.259659</Longitude>
    <Elevation>103</Elevation>
    <Depth>0</Depth>
    <Azimuth>90</Azimuth>
    <Dip>-54.7</Dip>
    <Type>GEOPHYSICAL</Type>
    <Type>HEALTH</Type>
    <SampleRate>1E-01</SampleRate>
    <ClockDrift>0E00</ClockDrift>
    <CalibrationUnits>
     <Name>UNKNOWN</Name>
    </CalibrationUnits>
    <Sensor>
     <Description>TRILLIUM 120PA,VELOCITY-TRANSDUCER,NANOMETRICS</Description>
    </Sensor>
    <Response>
     <InstrumentSensitivity>
      <Value>1E1</Value>
      <Frequency>2.5E-2</Frequency>
      <InputUnits>
       <Name>M/S**2</Name>
       <Description>Acceleration in meters per second squared</Description>
      </InputUnits>
      <OutputUnits>
       <Name>COUNTS</Name>
       <Description>Digital Count in Digital counts</Description>
      </OutputUnits>
     </InstrumentSensitivity>
    </Response>
   </Channel>
  </Station>
 </Network>
</FDSNStationXML>`;
