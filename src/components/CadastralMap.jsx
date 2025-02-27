import { MapContainer, TileLayer, Marker, Popup, WMSTileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker issue in React
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

const CadastralMap = ({ lat, lon, address, parcelData, selectedParcel }) => {
    return (
        <MapContainer center={[lat, lon]} zoom={100} style={{ height: "400px", width: "100%" }}>
            {/* OpenStreetMap Tiles */}
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            {parcelData && <GeoJSON data={parcelData} style={{ color: "gray", weight: 1 }} />}
            {/* Highlight Selected Parcel */}
            {selectedParcel && <GeoJSON data={selectedParcel} style={{ color: "blue", weight: 2 }} />}
            {/* Marker at the selected location */}
            <Marker position={[lat, lon]}>
                <Popup>{address}</Popup>
            </Marker>
        </MapContainer>
    );
};

export default CadastralMap;
