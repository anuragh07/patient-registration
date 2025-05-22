import { useState } from "react";
import db from "../db/database";
import '../App.css';

export default function PatientForm() {
    const [formData, setFormData] = useState({
        FirstName: "", LastName: "", dob: "", age: "", gender: "", bloodGroup: "",
        address: "", contact: "", emergencyContact: "",
        conditions: "", surgeries: "", reason: "",
        insuranceProvider: "", policyNumber: ""
    });

    const [activeSection, setActiveSection] = useState("personal")

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "dob") {
            const age = new Date().getFullYear() - new Date(value).getFullYear() - 1;
            setFormData({ ...formData, [name]: value, age });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const required = ["FirstName", "LastName", "dob", "gender", "contact", "emergencyContact", "conditions", "reason"];
        const missing = required.filter(field => !formData[field]);
        if (missing.length) return alert(`Missing fields: ${missing.join(", ")}`);

        await db.exec(`
            INSERT INTO patients (
                firstname, lastname, dob, age, gender, bloodGroup, address,
                contact, emergencyContact, conditions, surgeries,
                reason, insuranceProvider, policyNumber
            ) VALUES (
                '${formData.FirstName}', '${formData.LastName}', '${formData.dob}', ${formData.age || 'NULL'},
                '${formData.gender}', '${formData.bloodGroup}', '${formData.address}',
                '${formData.contact}', '${formData.emergencyContact}',
                '${formData.conditions}', '${formData.surgeries}', '${formData.reason}',
                '${formData.insuranceProvider}', '${formData.policyNumber}'
            );
        `);

        const res = await db.exec("SELECT * FROM patients");
        console.log(res);

        alert("Patient registered!");

        setFormData({
            FirstName: "", LastName: "", dob: "", age: "", gender: "", bloodGroup: "",
            address: "", contact: "", emergencyContact: "",
            conditions: "", surgeries: "", reason: "",
            insuranceProvider: "", policyNumber: ""
        });
        setActiveSection("personal");
    };

    return (
        <div className="form-wrapper">
            {/* <h2>Patient Registration Form</h2> */}
            <div className="form-container">
                <div className="heading"><h2 className="form-title">Patient Registration</h2></div>

                <p className="text">Please complete the form below with your personal, medical, and insurance information. <br />Fields marked with <span className="required">*</span> are required.</p>
                <br />
                <div className="button-group">
                    <button
                        onClick={() => setActiveSection("personal")}
                        className={activeSection === "personal" ? "active-section" : ""}
                    >
                        Personal Information
                    </button>
                    <button
                        onClick={() => setActiveSection("medical")}
                        className={activeSection === "medical" ? "active-section" : ""}
                    >
                        Medical History
                    </button>
                    <button
                        onClick={() => setActiveSection("insurance")}
                        className={activeSection === "insurance" ? "active-section" : ""}
                    >
                        Health Insurance
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="patient-form">
                    {activeSection === "personal" && (
                        <>
                            <div className="form-row">
                                <div className="form-group">
                                    <label> First Name *</label>
                                    <input name="FirstName" value={formData.FirstName} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label> Last Name *</label>
                                    <input name="LastName" value={formData.LastName} onChange={handleChange} required />
                                </div>

                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date of Birth *</label>
                                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Age</label>
                                    <input name="age" value={formData.age} readOnly />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Gender *</label>
                                    <input name="gender" value={formData.gender} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Blood Group</label>
                                    <input name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Address</label>
                                    <input name="address" id="addressInput" value={formData.address} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone Number *</label>
                                    <input name="contact" value={formData.contact} onChange={handleChange} required />
                                </div>
                            </div>


                            <div className="form-row">

                                <div className="form-group">
                                    <label>Emergency Contact Phone *</label>
                                    <input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} required />
                                </div>
                            </div>
                        </>
                    )}


                    {activeSection === "medical" && (
                        <>
                            <div className="form-group">
                                <label>Existing Medical Conditions *</label>
                                <input className="medical-input" name="conditions" value={formData.conditions} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Past Surgeries</label>
                                <input className="medical-input" name="surgeries" value={formData.surgeries} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Reason for Visit *</label>
                                <input className="medical-input" name="reason" value={formData.reason} onChange={handleChange} required />
                            </div>

                        </>
                    )}

                    {activeSection === "insurance" && (
                        <>

                            <div className="form-group">
                                <label>Insurance Provider Name</label>
                                <input className="insurance-input" name="insuranceProvider" value={formData.insuranceProvider} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Policy Number</label>
                                <input className="insurance-input" name="policyNumber" value={formData.policyNumber} onChange={handleChange} />
                            </div>

                        </>
                    )}

                    <button type="submit" className="submit-button">Submit</button>
                </form>
            </div>
        </div>
    );
}
