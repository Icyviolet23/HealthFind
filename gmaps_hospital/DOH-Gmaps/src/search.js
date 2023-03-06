//for the search bar
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
  } from "use-places-autocomplete";
import React from "react";
import {
    Combobox,
    ComboboxInput,
    ComboboxPopover,
    ComboboxList,
    ComboboxOption,
  } from "@reach/combobox";


//used to match data
function prefixMatch (value, data) {
  if (typeof (value) != "string") {
    return false;
  }
  if (value.length < 1) {
    return false;
  }
  for (let i = 0 ; i < data.length; i++) {
    var current_name = data[i].actual_name;
    //safety check
    if (typeof current_name != "string") {
      return false;
    }

    if (current_name.startsWith(value) || current_name.startsWith(value.toUpperCase())) {
      return true;
    }
    else {
      continue;
    }
  }
  return false;
}

//returns empty list if we cant find the data (which should not be the case)
//if not we get the coordinates of the data point
function getlatlng (value, data) {
  if (typeof (value) == "string" && value.length >= 1) {
    for (let i = 0 ; i < data.length; i++) {
      var current_name = data[i].actual_name;
      //safety check
      if (typeof current_name === "string" && value === current_name) {
        return [data[i].lat, data[i].lng];
      }
    }
  }
  return [];
}


//generate list of suggestions
function getSuggestions (value, data, limit) {
  if (typeof (value) != "string") {
    return [];
  };
  if (value.length < 1) {
    return [];
  };


  var set = new Set();
  const result = [];
  for (let i = 0 ; i < data.length; i++) {
    var current_name = data[i].actual_name;
    
    //safety check
    if (typeof current_name != "string") {
      continue;
    };
    //remove leading and ending whitespace
    current_name = current_name.trim();
    if (Number(data[i].current_distance) > limit) {
      continue;
    }

    if (current_name.startsWith(value) || current_name.startsWith(value.toUpperCase())) {
      //duplicate filter
      if (!set.has(current_name)) {
        result.push ([i, current_name]);
        set.add(current_name);
      }
      
    };
  };
  return result;
}


//search bar for restricted data
function Search (props) {
  const {
    ready,
    value,
    suggestions : {status, data},
    setValue,
    clearSuggestions
  } = usePlacesAutocomplete ({
    requestOptions : {
      location : {lat : () => 14.5995, lng : () => 120.9842},
      radius : 50 * 1000, // 50km
    },
  });

  const radius = 10 //km
  const match = prefixMatch (value, props.data);
  //this is an array containing arrays of format [index, suggestion]
  //use this to get suggestions from our dataset only
  var suggestions;
  if (match) {
    suggestions = getSuggestions (value, props.data, radius);
  }
  else {
    suggestions = [];
  }

  const handleInput = (e) => {
    setValue(e.target.value);
  };

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const result = getlatlng (address, props.data);
      if (result.length > 0) {
        const lat = result[0];
        const lng = result[1];
        props.panTo ({lat, lng});
      }
      else{
        console.log ("No coordinates found");
      }
    } catch (error) {
      console.log("😱 Error: ", error);
    }
  };
  
  
  return (
  <div className = "search">
    <Combobox
      onSelect = {handleSelect}
    >
      <ComboboxInput
        value = {value}
        onChange = {handleInput}
        disabled = {!ready}
        placeholder = "Input Address of Facility"
      />
      <ComboboxPopover>
        <ComboboxList>
          {status === "OK" && match && suggestions.map ( (suggestion_object) =>
          <ComboboxOption key = {suggestion_object[0]} value = {suggestion_object[1]}/>
        )}</ComboboxList>

      </ComboboxPopover>
      
    </Combobox>
  </div>)
}

export default Search;