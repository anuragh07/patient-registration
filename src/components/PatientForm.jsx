import { useState, useEffect } from "react";
import db from "../db/database";
import '../App.css';
import '../components/SqlQueryExecutor'
export default function PatientForm() {
    const [showSqlExecutor, setShowSqlExecutor] = useState(false);

    const initialFormData = {
        FirstName: "",
        LastName: "",
        dob: "",
        age: "",
        gender: "",
        bloodGroup: "",
        address: "",
        contact: "",
        emergencyContact: "",
        conditions: "",
        surgeries: "",
        reason: "",
        insuranceProvider: "",
        policyNumber: "",
        dateOfVisit: new Date().toISOString().split('T')[0],
    };

    const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem("patientFormData");
        return saved ? JSON.parse(saved) : initialFormData;
    });

    useEffect(() => {
        localStorage.setItem("patientFormData", JSON.stringify(formData));
    }, [formData]);

    useEffect(() => {
        function handleStorageChange(event) {
            if (event.key === "patientFormData") {
                if (event.newValue) {
                    setFormData(JSON.parse(event.newValue));
                }
            }
        }

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const [activeSection, setActiveSection] = useState("personal");
    const [fadeKey, setFadeKey] = useState(0);
    const requiredFields = ["FirstName", "LastName", "dob", "gender", "contact", "emergencyContact", "conditions", "reason"];

    const calculateProgress = () => {
        const filledCount = requiredFields.reduce((count, field) => {
            return formData[field] && formData[field].toString().trim() !== "" ? count + 1 : count;
        }, 0);
        return Math.round((filledCount / requiredFields.length) * 100);
    };

    const progress = calculateProgress();


    const calculateAge = (dobValue) => {
        if (!dobValue) return "";
        const dobDate = new Date(dobValue);
        const today = new Date();
        let age = today.getFullYear() - dobDate.getFullYear();
        const m = today.getMonth() - dobDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
            age--;
        }
        return age >= 0 ? age : "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "dob") {
            const age = calculateAge(value);
            setFormData(prev => ({ ...prev, dob: value, age }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const missing = requiredFields.filter(field => !formData[field] || formData[field].toString().trim() === "");
        if (missing.length) return alert(`Missing fields: ${missing.join(", ")}`);

        try {
            await db.exec(`
        INSERT INTO patients (
          firstname, lastname, dob, age, gender, bloodGroup, address,
          contact, emergencyContact, conditions, surgeries,
          reason, insuranceProvider, policyNumber, dateOfVisit
        ) VALUES (
          '${formData.FirstName}', '${formData.LastName}', '${formData.dob}', ${formData.age || 'NULL'},
          '${formData.gender}', '${formData.bloodGroup}', '${formData.address}',
          '${formData.contact}', '${formData.emergencyContact}',
          '${formData.conditions}', '${formData.surgeries}', '${formData.reason}',
          '${formData.insuranceProvider}', '${formData.policyNumber}', '${formData.dateOfVisit}'
        );
      `);

            const res = await db.exec("SELECT * FROM patients");
            console.log(res);

            alert("Patient registered!");
            setFormData(initialFormData);
            setActiveSection("personal");
            setFadeKey(prev => prev + 1);
        } catch (error) {
            alert("Failed to register patient. Please try again.");
            console.error(error);
        }
    };

    const changeSection = (section) => {
        setActiveSection(section);
        setFadeKey(prev => prev + 1);
    };

    return (
        <div className="form-wrapper fade-on-load">
            <div className="form-container">
                <div
                    className="heading"
                    style={{ backgroundColor: '#007BFF', color: 'white', padding: '10px 20px', borderRadius: '5px' }}
                >
                    <h2 className="form-title" style={{ textAlign: 'left', margin: 0 }}>Patient Registration</h2>
                </div>
                <p className="text" style={{ textAlign: 'left', maxWidth: '700px', margin: '10px auto' }}>
                    Please complete the form below with your personal, medical, and insurance information.
                </p>
                <p className="text2" style={{ textAlign: 'left', maxWidth: '700px', margin: '10px auto 20px' }}>
                    Fields marked with <span className="required">*</span> are required.
                </p>
                <div
                    style={{
                        maxWidth: '700px',
                        margin: '0 auto 20px',
                        height: '20px',
                        backgroundColor: '#eee',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
                    }}
                >
                    <div
                        style={{
                            height: '100%',
                            width: `${progress}%`,
                            backgroundColor: '#007BFF',
                            transition: 'width 0.4s ease-in-out'
                        }}
                    />
                </div>
                <div style={{ maxWidth: '700px', margin: '0 auto 20px', textAlign: 'right', fontWeight: '600', color: '#007BFF' }}>
                    {progress}% completed
                </div>
                <div className="button-group">
                    <button
                        type="button"
                        onClick={() => changeSection("personal")}
                        className={`section-button ${activeSection === "personal" ? "active-section" : ""}`}
                    >
                        Personal Information
                    </button>
                    <button
                        type="button"
                        onClick={() => changeSection("medical")}
                        className={`section-button ${activeSection === "medical" ? "active-section" : ""}`}
                    >
                        Medical Details
                    </button>
                    <button
                        type="button"
                        onClick={() => changeSection("insurance")}
                        className={`section-button ${activeSection === "insurance" ? "active-section" : ""}`}
                    >
                        Health Insurance
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="patient-form">
                    <div key={fadeKey} className="fade-in">
                        {activeSection === "personal" && (
                            <>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label> First Name <span className="required">*</span></label>
                                        <input
                                            name="FirstName"
                                            value={formData.FirstName}
                                            onChange={handleChange}
                                            required
                                            autoComplete="given-name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label> Last Name <span className="required">*</span></label>
                                        <input
                                            name="LastName"
                                            value={formData.LastName}
                                            onChange={handleChange}
                                            required
                                            autoComplete="family-name"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date of Birth <span className="required">*</span></label>
                                        <input
                                            type="date"
                                            name="dob"
                                            value={formData.dob}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Age</label>
                                        <input name="age" value={formData.age} readOnly />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Gender <span className="required">*</span></label>
                                        <input
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Blood Group</label>
                                        <input
                                            name="bloodGroup"
                                            value={formData.bloodGroup}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Address</label>
                                        <input
                                            name="address"
                                            id="addressInput"
                                            value={formData.address}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Phone Number <span className="required">*</span></label>
                                        <input
                                            name="contact"
                                            value={formData.contact}
                                            onChange={handleChange}
                                            required
                                            autoComplete="tel"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Emergency Contact Phone <span className="required">*</span></label>
                                        <input
                                            name="emergencyContact"
                                            value={formData.emergencyContact}
                                            onChange={handleChange}
                                            required
                                            autoComplete="tel"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="submit-button"
                                    onClick={() => {
                                        // Validate personal required fields
                                        const personalRequired = ["FirstName", "LastName", "dob", "gender", "contact", "emergencyContact"];
                                        const missingPersonal = personalRequired.filter(field => !formData[field] || formData[field].toString().trim() === "");
                                        if (missingPersonal.length) {
                                            alert(`Please fill all required personal fields: ${missingPersonal.join(", ")}`);
                                        } else {
                                            changeSection("medical");
                                        }
                                    }}
                                >
                                    Next: Medical Background
                                </button>
                            </>
                        )}

                        {activeSection === "medical" && (
                            <>
                                <div className="form-group">
                                    <label>Existing Medical Conditions <span className="required">*</span></label>
                                    <input
                                        className="medical-input"
                                        name="conditions"
                                        value={formData.conditions}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Past Surgeries</label>
                                    <input
                                        className="medical-input"
                                        name="surgeries"
                                        value={formData.surgeries}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Reason for Visit <span className="required">*</span></label>
                                    <input
                                        className="medical-input"
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date of Visit <span className="required">*</span></label>
                                    <input
                                        type="date"
                                        className="medical-input"
                                        name="dateOfVisit"
                                        value={formData.dateOfVisit}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="submit-button"
                                    onClick={() => {
                                        const medicalRequired = ["conditions", "reason", "dateOfVisit"];
                                        const missingMedical = medicalRequired.filter(field => !formData[field] || formData[field].toString().trim() === "");
                                        if (missingMedical.length) {
                                            alert(`Please fill all required medical fields: ${missingMedical.join(", ")}`);
                                        } else {
                                            changeSection("insurance");
                                        }
                                    }}
                                >
                                    Next: Insurance Info
                                </button>
                            </>
                        )}

                        {activeSection === "insurance" && (
                            <>
                                <div className="form-group">
                                    <label>Insurance Provider</label>
                                    <input
                                        name="insuranceProvider"
                                        value={formData.insuranceProvider}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Policy Number</label>
                                    <input
                                        name="policyNumber"
                                        value={formData.policyNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={progress !== 100}
                                    style={{
                                        opacity: progress === 100 ? 1 : 0.6,
                                        cursor: progress === 100 ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    Submit Registration
                                </button>

                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
