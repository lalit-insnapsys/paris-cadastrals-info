import { useState, useEffect } from "react";
import CadastralMap from "../components/CadastralMap";

const PlanningPermits = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [permits, setPermits] = useState([]);
    const [permitsLoading, setPermitsLoading] = useState(false);
    const [parcelData, setParcelData] = useState([]);
    const [selectedParcel, setSelectedParcel] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState({
        lat: 48.8531775, // Replace with real latitude
        lon: 2.3393336, // Replace with real longitude
        address: "1 cour de Rohan, Paris",
        boundingbox: ["48.8531275", "48.8532275", "2.3392836", "2.3393836"],
    });

    useEffect(() => {
        // Step 2: Load cadastral data (GeoJSON file)
        fetch("/cadastre-75-parcelles.json")
            .then((res) => res.json())
            .then((geojson) => {
                setParcelData(geojson);

                // Step 3: Find the parcel that contains the address
                const foundParcel = geojson.features.find((feature) =>
                    feature.geometry.coordinates.some((polygon) =>
                        polygon.some(([lon, lat]) => Math.abs(lat - selectedLocation.lat) < 0.0005 && Math.abs(lon - selectedLocation.lon) < 0.0005)
                    )
                );

                if (foundParcel) setSelectedParcel(foundParcel);
            })
            .catch((err) => console.error("Error loading parcels:", err));

        const fetchAddresses = async () => {
            if (searchQuery.length < 3) {
                setAddresses([]);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(searchQuery)}&limit=10`);
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
        }, 500); // Debounce API calls (waits 500ms after user stops typing)

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
        setSelectedAddress(address);
        setPermits([]);
        setPermitsLoading(true);

        try {
            // Example API (replace with actual planning permits API)
            const response = await fetch(
                `https://opendata.paris.fr/api/records/1.0/search/?dataset=autorisations-durbanisme-h&rows=1000&q=${encodeURIComponent(
                    address.properties.name
                )}&refine.numero_voirie_du_terrain=${encodeURIComponent(address.properties.housenumber)}`
            );

            const data = await response.json();
            setPermits(data.records || []);
        } catch (error) {
            console.error("Error fetching permits:", error);
        }
        setPermitsLoading(false);
    };

    return (
        <div className="container my-4">
            <h1 className="mb-4">Planning Permits</h1>

            {/* Label Above Search Bar */}
            <label htmlFor="searchInput" className="form-label">
                Search for an Address:
            </label>

            {/* Search Input with Clear Button */}
            <div className="d-flex align-items-center">
                <input
                    id="searchInput"
                    type="text"
                    className="form-control"
                    style={{ fontWeight: "bold" }} // Bold input text
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

            {/* Loading Spinner */}
            {loading && (
                <div className="d-flex justify-content-center mt-3">
                    <div className="spinner-border text-primary" role="output">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* Address Results */}
            {!loading && addresses.length > 0 && (
                <ul className="list-group mt-3">
                    {addresses.map((address, index) => (
                        <li key={index} className="list-group-item list-group-item-action" style={{ cursor: "pointer" }} onClick={() => fetchPermits(address)}>
                            {address.properties.label}
                        </li>
                    ))}
                </ul>
            )}

            {/* No Results Message */}
            {!loading && searchQuery.length >= 3 && addresses.length === 0 && <p className="mt-3">No addresses found.</p>}

            {/* Selected Address & Map */}
            {selectedAddress && (
                <div className="mt-4">
                    <h3>Planning Permits for: {selectedAddress.properties.label}</h3>

                    {/* Loader for Permits */}
                    {permitsLoading && (
                        <div className="d-flex justify-content-center mt-3">
                            <div className="spinner-border text-success" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    )}

                    {/* Embed the cadastral map above the table */}
                    {selectedLocation && (
                        <div className="my-4">
                            <CadastralMap
                                lat={selectedLocation.lat}
                                lon={selectedLocation.lon}
                                address={selectedLocation.address}
                                parcelData={parcelData}
                                selectedParcel={selectedParcel}
                            />
                        </div>
                    )}

                    {/* Display Permits in Table */}
                    {!permitsLoading && permits.length > 0 && (
                        <div className="table-responsive my-3">
                            <table className="table table-striped table-bordered">
                                <thead className="thead-dark">
                                    <tr>
                                        <th>#</th>
                                        <th>Filing Date</th>
                                        <th>File No</th>
                                        <th>Address</th>
                                        <th>File Type</th>
                                        <th>Description of work</th>
                                        <th>Decision</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {permits.map((permit, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{permit.fields.date_depot || "N/A"}</td>
                                            <td>{permit.fields.numero_dossier || "N/A"}</td>
                                            <td>
                                                {permit.fields.numero_voirie_du_terrain} {permit.fields.adresse_du_terrain} {permit.fields.arrondissement}
                                            </td>
                                            <td>{permit.fields.type_dossier || "N/A"}</td>
                                            <td>{permit.fields.description_travaux || "N/A"}</td>
                                            <td>{permit.fields.decision_autorite || "N/A"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* No Permits Found Message */}
                    {!permitsLoading && permits.length === 0 && <p className="mt-3">No permits found for this address.</p>}
                </div>
            )}
        </div>
    );
};

export default PlanningPermits;
