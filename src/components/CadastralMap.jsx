import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker issue in React
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

import { useEffect } from "react";

const FitToBounds = ({ parcelPolygon, buildings }) => {
  const map = useMap();

  useEffect(() => {
    if (parcelPolygon || (buildings && buildings.features.length > 0)) {
      const geojsonLayer = L.geoJSON([]);

      if (parcelPolygon) {
        geojsonLayer.addData(parcelPolygon);
      }

      if (buildings && buildings.features.length > 0) {
        geojsonLayer.addData(buildings);
      }

      const bounds = geojsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [parcelPolygon, buildings, map]);

  return null;
};

const CadastralMap = ({ lat, lon, address, parcelPolygon, buildings }) => {
  return (
    <MapContainer
      center={[lat, lon]}
      zoom={18}
      style={{ height: "400px", width: "100%" }}
      zoomControl={false} // Disables zoom control buttons
      dragging={false} // Disables dragging (panning)
      scrollWheelZoom={false} // Disables zooming with scroll
      doubleClickZoom={false} // Disables zooming on double-click
      touchZoom={false} // Disables touch zooming
      keyboard={false} // Disables keyboard controls
    >
      {/* Base Map */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/*  Marker for Selected Address */}
      <Marker position={[lat, lon]}>
        <Popup>{address}</Popup>
      </Marker>

      {/*  Parcel Polygon (Blue) */}
      {parcelPolygon && parcelPolygon.geometry ? (
        <GeoJSON
          data={parcelPolygon}
          style={{ color: "red", weight: 1, fillOpacity: 0 }}
        />
      ) : null}

      {/* Building Footprints (Red) */}
      {buildings && buildings.features?.length > 0 ? (
        <GeoJSON
          data={buildings}
          style={{ color: "red", weight: 1, fillOpacity: 0.3 }}
        />
      ) : null}

      {/* Auto-focus on Parcel & Buildings */}
      {(parcelPolygon && parcelPolygon.geometry) ||
      (buildings && buildings.features?.length > 0) ? (
        <FitToBounds parcelPolygon={parcelPolygon} buildings={buildings} />
      ) : null}
    </MapContainer>
  );
};

export default CadastralMap;
