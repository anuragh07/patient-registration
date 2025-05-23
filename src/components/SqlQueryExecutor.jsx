import React, { useState } from 'react';
import db from '../db/database'

const SQLQueryExecutor = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleQuerySubmit = async () => {
        console.log("Executing query:", query); // Debug line
        try {
            setError('');
            setResult(null);

            const queryResult = await db.query(query);
            console.log("Query result:", queryResult); // Debug line

            if (queryResult.length === 0) {
                setResult([{ message: 'Query executed successfully (no return rows).' }]);
            } else {
                setResult(queryResult);
            }
        } catch (err) {
            console.error("Query error:", err); // Debug line
            setError(`SQL Error: ${err.message}`);
        }
    };

    return (
        <div className="full-screen">
            <div className="form-container">
                <div className="heading">
                    <h2 className="form-title">SQL Query Executor</h2>
                </div>

                <div className="form-group">
                    <label>SQL Query <span className="required">*</span></label>
                    <textarea
                        className="form-input medical-input"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter SQL query here..."
                    />
                </div>

                <div className="button-group">
                    <button
                        className="submit-button"
                        onClick={handleQuerySubmit}
                    >
                        Execute Query
                    </button>
                </div>

                {error && (
                    <div className="textInsurance" style={{ color: "red" }}>
                        {error}
                    </div>
                )}

                {result && result.length > 0 && (
                    <div className="results-container">
                        <h3>Results</h3>
                        <table className="results-table">
                            <thead>
                                <tr>
                                    {Object.keys(result[0]).map((key) => (
                                        <th key={key}>{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {result.map((row, index) => (
                                    <tr key={index}>
                                        {Object.values(row).map((value, i) => (
                                            <td key={i}>{value}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </div>
    );

};

export default SQLQueryExecutor;
