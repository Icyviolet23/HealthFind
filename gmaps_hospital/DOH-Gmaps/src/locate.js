//for geolocation using browser coordinates

//for geolocation (panning to)
import React from "react";
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

export default Locate;