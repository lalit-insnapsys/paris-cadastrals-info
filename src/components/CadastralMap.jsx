import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker issue in React
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

const CadastralMap = ({ lat, lon, address, parcelData }) => {
    return (
        <MapContainer center={[lat, lon]} zoom={18} style={{ height: "400px", width: "100%" }}>
            {/* OpenStreetMap Tiles */}
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {/* <Polygon positions={parcelData.map(coord => [coord[1], coord[0]])} color="red" />   */}
            {/* Marker at the selected location */}
            <Marker position={[lat, lon]}>
                <Popup>{address}</Popup>
            </Marker>
        </MapContainer>
    );
};

export default CadastralMap;
