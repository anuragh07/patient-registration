
import React, { useState, useEffect } from 'react';
import db from '../db/database';
import schemaImage from '../assets/Schema - 2.png';

const SQLQueryExecutor = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [infoMessage, setInfoMessage] = useState('');
    const [showSchema, setShowSchema] = useState(false);

    useEffect(() => {
        const savedQuery = localStorage.getItem('sqlQuery');
        if (savedQuery) {
            setQuery(savedQuery);
        }

        const handleStorageChange = (event) => {
            if (event.key === 'sqlQuery') {
                setQuery(event.newValue || '');
                if (event.newValue) {
                    handleQuerySubmit(event.newValue);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleQuerySubmit = async (rawQuery = null) => {
        const finalQuery = rawQuery || query;
        console.log("Executing query:", finalQuery);

        try {
            setError('');
            setResult(null);
            setInfoMessage('');

            if (!rawQuery) {
                localStorage.setItem('sqlQuery', finalQuery);
                window.dispatchEvent(new Event('storage'));
            }

            const queryResult = await db.query(finalQuery);
            console.log("Query result:", queryResult);

            const enhancedResults = queryResult.rows?.map(row => {
                if (row.age_months !== undefined) {
                    return {
                        ...row,
                        age_years: (row.age_months / 12).toFixed(1)
                    };
                }
                return row;
            }) || [];

            if (enhancedResults.length > 0) {
                setResult(enhancedResults);
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

    const handleQueryChange = (value) => {
        setQuery(value);
        localStorage.setItem('sqlQuery', value);
    };

    return (
        <>
            <div className={`page-wrapper ${showSchema ? 'blur-background' : ''}`}>
                <div className="form-container">
                    <div className="heading">
                        <h2 className="form-title">Query Records Using Raw SQL</h2>
                    </div>
                    <p style={{ marginTop: "10px", color: "black", fontSize: "15px" }}>
                        <span
                            onClick={() => setShowSchema(true)}
                            style={{
                                textDecoration: "underline",
                                color: "blue",
                                cursor: "pointer"
                            }}
                        >
                            Click Here
                        </span>{" "}
                        to view the Schema. <span style={{ color: '#666', fontSize: '12px' }}>(Changes sync across tabs)</span>
                    </p>

                    <div className="form-group">
                        <label>Please write your SQL Query Below <span className="required">*</span></label>
                        <textarea
                            className="sql-query-input"
                            value={query}
                            onChange={(e) => handleQueryChange(e.target.value)}
                            placeholder="Enter SQL query here..."
                        />
                    </div>

                    <div className="button-group">
                        <button className="sql-submit-btn" onClick={() => handleQuerySubmit()}>
                            Execute Query
                        </button>
                    </div>

                    {error && <div className="textInsurance" style={{ color: "red", display: "flex", justifyContent: "center", marginTop: "10px" }}>{error}</div>}
                    {infoMessage && <div className="textInsurance" style={{ color: "green", display: "flex", justifyContent: "center", marginTop: "10px" }}>{infoMessage}</div>}

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

            {showSchema && (
                <div className="schema-popup-overlay">
                    <div className="schema-popup">
                        <span className="close-btn" onClick={() => setShowSchema(false)}>❌</span>
                        <img src={schemaImage} alt="Schema" className="schema-img" />
                    </div>
                </div>
            )}
        </>
    );

};

export default SQLQueryExecutor;