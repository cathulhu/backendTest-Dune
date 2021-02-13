
import React, { useState } from 'react';
import
{
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Line,
  Marker,
  Annotation
} from "react-simple-maps";


const markers = [
  { markerOffset: 25, name: "MANCHESTER", coordinates: [53, 2.2] },
  { markerOffset: 25, name: "RAL_ECHO", coordinates: [46, 6] },
  { markerOffset: 25, name: "CERN_PDUNE_CASTOR", coordinates: [46, 6] },
  { markerOffset: 25, name: "IMPERIAL", coordinates: [46, 6] },
  { markerOffset: 25, name: "FNAL_DCACHE", coordinates: [46, 6] },
];

const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";


function App()
{

  const [transfers, settransfers] = useState([]);

  const action = ()=>
  {
        fetch("http://localhost:3001/test")
        .then(res => res.json())
        .then(res => {


          const mappedLocations = res.data.map((entry) => {
            const sourceLocation = markers.find( location => entry.source === location.name)
            const destinationLocation = markers.find( location => entry.destination === location.name)

            return {
              from: sourceLocation.name, to: destinationLocation.name, fromCoord: sourceLocation.coordinates, toCoord: destinationLocation.coordinates
            };

          })

          settransfers(mappedLocations)
        });
  }



  return (
      <div className="App">

        <header className="App-header">
        </header>

        <body>

        <button onClick={action}>RUN THE THING</button>

        <p> {JSON.stringify(transfers)} </p>



        <ComposableMap data-tip="">
        <ZoomableGroup zoom={1}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => (
                <Geography key={geo.rsmKey}
                geography={geo}



                />
              ))
            }

          </Geographies>

          {transfers.map((oneOfThem) => {

            return  <Line
            to={oneOfThem.toCoord}
            from={oneOfThem.fromCoord}
            stroke="#F53"
            strokeWidth={2}
          />;

          })}

        {markers.map(({ name, coordinates, markerOffset }) => (
        <Marker key={name} coordinates={coordinates}  >
          <circle r={2} fill="#F00" stroke="#fff" strokeWidth={2} />

          <text
            textAnchor="middle"
            y={markerOffset}
            style={{ fontFamily: "system-ui", fill: "#5D5A6D" }}
          >
            {name}
          </text>
        </Marker>


        ))}

        </ZoomableGroup>

      </ComposableMap>



        </body>
      </div>
    );
}


// class App extends React.Component
// {
//   constructor(props)
//   {
//     super(props)
//     this.state={apiResponse:""};
//   }
//
//   callAPI()
//   {
//     fetch("http://localhost:3001/test")
//     .then(res => res.text())
//     .then(res => this.setState({apiResponse: res}));
//   }
//
//   componentDidMount()
//   {
//     this.callAPI();
//   }
//
//
// render()
// {
//   return (
//     <div className="App">
//           <p> {this.state.apiResponse} </p>
//       <header className="App-header">
//       </header>
//
//       <body>
//
//
//
//
//
//       </body>
//     </div>
//   );
// }
//
// }



export default App;
