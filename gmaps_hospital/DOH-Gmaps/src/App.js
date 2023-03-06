//adapted from https://github.com/leighhalliday/google-maps-react-2020

import React, { useState, useEffect } from 'react';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";


import "@reach/combobox/styles.css";
import Papa from 'papaparse';
import Dropdown from './dropdown';
import Search from './search';
import NearbyList from './listview';
import PlacesAutocompleteSearch from './placesAutocompleteSearch';
import GMAP_API_KEY from "./Config";

//parsing hospital_data
var custom_hospital_data;
Papa.parse("mapping_data_hospital.csv", {
  header : true,
  download: true,
  dynamicTyping: true,
  header: true,
  complete: function(results) {
    custom_hospital_data = results.data;
  }
});

//parsing custom dialysis clinic data
var custom_dialysis_data;
Papa.parse("mapping_data_dialysis.csv", {
  header : true,
  download: true,
  dynamicTyping: true,
  header: true,
  complete: function(results) {
    custom_dialysis_data = results.data;
  }
});

var custom_covidlab_data;
Papa.parse("mapping_data_covidlab.csv", {
  header : true,
  download: true,
  dynamicTyping: true,
  header: true,
  complete: function(results) {
    custom_covidlab_data = results.data;
  }
});

//map
const libraries = ["places"];
const mapContainerStyle = {
  height: "100vh",
  width: "100vw",
};

//default center
const center = {
  lat : 14.5995,
  lng : 120.9842 
};


const options = {
  disableDefaultUI : true,
  zoomControl : false,
  gestureHandling : 'greedy'
};

//calculates the straight line distance
//https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
function getDistance(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

//updates the data and sorts the data
function update_custom_data_withDistance (browser_lat, browser_lng, data) {
  for (let i = 0 ; i < data.length; i++) {
    const lat = data[i].lat;
    const lng = data[i].lng;
    //safety check
    if (typeof lng == "undefined" || typeof lat == "undefined") {
      continue;
    };
    const distance = getDistance(browser_lat,browser_lng,lat,lng).toFixed(1);
    data[i].current_distance = distance;
    data[i].gmaps_url = "https://www.google.com/maps/dir/?api=1&origin=" + String(browser_lat) 
                        + "," + String(browser_lng) + "&destination=" + String(lat) + "," + String(lng);
  };
  
  //we do sorting here since this is an initialization function
  data.sort (function (point1, point2) {
      return point1.current_distance - point2.current_distance
  })

}

//for geolocation (panning to)
function Locate ({panTo}) {
  return (
    <button id = "locate" className = "locate" onClick =  {
      () => {navigator.geolocation.getCurrentPosition
        
        ((position) => 
        
        {
          panTo ({
            lat : position.coords.latitude, 
            lng : position.coords.longitude
          });
          
        }
        , () => null, options); 
      }}>
      <img src = "compass.svg" alt = "My position"/>
    </button>
  );
}

function ListViewButton (props) {
  return (
    <button id = "ListViewButton" className = "ListViewButton" onClick = {() => props.setTrigger(!props.trigger)}>
      <img src = "nearby.png"/>
    </button>
  );
}

export default function App () {
    const { isLoaded, loadError} = useLoadScript ({
        googleMapsApiKey : GMAP_API_KEY,
        libraries,
    });

    const [data, setData] = useState([]);

    //retain state information with rerendering
    const mapRef = React.useRef();
    const onMapLoad = React.useCallback ((map) => {
      mapRef.current = map;
      //setting the state and initializing the data
      var compass = document.getElementById('locate');
      compass.click();
      //initialize search bar data to map data
      setData (custom_hospital_data);     

    }, []); 

    //for own markers
    const [markers, setMarkers] = useState([]);
    //display information about selected marker for hospitals
    const [selected_hospital_marker, setHospitalSelected] = useState(null);
    //display information about selected marker for dialysis center
    const [selected_dialysis_marker, setDialysisSelected] = useState(null);
    //display information about selected marker for covidlab center
    const [selected_covidlab_marker, setCovidLabSelected] = useState(null);

    //function to move to the selected place
    const moveTo = React.useCallback(({lat, lng}) => {
      var myLatlng = new window.google.maps.LatLng(parseFloat(lat),parseFloat(lng));
      mapRef.current.panTo(myLatlng);
      mapRef.current.setZoom(15);
    }, []);

    //set custom current address
    const moveToCustomCurrentAddress = React.useCallback(({lat, lng}) => {
      var myLatlng = new window.google.maps.LatLng(parseFloat(lat),parseFloat(lng));
      mapRef.current.panTo(myLatlng);
      mapRef.current.setZoom(15);
      setMarkers((current) => [
        {
          lat: Number(lat),
          lng: Number(lng),
          time: new Date(),
        },
      ]);
      update_custom_data_withDistance (lat, lng, custom_hospital_data);
      update_custom_data_withDistance (lat, lng, custom_dialysis_data);
      update_custom_data_withDistance (lat, lng, custom_covidlab_data);
    }, []);


    const mockGeolocation = React.useCallback(({lat, lng}) => {
      const mocklat = Number(14.447282);
      const mocklng = Number(120.917419);
      const position = new window.google.maps.LatLng(mocklat,mocklng)
      mapRef.current.panTo(position);
      mapRef.current.setZoom(13);
      //setting the new marker
      setMarkers((current) => [
        {
          lat: mocklat,
          lng: mocklng,
          time: new Date(),
        },
      ]); 

      update_custom_data_withDistance (mocklat, mocklng, custom_hospital_data);
      update_custom_data_withDistance (mocklat, mocklng, custom_dialysis_data);
      update_custom_data_withDistance (mocklat, mocklng, custom_covidlab_data);
    }, []);

    const goToMyLocation = React.useCallback(({lat, lng}) => {
      mapRef.current.panTo({lat, lng});
      mapRef.current.setZoom(13);
      //setting the new marker
      setMarkers((current) => [
        {
          lat: Number(lat),
          lng: Number(lng),
          time: new Date(),
        },
      ]);
      update_custom_data_withDistance (lat, lng, custom_hospital_data);
      update_custom_data_withDistance (lat, lng, custom_dialysis_data);
      update_custom_data_withDistance (lat, lng, custom_covidlab_data);
    }, []);

    
    //set state for enabling and disabling markers
    const [enableHospitalData, setEnableHospitalData] = useState(true);
    const [enableDialysisData, setEnableDialysisData] = useState(false);
    const [enableCovidLabData, setEnableCovidLabData] = useState(false);

    

    //data for the menu
    const items = [
      {
        id: 1,
        value: 'Hospitals',
        markersetterFunction : setEnableHospitalData,
        markertoggle : enableHospitalData,
        dataset: custom_hospital_data,
        datasetSetter : setData
      },
      {
        id: 2,
        value: 'Dialysis Clinics',
        markersetterFunction : setEnableDialysisData,
        markertoggle : enableDialysisData,
        dataset: custom_dialysis_data,
        datasetSetter : setData
      },
      {
        id: 3,
        value: 'COVID Labs',
        markersetterFunction : setEnableCovidLabData,
        markertoggle : enableCovidLabData,
        dataset: custom_covidlab_data,
        datasetSetter : setData
      },
    ];

    //state for enabling and disabling the list view
    const [enableListView, setListView] = useState(false);
    

    if (loadError) return "There was an error loading the map";
    if (!isLoaded) return "Welcome, loading in progress";

    return (
      <div>
        
        <PlacesAutocompleteSearch panTo = {moveToCustomCurrentAddress}></PlacesAutocompleteSearch>

        <Search panTo = {moveTo} data = {data}></Search>
        <Locate panTo = {mockGeolocation}></Locate>
        <ListViewButton trigger = {enableListView} setTrigger = {setListView}></ListViewButton>

        
        
        
        <GoogleMap 
        mapContainerStyle = {mapContainerStyle} 
        zoom = {12} 
        center = {center}
        options = {options}
        onLoad = {onMapLoad}
        
        > 

        <div className="container">
          <Dropdown title=  "Menu" items={items} nearbyListStateSetter = {setListView}/>
        </div>

        {enableListView ? 
        <NearbyList 
        data = {data} 
        panTo = {moveTo} 
        limit = {20} 
        mapRef = {mapRef}
        trigger = {enableListView} 
        setTrigger = {setListView}
        >
        </NearbyList> : null}
        
        {markers.map((marker) => (
          <Marker
            key={marker.lat - marker.lng}
            position={{ lat: marker.lat, lng: marker.lng }}
            icon={{
              url: 'ownlocation.jpg',
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(15, 15),
              scaledSize: new window.google.maps.Size(50, 50),
            }}
          />
        ))}
        
        {enableHospitalData ? custom_hospital_data.map((marker) => (
          <Marker 
            key = {marker.index}
            position = {{lat : Number(marker.lat), lng : Number(marker.lng)}}
            title = {marker.mapping_address}
            onClick={() => {
              setHospitalSelected(marker);
            }}
            icon={{
              url: 'red_marker.png',
              origin: new window.google.maps.Point(0, 0),
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            />
        )) : null}

        {enableDialysisData ? custom_dialysis_data.map((marker) => (
          <Marker 
            key = {marker.index}
            position = {{lat : Number(marker.lat), lng : Number(marker.lng)}}
            title = {marker.mapping_address}
            onClick={() => {
              setDialysisSelected(marker);
            }}
            icon={{
              url: 'blue_marker.png',
              origin: new window.google.maps.Point(0, 0),
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            />
        )) : null}

        {enableCovidLabData ? custom_covidlab_data.map((marker) => (
          <Marker 
            key = {marker.index}
            position = {{lat : Number(marker.lat), lng : Number(marker.lng)}}
            title = {marker.mapping_address}
            onClick={() => {
              setCovidLabSelected(marker);
            }}
            icon={{
              url: 'green_marker.png',
              origin: new window.google.maps.Point(0, 0),
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            />
        )) : null}


        {selected_hospital_marker ? (
          <InfoWindow
            position={{ lat: Number(selected_hospital_marker.lat), lng: Number(selected_hospital_marker.lng) }}
            onCloseClick={() => {
              setHospitalSelected(null);
            }}
          >
            <div>
              <h4>
                Hospital Name: {selected_hospital_marker.actual_name}
              </h4>
              <h4>
                Email : {selected_hospital_marker.email}
              </h4>
              <h4>
                Medical Director: {selected_hospital_marker.medical_director}
              </h4>
              <h4>
                Contact : {selected_hospital_marker.contact}
              </h4>
              <h4>
                Distance from current position: {selected_hospital_marker.current_distance} km
              </h4>  
              <a href={selected_hospital_marker.gmaps_url} target="_blank">
                  <button className = "route_button">
                    Get Route
                  </button>
              </a>       
            </div>
          </InfoWindow>
        ) : null}


        {selected_dialysis_marker ? (
          <InfoWindow
            position={{ lat: Number(selected_dialysis_marker.lat), lng: Number(selected_dialysis_marker.lng) }}
            onCloseClick={() => {
              setDialysisSelected(null);
            }}
          >
            <div>
              <h4>
                Dialysis Clinic Name: {selected_dialysis_marker.actual_name}
              </h4>
              <h4>
                Email : {selected_dialysis_marker.email}
              </h4>
              <h4>
                Facility Head : {selected_dialysis_marker.head_of_the_facility}
              </h4>
              <h4>
                Contact : {selected_dialysis_marker.contact_number}
              </h4>
              <h4>
                Distance from current position: {selected_dialysis_marker.current_distance} km
              </h4>  
              <a href={selected_dialysis_marker.gmaps_url} target="_blank">
                  <button className = "route_button">
                    Get Route
                  </button>
              </a>       
            </div>
          </InfoWindow>
        ) : null}


        {selected_covidlab_marker ? (
          <InfoWindow
            position={{ lat: Number(selected_covidlab_marker.lat), lng: Number(selected_covidlab_marker.lng) }}
            onCloseClick={() => {
              setCovidLabSelected(null);
            }}
          >
            <div>
              <h4>
                Lab Name: {selected_covidlab_marker.actual_name}
              </h4>
              <h4>
                Type of Testing : {selected_covidlab_marker.type_of_testing}
              </h4>
              <h4>
                Ownership : {selected_covidlab_marker.ownership}
              </h4>
              <h4>
                Distance from current position: {selected_covidlab_marker.current_distance} km
              </h4>  
              <a href={selected_covidlab_marker.gmaps_url} target="_blank">
                  <button className = "route_button">
                    Get Route
                  </button>
              </a>       
            </div>
          </InfoWindow>
        ) : null}


        </GoogleMap>


        
      </div>
      );
}

