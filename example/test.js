

// this comes from the seisplotjs_fdsnstation bundle
var fdsnstation = seisplotjs_fdsnstation
var daysAgo = 10;

var staQuery = new fdsnstation.StationQuery()
  .networkCode("TA,CO").stationCode('109C,JSC');
var url = staQuery.formURL(fdsnstation.LEVEL_STATION);
d3.select("div.url")
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
  var table = d3.select("div.stations")
    .select("table");
  if ( table.empty()) {
    table = d3.select("div.stations")
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
    .append("button")
    .text("Channels")
    .on("click", function(d) {
      listChannels(d);
    });
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
});


var listChannels = function(sta) {
      var chanQuery = new fdsnstation.StationQuery()
       .networkCode(sta.network().networkCode())
       .stationCode(sta.stationCode());
      var chanUrlP = d3.select("div.chanurl")
          .select("p");
      if (chanUrlP.empty()) {
        chanUrlP = d3.select("div.chanurl")
          .append("p");
      }
      chanUrlP.selectAll("*").remove();
      var chanurl = chanQuery.formURL(fdsnstation.LEVEL_CHANNEL);
      chanUrlP
          .append("a")
          .attr("href", chanurl)
          .text("URL: "+chanurl);
      chanQuery.queryChannels().then(function(staml) {

      var table = d3.select("div.channels")
        .select("table");
      if ( table.empty()) {
        table = d3.select("div.channels")
          .append("table");
        var th = table.append("thead").append("tr");
        th.append("th").text("Code");
        th.append("th").text("Start");
        th.append("th").text("Lat,Lon");
        th.append("th").text("Elev");
        th.append("th").text("Depth");
        th.append("th").text("Az/Dip");
        th.append("th").text("Restrict");
        th.append("th").text("In Unit");
        th.append("th").text("Out Unit");
        th.append("th").text("Sens.");
        th.append("th").text("Freq.");
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
      tr.append("td")
        .text(function(d) {
          return (d.response() && d.response().instrumentSensitivity() ) ? d.response().instrumentSensitivity().inputUnits()+" " : "";
        });
      tr.append("td")
        .text(function(d) {
          return (d.response() && d.response().instrumentSensitivity() ) ? d.response().instrumentSensitivity().outputUnits()+" " : "";
        });
      tr.append("td")
        .text(function(d) {
          return (d.response() && d.response().instrumentSensitivity() ) ? d.response().instrumentSensitivity().sensitivity()+" " : "";
        });
      tr.append("td")
        .text(function(d) {
          return (d.response() && d.response().instrumentSensitivity() ) ? d.response().instrumentSensitivity().frequency()+" " : "";
        });
      tr.on("click", function(d){
        console.log("click channel: "+d.codes());
        chanQuery.locationCode(d.locationCode())
          .channelCode(d.channelCode())
          .startTime(d.startDate())
          .endTime(d.endDate());
        chanQuery.queryResponse().then(function(nets) {
          console.log("got response: "+nets[0].stations()[0].channels()[0].response());
          var respUrlP = d3.select("div.responseurl")
            .select("p");
          if (respUrlP.empty()) {
            respUrlP = d3.select("div.responseurl")
              .append("p");
          }
          respUrlP.selectAll("*").remove();
          var respurl = chanQuery.formURL(fdsnstation.LEVEL_RESPONSE);
          respUrlP
              .append("a")
              .attr("href", respurl)
              .text("URL: "+respurl);
          var responseCode = d3.select("div.response")
            .select("code");
          if (responseCode.empty()) {
            responseCode = d3.select("div.response").append("code");
          }
          responseCode.selectAll("*").remove();
          var sense = nets[0].stations()[0].channels()[0].response().instrumentSensitivity();
          var resp = nets[0].stations()[0].channels()[0].response();
          responseCode.text(sense ? (sense.sensitivity()+" "+sense.outputUnits()+" per "+sense.inputUnits()+" at "+sense.frequency()+" Hz") : "No Sensitivity");
          let stageText = "";
          let sZero = resp.stages()[0];
          if (sZero) {
            let filter = sZero.filter();
            if (filter) {
              stageText = "in: "+filter.inputUnits()+" out: "+filter.outputUnits()+" ";
              if (filter instanceof fdsnstation.model.PolesZeros) {
                stageText += "PolesZeros: ";
              } else if (filter instanceof fdsnstation.model.FIR) {
                stageText += "FIR: ";
              } else if (filter instanceof fdsnstation.model.CoefficientsFilter) {
                stageText += "CoefficientsFilter: ";
              }
            }
          }
          responseCode.text("stages: "+resp.stages().length+" stage 0:"+stageText);
        });
      });

    })
    .catch( function(reason) {
    console.log("Reject: "+reason);
    d3.select("div.stations")
        .append("p")
        .text("Reject: "+reason);
    throw reason;
    });
}
