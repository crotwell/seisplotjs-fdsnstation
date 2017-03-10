

// this comes from the seisplotjs waveformplot bundle
var wp = seisplotjs_waveformplot
var traveltime = seisplotjs_traveltime
var fdsnstation = seisplotjs_fdsnstation
var daysAgo = 10;

var staQuery = new fdsnstation.StationQuery()
  .networkCode("CO,SP");
var url = staQuery.formURL(fdsnstation.LEVEL_STATION);
wp.d3.select("div.url")
    .append("a")
    .attr("href", url)
    .text("URL: "+url);

staQuery.queryStations().then(function(staml) {
  console.log("got staml :"+staml.length);
  if (staml.length > 0) {
    console.log("stations length :"+staml[0].stations.length);
  } else {
    console.log("no stations in first network");
  }
  var table = wp.d3.select("div.stations")
    .select("table");
  if ( table.empty()) {
    table = wp.d3.select("div.stations")
      .append("table");
    var th = table.append("thead").append("tr");
    th.append("th").text("Code");
    th.append("th").text("Start");
    th.append("th").text("Lat,Lon");
    th.append("th").text("Elev");
    th.append("th").text("Restrict");
    th.append("th").text("Name");
    table.append("tbody");
  }

  var allStations = staml.reduce(function(acc, val) {
    if (val && val.stations) {
      acc = acc.concat(val.stations());
    }
    return acc;
  }, [] );

  var tableData = table.select("tbody")
    .selectAll("tr")
    .data(allStations, function(d) { return d.codes();});

  tableData.exit().remove();
  var tr = tableData.enter()
    .append("tr");

  tr.append("td")
    .text(function(d) {
      return d.codes();
    });
  tr.append("td")
    .text(function(d) {
      return d.startDate().toISOString();
    });
  tr.append("td")
    .text(function(d) {
      return "("+d.latitude()+", "+d.longitude()+")";
    });
  tr.append("td")
    .text(function(d) {
      return (d.elevation())+" m ";
    });
  tr.append("td")
    .text(function(d) {
      return d.restrictedStatus()+" ";
    });
  tr.append("td")
    .text(function(d) {
      return d.name()+" ";
    });

    tr.on("click", function(d){
console.log("click "+d.network().networkCode()+"."+d.stationCode());
      var chanQuery = new fdsnstation.StationQuery()
       .networkCode(d.network().networkCode())
       .stationCode(d.stationCode());
      var chanUrlP = wp.d3.select("div.chanurl")
          .select("p");
      if (chanUrlP.empty()) {
        chanUrlP = wp.d3.select("div.chanurl")
          .append("p");
      }
      chanUrlP.selectAll("*").remove();
      var chanurl = chanQuery.formURL(fdsnstation.LEVEL_CHANNEL);
      chanUrlP
          .append("a")
          .attr("href", chanurl)
          .text("URL: "+chanurl);
      chanQuery.queryChannels().then(function(staml) {

      var table = wp.d3.select("div.channels")
        .select("table");
      if ( table.empty()) {
        table = wp.d3.select("div.channels")
          .append("table");
        var th = table.append("thead").append("tr");
        th.append("th").text("Code");
        th.append("th").text("Start");
        th.append("th").text("Lat,Lon");
        th.append("th").text("Elev");
        th.append("th").text("Depth");
        th.append("th").text("Az/Dip");
        th.append("th").text("Restrict");
        table.append("tbody");
      }
      var tableData = table.select("tbody")
        .selectAll("tr")
        .data(staml[0].stations()[0].channels(), function(d) { return d.codes()+d.startDate();});
      tableData.exit().remove();
      var tr = tableData.enter()
        .append("tr");

      tr.append("td")
        .text(function(d) {
          return d.codes();
        });
      tr.append("td")
        .text(function(d) {
          return d.startDate().toISOString();
        });
      tr.append("td")
        .text(function(d) {
          return "("+d.latitude()+", "+d.longitude()+")";
        });
      tr.append("td")
        .text(function(d) {
          return (d.elevation())+" m ";
        });
      tr.append("td")
        .text(function(d) {
          return (d.depth())+" m ";
        });
      tr.append("td")
        .text(function(d) {
          return "("+d.azimuth()+", "+d.dip()+")";
        });
      tr.append("td")
        .text(function(d) {
          return d.restrictedStatus()+" ";
        });
        });

    });
    
})
.catch( function(reason) {
console.log("Reject: "+reason);
wp.d3.select("div.stations")
    .append("p")
    .text("Reject: "+reason);
throw reason;
});

var plotSeismograms = function(div, net, sta, loc, chan, quake) {
  var dur = 900;
  var host = 'service.iris.edu';
  var protocol = 'http:';
    if ("https:" == document.location.protocol) {
      protocol = 'https:'
    }
var jsclat = 34;
var jsclon = -81;
var pOffset = -120;
var clockOffset = 0; // set this from server somehow!!!!
    console.log("calc start end: "+quake.time+" "+dur+" "+clockOffset);
    new traveltime.TraveltimeQuery()
        .evdepth(quake.depth/1000)
        .evlat(quake.latitude).evlon(quake.longitude)
        .stalat(jsclat).stalon(jsclon)
        .phases('p,P,PKP,PKIKP,Pdiff,s,S,Sdiff,PKP,SKS,SKIKS,PP,PcP,pP,sS,PKKP,SKKS,SS')
        .query()
        .then(function(ttimes) {
    var firstP = ttimes.arrivals[0];
    for (var p=0; p<ttimes.arrivals.length; p++) {
      if (firstP.time > ttimes.arrivals[p]) {
        firstP = ttimes.arrivals[p];
      }
    }
    var PArrival = new Date(quake.time.getTime()+(firstP.time+pOffset)*1000);
    var seisDates = wp.calcStartEndDates(PArrival, null, dur, clockOffset);
    var startDate = seisDates.start;
    var endDate = seisDates.end;

console.log("Start end: "+startDate+" "+endDate);
    var url = wp.formRequestUrl(protocol, host, net, sta, loc, chan, startDate, endDate);
console.log("Data request: "+url);
wp.loadParse(url, function (error, dataRecords) {
      if (error) {
        div.append('p').html("Error loading data." );
      } else {
          div.selectAll('div.myseisplot').remove();
          var byChannel = wp.miniseed.byChannel(dataRecords);
          var keys = Object.keys(byChannel);
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var segments = wp.miniseed.merge(byChannel[key]);
            div.append('p').html('Plot for ' + key);
            var svgdiv = div.append('div').attr('class', 'myseisplot');
            if (segments.length > 0) {
                var seismogram = new wp.chart(svgdiv, segments, startDate, endDate);
                var markers = [];
                for (var m=0;m<ttimes.arrivals.length; m++) {
                  markers.push({ name: ttimes.arrivals[m].phase, time: new Date(quake.time.getTime()+(ttimes.arrivals[m].time)*1000) });
                }
                seismogram.appendMarkers(markers);
                seismogram.draw();
            }
        }
        if (keys.length==0){
            divs.append('p').html('No data found');
        }
      }
    });
    });
}

