import React, { useState } from "react";
import ReactTooltip from "react-tooltip";
import ReactDOM from "react-dom";
import Tooltip from "react-simple-tooltip";
import DayPicker, { DateUtils } from 'react-day-picker';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  ZoomableGroup,
  Line,
  Marker,
} from "react-simple-maps";
import "./App.css";
// import siteData from "./data/duneSiteList.json"

// var fs = require('fs');


var resultsFound = false


function dateFormatConverter(passedDate) {
  const date = passedDate.toISOString().split('T')[0].replace(/-/g, "/");
  return date
}




function checkIfResultsFound()
{

  // console.log("results found flag says: " + resultsFound)

  if (resultsFound == undefined){
    return
  }

  if (resultsFound){
      return <p>Results Found</p>
  }
  else{
    return <p>NO RESULTS FOUND</p>
  }

}


//longitude first, then latitude

const markers = [

  { markerOffset: 1, otherName:"", name: "Atlantis", coordinates: [-43, 32.6] },

  { markerOffset: 1, otherName:"", name: "RAL_ECHO", coordinates: [1.2, 51.6] },
  { markerOffset: 1, otherName:"", name: "CERN_PDUNE_CASTOR", coordinates: [6, 46] },
  { markerOffset: 1, otherName:"", name: "PRAGUE", coordinates: [14.469, 50.123] },
  { markerOffset: 1, otherName:"", name: "FNAL_DCACHE", coordinates: [-88.27, 41.84] },

  { markerOffset: 1, otherName:"", name: "DUNE_US_BNL_SDCC", coordinates: [-72.876311, 40.86794] },
  { markerOffset: 1, otherName:"", name: "DUNE_FR_CCIN2P3_XROOTD", coordinates: [4.87, 45.78] },
  { markerOffset: 1, otherName:"", name: "NERSC", coordinates: [-122.272778, 37.871667] },
  { markerOffset: 1, othername:"", name: "WSU - GRID_CE2", coordinates: [42.358, -83.067] },
  { markerOffset: 1, otherName:"", name: "CERN_PDUNE_EOS", coordinates: [0, 0] },
  { markerOffset: 1, otherName:"", name: "T3_US_NERSC", coordinates: [1, 0] },       //placeholder location 4-12-21 someone promised I'd get this, is it 2040 yet?
  { markerOffset: 1, otherName:"", name: "DUNE_FR_CCIN2P3", coordinates: [2, 0] },   //placeholder location 4-12-21 someone promised I'd get this, is it 2040 yet?

  //stuff commented out below has been found in the API results from CRIC API so I figure we should favor that

  // { markerOffset: 1, name: "MANCHESTER", coordinates: [2.2, 53] },
  // { markerOffset: 1, name: "LANCASTER", coordinates: [-2.74, 54.012] },
  // { markerOffset: 1, name: "LIVERPOOL", coordinates: [-3, 53.4] },
  // { markerOffset: 1, name: "NIKHEF", coordinates: [4.951, 52.3] },
  // { markerOffset: 1, name: "IMPERIAL", coordinates: [0.17, 51.4] },
  // { markerOffset: 1, name: "QMUL", coordinates: [-0.041, 51.523] },
  // { markerOffset: 1, name: "RAL-PP", coordinates: [51.57, -1.31] },

];

const baseUrlBackend="http://fermicloud129.fnal.gov:3001"

const geoUrl =
  "./world-110m.json";

function App() {
  const [transfers, settransfers] = useState([]);
  const [individualSiteData, setIndividualSiteData] = useState([]);

  const [dateRange, setDateRange] = useState({from: undefined, to: undefined});
  const [savedStartDate, setSavedStartDate]=useState();
  const [savedEndDate, setSavedEndDate]=useState();









  const resetCalendarDateClick = () => {
    setDateRange({from: undefined, to: undefined})
  }






  const handleDateClick = (day) => {

    if (dateRange.to) {
      resetCalendarDateClick()
    }
    else{
      const range = DateUtils.addDayToRange(day, dateRange);
      setDateRange(range)
    }


  }






const parseSiteList = () => {

  console.log("fetching DUNE site date from backend fermicloud129.fnal.gov:3001/getsites")
  fetch("http://localhost:3001" + "/getsites").then ((res) => res.json()).then((res) => {

    //res.root.atp_site[0].$.latitude
    // console.log(res.root.atp_site)
    console.log("Dune Site list updated as of: " + res.root.last_update[0])

    const mappedSites = res.root.atp_site.map((item) => {

      var otherNameString = item.group[1].$.name
      let re = new RegExp('[A-Z][A-Z]_');

      if (re.test(otherNameString))
      {
        otherNameString = otherNameString.substring(3).toUpperCase();
      }


      return{
        markerOffset: 1,
        name: item.$.name.toUpperCase(),
        otherName: otherNameString,
        coordinates: [parseFloat(item.$.longitude),parseFloat(item.$.latitude)]

      };
    });

    //append these to the existing hardcoded sites
    mappedSites.forEach(x =>  markers.push(x))

    console.log(mappedSites)
    console.log(markers)
    // console.log(res.root.atp_site[0].group[1].$.name)

    parseTransfers()

  });



};




  const parseTransfers = () => {

    resultsFound=false

    setSavedStartDate(dateFormatConverter(dateRange.from))
    setSavedEndDate(dateFormatConverter(dateRange.to))

    var dateParameters = new URLSearchParams({"startDate": dateFormatConverter(dateRange.from), "endDate": dateFormatConverter(dateRange.to)});

    console.log("fetching transfer data from: fermicloud129.fnal.gov:3001/test?" + dateParameters.toString())

    fetch("http://localhost:3001" + "/test?" + dateParameters.toString())
//TODO: set a timeout on the promise above so that if there is just NO out.json file it won't hang
      .then((res) => res.json())
      .then((res) => {

        let allTransferedAmount = 0;


        console.log("result: ")
        console.log(res.data)



        if (res.data[0][0].hasOwnProperty("name") && res.data[0][0].name!=="ERROR") {

//TODO: modify this so that if the search fails we don't crash, maybe try/accept or if statement

          var sourceLocationAlt=markers[0].name
          var destinationLocationAlt=markers[0].name
          var mysteryCoordinates=markers[0].coordinates

          const mappedTransfers = res.data[0].map((entry) => {



            const sourceLocation = markers.find(
            (location) => entry.source === location.name
          );


            const destinationLocation = markers.find(
            (location) => entry.destination === location.name
          );


            const speedInMB = parseFloat(entry["transfer_speed(MB/s)"]).toFixed(
              2
            );

            allTransferedAmount += entry.file_size;

            // console.log(entry.file_size)

            if (!sourceLocation && !destinationLocation){
              return {
                from: sourceLocationAlt,
                to: destinationLocationAlt,
                fromCoord: mysteryCoordinates,
                toCoord: mysteryCoordinates,
                speedInMB: speedInMB,
                sentToDestSizeMB: entry.file_size / 1048576,
              };
            }else if (!sourceLocation){
              return {
                from: sourceLocationAlt,
                to: destinationLocation.name,
                fromCoord: mysteryCoordinates,
                toCoord: destinationLocation.coordinates,
                speedInMB: speedInMB,
                sentToDestSizeMB: entry.file_size / 1048576,
              };
            }else if (!destinationLocation){
              return {
                from: sourceLocation.name,
                to: destinationLocationAlt,
                fromCoord: sourceLocation.coordinates,
                toCoord: mysteryCoordinates,
                speedInMB: speedInMB,
                sentToDestSizeMB: entry.file_size / 1048576,
              };
            }else{
                return {
               from: sourceLocation.name,
               to: destinationLocation.name,
               fromCoord: sourceLocation.coordinates,
               toCoord: destinationLocation.coordinates,
               speedInMB: speedInMB,
               sentToDestSizeMB: entry.file_size / 1048576,
             };
            }


          });


          console.log("mapped transfers: ")
          console.log(mappedTransfers)


          allTransferedAmount /= 1048576; //adjusting to mb

          settransfers(mappedTransfers);

          // console.log(markers)

          const collectionOfSiteObjects = markers.map((x) => {
            return {
              ...x,
              totalSent: 0,
              totalReceived: 0,
            };
          });

          console.log("collection site objects:")
          console.log(collectionOfSiteObjects)

          collectionOfSiteObjects.forEach((entry) => {

            console.log(entry)

            res.data[0]
              .filter((jsonThing) => {
                return jsonThing.source === entry.name;
              })
              .forEach((item, i) => {
                entry.totalSent += item.file_size / 1048576; //dividing the total bytes into megabytes 1024 b to kb, 1024 kb to mb
              });

            res.data[0]
              .filter((jsonThing) => {
                return jsonThing.destination === entry.name;
              })
              .forEach((item, i) => {
                entry.totalReceived += item.file_size / 1048576; //dividing the total bytes into megabytes 1024 b to kb, 1024 kb to mb
              });

            entry.fractionOfDataSent = entry.totalSent / allTransferedAmount;
            entry.fractionOfDataReceived =
              entry.totalReceived / allTransferedAmount;

            entry.totalSent = parseFloat(entry.totalSent).toFixed(2);
            entry.totalReceived = parseFloat(entry.totalReceived).toFixed(2);
            entry.fractionOfDataSent = parseFloat(
              entry.fractionOfDataSent
            ).toFixed(4);
          });


          resultsFound=true;
          // console.log("Results found:")
          // console.log(collectionOfSiteObjects);

          setIndividualSiteData(collectionOfSiteObjects);


        }
        else {
          resultsFound=false;
          console.log("No results returned for DUNE transfers")
          console.log(resultsFound)
        }


      });
  };









  const [tooltip, setTooltip] = useState("");
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom:   1 });


  return (



    <div className="App">
      <header className="App-header">
        <h1>DUNE Network Activity Monitor - Alpha</h1>
      </header>


      <div class="basicRow">
        <div class="basicColumn">
          <div id={"map"}>
            <ComposableMap data-tip="">
              <ZoomableGroup zoom={3} center={[-34, 34]}>

                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography key={geo.rsmKey} geography={geo} fill="#9998A3" stroke="#EAEAEC" />
                    ))
                  }
                </Geographies>
                {transfers.map((oneOfThem, i) => {
                  return (
                    <Line
                      key={i}
                      to={oneOfThem.toCoord}
                      from={oneOfThem.fromCoord}
                      stroke="#F53"
                      strokeWidth={1}
                      onMouseEnter={() => {
                        // setTooltip(`Last AVG speed: ${oneOfThem.speedInMB} MB/s`);       //need to consider what, if any, we want to put in tooltip over transfer line
                      }}
                      onMouseLeave={() => {
                        setTooltip("");
                      }}
                    />
                  );
                })}
                //could add another line here ^ to show ration of send vs recieve between individual sites but it's one within another not side by side so doesn't look great.
                {individualSiteData.map(
                  (
                    {
                      name,
                      coordinates,
                      markerOffset,
                      totalSent,
                      fractionOfDataSent,
                      fractionOfDataReceived,
                    },
                    i
                  ) => (
                    <Marker key={i} coordinates={coordinates}
                    onClick={() => {
                      //alert("click action here");
                      //alert("radius click")
                    }}
                    >
                      <circle r={1} fill="rgba(255,255,255,1)" />
                      <circle
                        r={40 * fractionOfDataSent}
                        fill="rgba(87,235,51,0.4)"
                      />{" "}
                      //send fraction circle
                      <circle
                        r={40 * fractionOfDataReceived}
                        fill="rgba(12,123,220,0.4)"
                      />{" "}
                      //recieve fraction circle
                    </Marker>
                  )
                )}
                {individualSiteData.map(
                  (
                    {
                      name,
                      coordinates,
                      markerOffset,
                      totalSent,
                      totalReceived,
                      fractionOfDataSent,
                      fractionOfDataReceived,
                    },
                    i
                  ) => (
                    <Marker
                      key={i}
                      coordinates={coordinates}
                      onClick={() => {
                        //alert("center click");
                      }}
                      onMouseEnter={() => {
                        setTooltip(
                          `${name}<br> TX: ${totalSent} MB <br>  RX: ${totalReceived} MB`
                        );
                      }}
                      onMouseLeave={() => {
                        setTooltip("");
                      }}
                    >
                      <circle r={1} fill="rgba(75,0,146,1)" />
                    </Marker>
                  )
                )}
              </ZoomableGroup>
            </ComposableMap>
          </div>
          <ReactTooltip html={true}>{tooltip}</ReactTooltip>

        </div>







        <DayPicker
          selectedDays={[dateRange.from, dateRange]}
          onDayClick={handleDateClick}
        />









      </div>
      <div class="basicRow">

      {dateRange.to && <button onClick={parseSiteList}>Get DUNE Transfer Data</button>}

      <button disabled={!dateRange.from} className="link" onClick={resetCalendarDateClick}>
        Reset Selected Dates
      </button>

      {checkIfResultsFound()}


      </div>
      <div class="basicRow">
      <div class="basicColumn">
        {resultsFound && <p>Showing Transfers from {savedStartDate} to {savedEndDate}</p>}
        {resultsFound && JSON.stringify(transfers)}
      </div>
      </div>
    </div>
  );
}

export default App;
