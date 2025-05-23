import React, { useState } from 'react';
import db from '../db/database';

const SQLQueryExecutor = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [infoMessage, setInfoMessage] = useState('');

    const handleQuerySubmit = async () => {
        console.log("Executing query:", query);
        try {
            setError('');
            setResult(null);
            setInfoMessage('');

            const queryResult = await db.query(query);
            console.log("Query result:", queryResult);

            if (queryResult.rows && queryResult.rows.length > 0) {
                setResult(queryResult.rows);
            } else if (queryResult.affectedRows >= 0) {
                setInfoMessage(`Query executed successfully. Rows affected: ${queryResult.affectedRows}`);
            } else {
                setInfoMessage('Query executed successfully but returned no data.');
            }
        } catch (err) {
            console.error("Query error:", err);
            setError(`SQL Error: ${err.message}`);
        }
    };

    return (
        <div className="full-screen">
            <div className="form-container">
                <div className="heading">
                    <h2 className="form-title">Query Records Using Raw SQL</h2>
                </div>

                <div className="form-group">
                    <label>Please write your SQL Query Below <span className="required">*</span></label>
                    <textarea
                        className="sql-query-input"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter SQL query here..."
                    />
                </div>

                <div className="button-group">
                    <button className="sql-submit-btn" onClick={handleQuerySubmit}>
                        Execute Query
                    </button>
                </div>

                {error && (
                    <div className="textInsurance" style={{ color: "red" }}>
                        {error}
                    </div>
                )}
                {infoMessage && (
                    <div className="textInsurance" style={{ color: "green" }}>
                        {infoMessage}
                    </div>
                )}

                {Array.isArray(result) && result.length > 0 && (
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
                                            <td key={i}>{String(value)}</td>
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
