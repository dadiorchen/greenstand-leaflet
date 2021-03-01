import React from 'react';
import logo from './logo.svg';
import './App.css';
import 'leaflet';
import 'leaflet/dist/leaflet.css';
import {dataZoom1, dataZoom18} from './data';

console.log("dataZoom1:", dataZoom1);
const server = {
  getPoints: (zoomLevel) => {
    if(zoomLevel === 2){
      return dataZoom1;
    }else if(zoomLevel > 2 && zoomLevel < 6){
      return dataZoom1;
    }else if(zoomLevel >= 6 && zoomLevel < 13 ){
      return dataZoom18;
    }else{
      throw new Error("bad:" + zoomLevel);
    }
  },
}

var markers = [];

function App() {
  React.useEffect(() => {
    setTimeout(() => {
      console.log("L", window.L);
      var mymap = window.L.map('mapid');
      const googleSat = window.L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3']
      });
      googleSat.addTo(mymap);

      const request = () => {
        console.log("request...");
        //remove
        markers.forEach(m => {
          mymap.removeLayer(m);
        });
        markers = [];
        const data = server.getPoints(mymap.getZoom());
        console.log("data:", data);
        data.data.forEach(d => {
          if(d.type === "cluster"){
            console.log("d:", d.centroid.coordinates);
            const marker = window.L.marker(
              d.centroid.coordinates,
              {
                icon: new window.L.DivIcon({
                  className: "greenstand-cluster",
                  html: `
                    <div class="greenstand-cluster-box" data-zoom-target="${data.zoomTargets.filter(t => t.region_id === d.id)[0].centroid.coordinates.toString()}" >
                    <div>${d.count}</div>
                    </div>
                  `,
                }),
              }
            ).on('click', (e) => {
              console.log("event:", e);
              console.log("event.target:", e.target._icon);
              const a = e.target._icon.querySelector(".greenstand-cluster-box").getAttribute("data-zoom-target").split(",").map(e => parseFloat(e));
              console.log("a:", a);
              const latlng = window.L.latLng(...a);
              console.log("latlng:", latlng);
              mymap.flyTo(latlng, mymap.getZoom() + 2);
            }
            ).addTo(mymap)
            markers.push(marker);
          }else if(d.type === "point"){
            const marker = window.L.marker(
              [parseFloat(d.lat), parseFloat(d.lon)],
              {
                icon: new window.L.DivIcon({
                  className: "greenstand-cluster",
                  html: `
                    <div class="greenstand-point-box"  >
                    <div></div>
                    </div>
                  `,
                }),
              }
            ).on('click', (e) => {
              console.log("event:", e);
              console.log("event.target:", e.target._icon);
            }).addTo(mymap)
            markers.push(marker);

          }else{
            throw Error("bad type:", d.type);
          }
        });
      }

      mymap.on("load", () => {
        console.log("load...");
      //  request();
      });

      mymap.on("moveend", () => {
        console.log("moveend ...");
        request();
      });

      //kick off
      mymap.setView([0,0], 2);
    }, 1000);
  });

  return (
    <div id="mapid" style={{width: "100%",height: "100vh",}}></div>
  );
}

export default App;
