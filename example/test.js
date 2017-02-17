

// this comes from the seisplotjs waveformplot bundle
var wp = seisplotjs_waveformplot
var traveltime = seisplotjs_traveltime
var fdsnstation = seisplotjs_fdsnstation
var daysAgo = 10;

var staQuery = new fdsnstation.StationQuery()
  .networkCode("CO");
wp.d3.select("div.url")
    .append("p")
    .text("URL: "+staQuery.formURL(fdsnstation.LEVEL_STATION));
staQuery.queryStations().then(function(staml) {
console.log("got staml :"+staml.length);
console.log("stations length :"+staml[0].stations.length);
  wp.d3.select("div.stations")
    .selectAll("p")
    .data(staml[0].stations)
    .enter() 
    .append("p")
    .text(function(d) {
console.log("station startDate: "+d.startDate);
      return "station: "
          +d.code+" "
          +d.startDate.toISOString()+" "
          +d.restrictedStatus+" "
          +"("+d.latitude+", "+d.longitude+") "
          +d.name;
    })
    .on("click", function(d){
console.log("click "+d.time);
      wp.d3.select("div.seismograms")
        .selectAll("p")
        .remove();
      wp.d3.select("div.seismograms")
        .selectAll("p")
        .data([d])
        .enter()
        .append("p")
        .text(function(d) {
          return "quake: "
              +d.time.toISOString()+" "
              +d.magnitude.value+" "
              +d.magnitude.type+" "
              +"("+d.latitude+", "+d.longitude+") "
              +(d.depth/1000)+"km "
              +d.description;
        });
      // plotSeismograms(wp.d3.select("div.seismograms"),
      //                 "CO", "JSC", "00", "HHZ", d);
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
