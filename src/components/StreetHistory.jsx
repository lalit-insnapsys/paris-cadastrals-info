import { useEffect, useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const StreetHistory = ({ districtCode, fullAddress }) => {
  const [streetHistory, setStreetHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!districtCode || !fullAddress) return;

    const fetchStreetHistory = async () => {
      setLoading(true);
      try {
        const historyUrl = `${BACKEND_URL}history/${districtCode}/${encodeURIComponent(fullAddress)}`;
        const response = await fetch(historyUrl);
        const data = await response.json();

        setStreetHistory(data.error ? [] : data);
      } catch (error) {
        console.error("Error fetching street history:", error);
        setStreetHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStreetHistory();
  }, [districtCode, fullAddress]);

  if (loading) return <p>Loading street history...</p>;
  if (!streetHistory.length) return null;

  return (
    <div className="my-4">
      <h3>Street History</h3>
      <ul className="list-group">
        {streetHistory.map((history, index) => (
          <li key={index} className="list-group-item">
            {history.street_name && (
              <p><strong>Street Name:</strong> {history.street_name}</p>
            )}
            {history.original_reference && (
              <p><strong>Original Reference:</strong> {history.original_reference}</p>
            )}
            {history.historical_reference && (
              <p><strong>Historical Reference:</strong> {history.historical_reference}</p>
            )}
            {history.opening_reference && (
              <p><strong>Opening:</strong> {history.opening_reference}</p>
            )}
            {history.sanitation_reference && (
              <p><strong>Sanitation:</strong> {history.sanitation_reference}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StreetHistory;
