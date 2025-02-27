import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("https://opendata.paris.fr/api/records/1.0/search/?dataset=arrondissements&rows=100")
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
            <h1 className="text-center mb-4">Paris Districts</h1>
            {loading ? (
                <p className="text-center">Loading districts...</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-bordered">
                        <thead className="thead-dark">
                            <tr>
                                <th>#</th>
                                <th>District Name</th>
                                <th>District Number</th>
                                <th>Area (sq km)</th>
                                <th>Population</th>
                            </tr>
                        </thead>
                        <tbody>
                            {districts.map((district, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <Link to={`/district/${district.c_ar}`} className="text-decoration-none">
                                            {district.l_ar || "N/A"}
                                        </Link>
                                    </td>
                                    <td>{district.c_ar || "N/A"}</td>
                                    <td>{district.superficie ? `${district.superficie} km²` : "N/A"}</td>
                                    <td>{district.population ? district.population.toLocaleString() : "N/A"}</td>
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
