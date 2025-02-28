import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const DistrictPage = () => {
    const { districtCode } = useParams(); // Get district code from URL
    const [streets, setStreets] = useState([]);
    const [loading, setLoading] = useState(true);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchStreets = async () => {
            try {
                const apiUrl = `${BACKEND_URL}streets/${districtCode}/`;
                const response = await fetch(apiUrl, { method: "GET" });
                const data = await response.json();

                console.log(data, districtCode);
                if (data.records) {
                    setStreets(data.records);
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
        <div className="container mt-4">
            <h2 className="text-center mb-4">Streets in District {districtCode}</h2>
            {loading ? (
                <div className="text-center my-4">
                    <div className="spinner-border text-primary" role="output">
                        <span className="sr-only"></span>
                    </div>
                </div>
            ) : (
                <div className="table-responsive mb-5">
                    <table className="table table-striped table-bordered">
                        <thead className="thead-dark">
                            <tr>
                                <th>#</th>
                                <th>Street Name</th>
                                <th>Type</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {streets.map((street, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{street.fields.typo_min}</td>
                                    <td>{street.fields.typvoie}</td>
                                    <td>{street.fields.statut}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DistrictPage;
