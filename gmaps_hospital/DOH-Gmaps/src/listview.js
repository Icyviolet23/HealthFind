import React from 'react';

function handleOnClick (item, props) {
    const lat = Number(item.lat);
    const lng = Number(item.lng);
    const position = new window.google.maps.LatLng(lat,lng)
    console.log(position, lat, lng);
    props.mapRef.current.panTo (position);
    props.mapRef.current.setZoom (17);
    props.setTrigger(!props.trigger);
}

function NearbyList (props){
    var unsorted = props.data;
    if (typeof props.data != "undefined") {
        var data = unsorted.slice(0, props.limit);
        return (
            <ul className = "listview">
                <h2>
                    Closest Facilities to me
                </h2>
                {data.map(item => (
                <li key={item.index} className = "listview_item" onClick = {() => handleOnClick (item, props)}>
                    <div className = "listview_item_facility_name">{item.actual_name}</div>
                    <div>Distance: {item.current_distance} km</div>
                </li>
                ))}
          </ul>
        
        );
    }
    return null;
    
}

export default NearbyList;
