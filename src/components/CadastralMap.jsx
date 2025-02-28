import { MapContainer, TileLayer, Marker, Popup, WMSTileLayer, GeoJSON, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker issue in React
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
const CadastralMap = ({ lat, lon, address, parcelPolygon }) => {
    return (
        <MapContainer center={[lat, lon]} zoom={18} style={{ height: "400px", width: "100%" }}>
            {/* Base Map */}
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

            {/* Marker for Selected Address */}
            <Marker position={[lat, lon]}>
                <Popup>{address}</Popup>
            </Marker>

            { parcelPolygon && <GeoJSON data={parcelPolygon} style={{color: "blue", weight: 2}} /> }

            {/* Highlight the Parcel Polygon */}
            {/* {parcelPolygon && (
                <Polygon positions={parcelPolygon} pathOptions={{ color: "red", weight: 3, fillOpacity: 0.4 }} />
            )} */}
        </MapContainer>
    );
};

export default CadastralMap;
