import { useState, useEffect } from "react";
import CadastralMap from "../components/CadastralMap";

const PlanningPermits = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [permits, setPermits] = useState([]);
    const [permitsLoading, setPermitsLoading] = useState(false);
    // const [buildingData, setBuildingData] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState([]);
    
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchAddresses = async () => {
            if (searchQuery.length < 3) {
                setAddresses([]);
                return;  
            }

            setLoading(true);

            try {
                const response = await fetch(`${BACKEND_URL}addresses/${encodeURIComponent(searchQuery)}/`);
                const data = await response.json();
                setAddresses(data.features || []);
            } catch (error) {
                console.error("Error fetching addresses:", error);
                setAddresses([]);
            }
            setLoading(false);
        };

        const delayDebounceFn = setTimeout(() => {
            fetchAddresses();
        }, 500);

        return () => clearTimeout(delayDebounceFn);

    }, [searchQuery]);

    // Function to clear search
    const handleClearSearch = () => {
        setSearchQuery("");
        setAddresses([]);
        setSelectedAddress(null);
        setPermits([]);
    };

    // Function to fetch permits
    const fetchPermits = async (address) => {
        setSelectedAddress({
            lat: address.geometry.coordinates[1],
            lon: address.geometry.coordinates[0],
            address: address.properties.label,
            houseNumber: address.properties.housenumber,
        });

        setPermits([]);
        setPermitsLoading(true); 
        setSelectedBuilding(null);
    
        try {
            const houseNumber = address.properties.housenumber;
            const fullAddress = address.properties.name;
            const lat = address.geometry.coordinates[1];
            const lon = address.geometry.coordinates[0];
    
            const apiUrl = `${BACKEND_URL}permits/${encodeURIComponent(houseNumber)}/${encodeURIComponent(fullAddress)}/${lat}/${lon}`;
            const response = await fetch(apiUrl);
            const data = await response.json();
            console.log(data);
            
    
            if (data.permits && Array.isArray(data.permits.records)) {
                setPermits(data.permits.records);
            }

            setSelectedBuilding(data.parcel_data);
    
            // fetch("../../public/cadastre-75-parcelles.json")
            // .then((response) => response.json())
            // .then((geojson) => {

            //     const foundParcel = geojson.features.find((parcel) => {
            //         return parcel.properties.id === data.parcel_id;
            //     });

            //     if (foundParcel) {
            //         // setSelectedBuilding(foundParcel.geometry.coordinates[0]);
            //         setSelectedBuilding(foundParcel);
            //     } else {
            //         console.warn("No valid parcel found.");
            //         setSelectedBuilding(null);
            // }})
            // .catch((error) => {
            //     console.error("Error fetching parcel data:", error);
            //     setSelectedBuilding(null);
            // })

            // // 🔹 Update logic to handle buildings instead of parcels
            // if (data.building_geometry && data.building_geometry.coordinates) {
            //     // const buildingPolygon = data.building_geometry.coordinates[0].map(coord => [coord[1], coord[0]]); // Convert [lon, lat] → [lat, lon]
    
            //     // setBuildingData(buildingPolygon); // 🔹 Send formatted polygon coordinates
            //     setSelectedBuilding(data.building_geometry); // 🔹 Store full building data
            // } else {
            //     console.warn("No valid building footprint found.");
            //     setSelectedBuilding(null);
            // }
    
        } catch (error) {
            console.error("Error fetching permits:", error);
            setPermits([]);
        } finally {
            setPermitsLoading(false);
        }
    };
    
    return (
        <div className="container my-4">
            <h1 className="mb-4">Planning Permits</h1>

            <label htmlFor="searchInput" className="form-label">Search for an Address:</label>

            <div className="d-flex align-items-center">
                <input
                    id="searchInput"
                    type="text"
                    className="form-control"
                    placeholder="Type an address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button
                        className="btn btn-danger ms-2"
                        style={{ width: "120px" }} // Increased button width
                        onClick={handleClearSearch}
                    >
                        Clear
                    </button>
                )}
            </div>

            {loading && <div className="text-center mt-3">Loading addresses...</div>}

            {!loading && addresses.length > 0 && (
                <ul className="list-group mt-3">
                    {addresses.map((address, index) => (
                        <li key={index} className="list-group-item list-group-item-action" onClick={() => fetchPermits(address)}>
                            {address.properties.label}
                        </li>
                    ))}
                </ul>
            )}

            {selectedAddress && (
                <div className="mt-4">
                    <h3>Planning Permits for: {selectedAddress.name}</h3>

                    {/* Loader for Permits */}
                    {permitsLoading && (
                        <div className="d-flex justify-content-center mt-3">
                            <div className="spinner-border text-success" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    )}

                    {/* Embed the cadastral map above the table */}
                    {selectedAddress && (
                        <div className="my-4">
                            <CadastralMap
                                lat={selectedAddress.lat}
                                lon={selectedAddress.lon}
                                address={selectedAddress.address}
                                parcelPolygon={selectedBuilding}
                            />
                        </div>
                    )}

                    {/* Display Permits in Table */}
                    {!permitsLoading && permits.length > 0 ? (
                        <div className="table-responsive my-3">
                            <table className="table table-striped table-bordered">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Filing Date</th>
                                        <th>File No</th>
                                        <th>Address</th>
                                        <th>File Type</th>
                                        <th>Description</th>
                                        <th>Decision</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {permits.map((permit, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{permit.fields?.date_depot || "N/A"}</td>
                                            <td>{permit.fields?.numero_dossier || "N/A"}</td>
                                            <td>
                                                {permit.fields?.numero_voirie_du_terrain} {permit.fields?.adresse_du_terrain} {permit.fields?.arrondissement}
                                            </td>
                                            <td>{permit.fields?.type_dossier || "N/A"}</td>
                                            <td>{permit.fields?.description_travaux || "N/A"}</td>
                                            <td>{permit.fields?.decision_autorite || "N/A"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No permits found for this address.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default PlanningPermits;
