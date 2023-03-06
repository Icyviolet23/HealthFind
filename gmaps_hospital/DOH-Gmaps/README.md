# DOH Google maps

## Description
This project uses React and Google Maps API to build a custom Google Maps that can visualize hospital, covid labs and dialysis clinic data.

## Features
Custom Location Input (Top) : Used to input your own custom address
Searchbar (Middle) : Used to search hospitals, covid labs and dialysis clinics within dataset within 10km radius
Menu (Top Left) : Opens up menu where you can choose to display hospital, covid lab or dialysis clinic data
Compass (Top Right) : Set current location to browser location
Nearby Search Button (Below Compass) : Opens up list view of nearby hospitals, covid labs or dialysis clinics depending on configuration

## Before Running

Request for the gmaps api key and place the key as the value to field GMAP_API_KEY in src/Config.js

## To Run
```bash
cd path_to_DOH-Gmaps
npm install .  # install node_modules
npm start
```
