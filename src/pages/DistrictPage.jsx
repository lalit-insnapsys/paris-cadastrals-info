import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const DistrictPage = () => {
    const { districtCode } = useParams(); // Get district code from URL
    console.log("District Code:", districtCode);
    const [streets, setStreets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStreets = async () => {
            try {
                const apiUrl = `https://opendata.paris.fr/api/records/1.0/search/?dataset=denominations-emprises-voies-actuelles&rows=100&refine.arrdt=${districtCode}`;
                const response = await fetch(apiUrl);
                const data = await response.json();

                if (data.records) {
                    console.log(data, districtCode);
                    setStreets(data.records.map((record) => record.fields.nom_voie));
                }
            } catch (error) {
                console.error("Error fetching street data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStreets();
    }, [districtCode]);

    return (
        <div>
            <h2>Streets in District {districtCode}</h2>
            {loading ? (
                <p>Loading streets...</p>
            ) : (
                <ul>
                    {streets.map((street, index) => (
                        <li key={index}>{street}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DistrictPage;
