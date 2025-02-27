import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Hook for navigation

    useEffect(() => {
        fetch("https://opendata.paris.fr/api/records/1.0/search/?dataset=arrondissements&rows=1000")
            .then((response) => response.json())
            .then((data) => {
                const sortedDistricts = data.records
                    .map((record) => record.fields) // Extract fields first
                    .sort((a, b) => a.c_ar - b.c_ar); // Sort based on district number
                setDistricts(sortedDistricts);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching districts:", error);
                setLoading(false);
            });
    }, []);

    return (
        <div className="container mt-4">
            {/* Heading and Button in the same row */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">Paris Districts</h1>
                <button className="btn btn-primary btn-lg" onClick={() => navigate("/planning-permits")}>
                    Planning Permits
                </button>
            </div>
            {loading ? (
                <div className="text-center my-4">
                    <div className="spinner-border text-primary" role="status">
                        {/* <span className="sr-only">Loading...</span> */}
                    </div>
                </div>
            ) : (
                <div className="table-responsive mb-5">
                    <table className="table table-striped table-bordered">
                        <thead className="thead-dark">
                            <tr>
                                <th>#</th>
                                <th>District</th>
                                <th>Name</th>
                                {/* <th>Area (sq km)</th> */}
                                <th>Perimeter</th>
                            </tr>
                        </thead>
                        <tbody>
                            {districts.map((district, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <Link to={`/district/${district.c_arinsee}`} className="text-decoration-none">
                                            {district.l_ar || "N/A"}
                                        </Link>
                                    </td>
                                    <td>{district.l_aroff || "N/A"}</td>
                                    {/* <td>{district.surface ? `${district.surface} km²` : "N/A"}</td> */}
                                    <td>{district.perimetre ? `${district.perimetre} meters` : "N/A"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Home;
