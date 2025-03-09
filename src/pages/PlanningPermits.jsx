import { useState, useEffect } from "react";
import CadastralMap from "../components/CadastralMap";
import { monthMap } from "../config/constants";

const PlanningPermits = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [permits, setPermits] = useState([]);
  const [permitsLoading, setPermitsLoading] = useState(false);
  const [streetHistory, setStreetHistory] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchAddresses = async () => {
      if (searchQuery.length < 3) {
        setAddresses([]);
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          `${BACKEND_URL}addresses/${encodeURIComponent(searchQuery)}/`
        );
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
    setSelectedParcel(null);
    setSelectedBuilding(null);
    setStreetHistory(null);
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
    setAddresses([]);
    setPermitsLoading(true);
    setSelectedBuilding(null);
    setSelectedParcel(null);
    setStreetHistory(null);

    try {
      const houseNumber = address.properties.housenumber;
      const fullAddress = address.properties.name;
      const lat = address.geometry.coordinates[1];
      const lon = address.geometry.coordinates[0];
      const districtCode = address.properties.postcode;

      const apiUrl = `${BACKEND_URL}permits/${encodeURIComponent(
        houseNumber
      )}/${encodeURIComponent(fullAddress)}/${lat}/${lon}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.permits && Array.isArray(data.permits.records)) {
        setPermits(data.permits.records);
      }

      setSelectedParcel(data.parcel_data);

      try {
        const historyUrl = `${BACKEND_URL}history/${districtCode}/${encodeURIComponent(
          fullAddress
        )}`;
        const historyResponse = await fetch(historyUrl);
        const historyData = await historyResponse.json();

        if (!historyData.error) {
          setStreetHistory(historyData);
        } else {
          setStreetHistory(null);
        }
      } catch (historyError) {
        console.error("Error fetching street history:", historyError);
        setStreetHistory(null);
      }

      if (
        data.building_all_data &&
        Object.keys(data.building_all_data).length > 0
      ) {
        setSelectedBuilding(
          Object.entries(data.building_all_data).reduce(
            (acc, [year, features]) => {
              acc[year] = Array.isArray(features)
                ? features.map((feature) => ({
                    type: "Feature",
                    properties: feature,
                    geometry:
                      feature.geometry && feature.geometry.coordinates
                        ? {
                            type: "Polygon",
                            coordinates: feature.geometry.coordinates.map(
                              (ring) => ring.map(([x, y]) => [y, x]) // Convert [lon, lat] → [lat, lon]
                            ),
                          }
                        : null,
                  }))
                : [];

              return acc;
            },
            {}
          )
        );
      } else {
        console.error(
          "Building data is missing or incorrectly formatted:",
          data.building_all_data
        );
        setSelectedBuilding(null);
      }
    } catch (error) {
      console.error("Error fetching permits:", error);
      setPermits([]);
      setSelectedParcel(null);
      setSelectedBuilding(null);
      setStreetHistory(null);
    } finally {
      setPermitsLoading(false);
    }
  };

  const formattedDate = (day, month, year) => {
    return `${String(day).padStart(2, "0")}/${
      monthMap[month] || "00"
    }/${year.slice(-2)}`;
  };

  return (
    <div className="container my-12">
      <h1 className="mb-4">Planning Permits</h1>

      <label htmlFor="searchInput" className="form-label">
        Search for an Address:
      </label>

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
            style={{ width: "120px" }}
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
            <li
              key={index}
              className="list-group-item list-group-item-action"
              style={{ cursor: "pointer" }}
              onClick={() => fetchPermits(address)}
            >
              {address.properties.label}
            </li>
          ))}
        </ul>
      )}

      {selectedAddress && (
        <div className="mt-4">
          {/* Display Street History Above the Map */}
          {streetHistory && streetHistory.length > 0 && (
            <div className="my-4">
              <h3>Street History</h3>
              <ul className="list-group">
                {streetHistory.map((history, index) => (
                  <li key={index} className="list-group-item">
                    {history.street_name && (
                      <p>
                        <strong>Street Name:</strong> {history.street_name}
                      </p>
                    )}
                    {history.original_reference && (
                      <p>
                        <strong>Original Reference:</strong>{" "}
                        {history.original_reference}
                      </p>
                    )}
                    {history.historical_reference && (
                      <p>
                        <strong>Historical Reference:</strong>{" "}
                        {history.historical_reference}
                      </p>
                    )}
                    {history.opening_reference && (
                      <p>
                        <strong>Opening:</strong> {history.opening_reference}
                      </p>
                    )}
                    {history.sanitation_reference && (
                      <p>
                        <strong>Sanitation:</strong>{" "}
                        {history.sanitation_reference}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {selectedAddress && (
        <div className="mt-4">
          {/* Loader for Permits */}
          {permitsLoading && (
            <div className="d-flex justify-content-center mt-3">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {/* Cadastral map */}
          {selectedAddress && (
            <div className="my-4">
              <h3>Cadastral</h3>
              <CadastralMap
                lat={selectedAddress.lat}
                lon={selectedAddress.lon}
                address={selectedAddress.address}
                parcelPolygon={selectedParcel}
                buildings={null}
              />

              {selectedAddress &&
                selectedBuilding &&
                Object.keys(selectedBuilding || {}).length > 0 && (
                  <div className="my-4">
                    <h3>Building Footprints</h3>

                    <div className="mt-2"
                    >
                      {Object.entries(selectedBuilding).map(
                        ([year, features], index) => (
                          <div key={index}>
                            <div className="width:[250px]">
                              <CadastralMap
                                lat={selectedAddress.lat}
                                lon={selectedAddress.lon}
                                address={selectedAddress.address}
                                parcelPolygon={selectedParcel}
                                buildings={{
                                  type: "FeatureCollection",
                                  features: features.filter(
                                    (feature) => feature.geometry !== null
                                  ),
                                }}
                              />
                            </div>
                            <p className="text-sm font-medium mb-2">
                              {year !== "Year Unknown"
                                ? `${year}`
                                : "Year Unknown"}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Display Permits in Table */}
          {!permitsLoading && permits.length > 0 ? (
            <div className="my-3">
              <h3 className="text-lg font-semibold mb-4">Planning Permits</h3>

              <div className="space-y-6">
                {permits.map((permit, index) => (
                  <div key={index} className="border-t border-gray-400 pt-4">
                    {/* Table Structure */}
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr>
                          <td className="font-bold w-2/5">
                            {permit.fields?.numero_dossier || "N/A"}
                          </td>
                          <td className="text-center px-4 w-2/5">
                            {permit.fields?.type_dossier || "N/A"}
                          </td>
                          <td className="text-right font-bold w-2/5">
                            {permit.fields?.decision_autorite || "N/A"}
                          </td>
                        </tr>
                        <tr>
                          <td className="w-1/3">
                            {permit.fields?.numero_voirie_du_terrain}{" "}
                            {permit.fields?.adresse_du_terrain
                              ?.toLowerCase()
                              .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize each word
                              .replace(/\b(Du|De|Des|Le|La|Les)\b/g, (match) =>
                                match.toLowerCase()
                              )}{" "}
                          </td>
                          <td className="px-4 w-1/3">
                            <span className="font-bold">Request of </span>
                            {permit.fields?.date_depot
                              ? new Date(
                                  permit.fields.date_depot
                                ).toLocaleDateString("fr-FR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                })
                              : "N/A"}
                          </td>
                          <td className="text-right w-1/3">
                            <span className="font-bold">Response of </span>
                            {permit.fields?.jour_decision &&
                            permit.fields?.mois_decision &&
                            permit.fields?.annee_decision
                              ? formattedDate(
                                  permit.fields.jour_decision,
                                  permit.fields.mois_decision,
                                  permit.fields.annee_decision
                                )
                              : "N/A"}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Description Below */}
                    <div className="mt-2 italic text-gray-700">
                      {permit.fields?.description_travaux ||
                        "No description available."}
                    </div>
                    <hr className="mt-4 border-t border-gray-400" />
                  </div>
                ))}
              </div>
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
