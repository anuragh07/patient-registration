import { useState, useEffect } from "react";
import db from "../db/database"; // Assuming this is your client-side database
import '../App.css';
import '../components/SqlQueryExecutor'; // This import might be for another component, kept as is

export default function PatientForm() {
    const initialFormData = {
        FirstName: "",
        LastName: "",
        dob: "",
        ageMonths: 0,
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
    const [isFormActive, setIsFormActive] = useState(true); // This state seems unused, but keeping it as is

    const calculateAge = (dobValue) => {
        if (!dobValue) return 0;
        const dobDate = new Date(dobValue);
        const today = new Date();

        let months = (today.getFullYear() - dobDate.getFullYear()) * 12;
        months += today.getMonth() - dobDate.getMonth();

        if (today.getDate() < dobDate.getDate()) {
            months--;
        }
        return Math.max(months, 0);
    };

    const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem("patientFormData");
        if (saved) {
            const parsed = JSON.parse(saved);

            if ('age' in parsed) {
                parsed.ageMonths = calculateAge(parsed.dob);
                delete parsed.age;
                delete parsed.displayAge;
            }
            return parsed;
        }
        return initialFormData;
    });

    useEffect(() => {
        localStorage.setItem("patientFormData", JSON.stringify(formData));
    }, [formData]);

    useEffect(() => {
        function handleFormDataChange(event) {
            if (event.key === "patientFormData" && event.newValue) {
                setFormData(JSON.parse(event.newValue));
            }
        }
        function handleSuccessPopup(event) {
            if (event.key === "patientRegistered" && event.newValue) {
                setShowSuccess(true);
                localStorage.removeItem("patientRegistered");
            }
        }

        window.addEventListener("storage", handleFormDataChange);
        window.addEventListener("storage", handleSuccessPopup);

        return () => {
            window.removeEventListener("storage", handleFormDataChange);
            window.removeEventListener("storage", handleSuccessPopup);
        };
    }, [])

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const savedData = localStorage.getItem("patientFormData");
                if (savedData) setFormData(JSON.parse(savedData));
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // New useEffect for BroadcastChannel
    useEffect(() => {
        const channel = new BroadcastChannel('patient-db-updates');

        channel.onmessage = (event) => {
            if (event.data && event.data.type === 'patient-registered') {
                console.log('Database updated in another tab. Consider re-fetching patient data.');
                // TODO: Re-fetch patient list or relevant data here
                // Example: If you have a function to load all patients from the DB, call it here.
                // e.g., loadAllPatients();
            }
        };

        // Clean up the channel when the component unmounts
        return () => {
            channel.close();
        };
    }, []); // Empty dependency array means this runs once on mount and cleans up on unmount


    const [showSuccess, setShowSuccess] = useState(false);
    const [activeSection, setActiveSection] = useState("personal");
    const [fadeKey, setFadeKey] = useState(0);
    const requiredFields = ["FirstName", "LastName", "dob", "gender", "contact", "emergencyContact", "conditions", "reason"];

    const calculateProgress = () => {
        const filledCount = requiredFields.reduce((count, field) => {
            if (field === "contact" || field === "emergencyContact") {
                return formData[field]?.toString().trim().length === 10 ? count + 1 : count;
            }
            return formData[field]?.toString().trim() ? count + 1 : count;
        }, 0);
        return Math.round((filledCount / requiredFields.length) * 100);
    };

    const progress = calculateProgress();

    const formatAgeDisplay = (months) => {
        if (months >= 12) {
            const years = Math.floor(months / 12);
            const remainingMonths = months % 12;
            return `${years} year${years !== 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}` : ''
                }`;
        }
        return `${months} month${months !== 1 ? 's' : ''}`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "dob") {
            const ageMonths = calculateAge(value);
            setFormData(prev => ({
                ...prev,
                dob: value,
                ageMonths
            }));
        } else if (name === "contact" || name === "emergencyContact") {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const missing = requiredFields.filter(field => {
            const value = formData[field];
            if (field === "contact" || field === "emergencyContact") {
                return !value || value.toString().trim().length !== 10;
            }
            return !value || value.toString().trim() === "";
        });

        if (missing.length) return alert(`Invalid or missing fields: ${missing.join(", ")}`);

        // Create a BroadcastChannel instance
        const channel = new BroadcastChannel('patient-db-updates');

        try {
            await db.exec(`
                INSERT INTO patients (
                  firstname, lastname, contact, dob, age_months,
                  bloodgroup, gender, address, emergencycontact,
                  conditions, surgeries, reason, insuranceprovider,
                  policynumber, dateOfVisit
                ) VALUES (
                  '${formData.FirstName}', '${formData.LastName}',
                  '${formData.contact}', '${formData.dob}',
                  ${formData.ageMonths}, '${formData.bloodGroup}',
                  '${formData.gender}', '${formData.address}',
                  '${formData.emergencyContact}', '${formData.conditions}',
                  '${formData.surgeries}', '${formData.reason}',
                  '${formData.insuranceProvider}', '${formData.policyNumber}',
                  '${formData.dateOfVisit}'
                );
              `);

            setShowSuccess(true);
            setFormData(initialFormData);
            setActiveSection("personal");
            setFadeKey(prev => prev + 1);
            localStorage.setItem('patientRegistered', Date.now()); // For success popup specific to the tab

            // Notify other tabs that the database has been updated
            channel.postMessage({ type: 'patient-registered' });

        } catch (error) {
            alert("Failed to register patient. Please try again.");
            console.error(error);
        } finally {
            channel.close(); // Close the channel after sending the message
        }
    };

    const changeSection = (section) => {
        setActiveSection(section);
        setFadeKey(prev => prev + 1);
    };

    return (
        <div className="form-wrapper fade-on-load">
            <div className="form-container">
                <div className="heading" style={{ backgroundColor: '#007BFF', color: 'white', padding: '10px 20px', borderRadius: '5px' }}>
                    <h2 className="form-title" style={{ textAlign: 'left', margin: 0 }}>Patient Registration</h2>
                </div>
                <p className="text" style={{ textAlign: 'left', maxWidth: '700px', margin: '10px auto' }}>
                    Please complete the form below with your personal, medical, and insurance information.
                </p>
                <p className="text2" style={{ textAlign: 'left', maxWidth: '700px', margin: '10px auto 20px' }}>
                    Fields marked with <span className="required">*</span> are required.
                </p>
                <div style={{ maxWidth: '700px', margin: '0 auto 20px', height: '20px', backgroundColor: '#eee', borderRadius: '10px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)' }}>
                    <div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#007BFF', transition: 'width 0.4s ease-in-out' }} />
                </div>
                <div style={{ maxWidth: '700px', margin: '0 auto 20px', textAlign: 'right', fontWeight: '600', color: '#007BFF' }}>
                    {progress}% completed
                </div>
                <div className="button-group">
                    <button type="button" onClick={() => changeSection("personal")} className={`section-button ${activeSection === "personal" ? "active-section" : ""}`}>
                        Personal Information
                    </button>
                    <button type="button" onClick={() => changeSection("medical")} className={`section-button ${activeSection === "medical" ? "active-section" : ""}`}>
                        Medical Details
                    </button>
                    <button type="button" onClick={() => changeSection("insurance")} className={`section-button ${activeSection === "insurance" ? "active-section" : ""}`}>
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
                                        <input name="FirstName" value={formData.FirstName} onChange={handleChange} required autoComplete="given-name" />
                                    </div>
                                    <div className="form-group">
                                        <label> Last Name <span className="required">*</span></label>
                                        <input name="LastName" value={formData.LastName} onChange={handleChange} required autoComplete="family-name" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date of Birth <span className="required">*</span></label>
                                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Age</label>
                                        <input value={formatAgeDisplay(formData.ageMonths)} readOnly />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Gender <span className="required">*</span></label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} required>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Blood Group</label>
                                        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                                            <option value="">Select Blood Group</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Address</label>
                                        <input name="address" value={formData.address} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Phone Number <span className="required">*</span></label>
                                        <input name="contact" value={formData.contact} onChange={handleChange} required autoComplete="tel" maxLength="10" pattern="\d{10}" title="Please enter exactly 10 digits" />
                                        {formData.contact.length !== 10 && formData.contact.length > 0 && (
                                            <span className="error-message">Must be 10 digits</span>
                                        )}
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Emergency Contact Phone <span className="required">*</span></label>
                                        <input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} required autoComplete="tel" maxLength="10" pattern="\d{10}" title="Please enter exactly 10 digits" />
                                        {formData.emergencyContact.length !== 10 && formData.emergencyContact.length > 0 && (
                                            <span className="error-message">Must be 10 digits</span>
                                        )}
                                    </div>
                                </div>
                                <button type="button" className="submit-button" onClick={() => {
                                    const personalRequired = ["FirstName", "LastName", "dob", "gender", "contact", "emergencyContact"];
                                    const missingPersonal = personalRequired.filter(field => !formData[field]?.toString().trim());
                                    if (missingPersonal.length) {
                                        alert(`Please fill all required personal fields: ${missingPersonal.join(", ")}`);
                                    } else {
                                        changeSection("medical");
                                    }
                                }}>
                                    Next: Medical Background
                                </button>
                            </>
                        )}

                        {activeSection === "medical" && (
                            <>
                                <div className="form-group">
                                    <label>Existing Medical Conditions <span className="required">*</span></label>
                                    <input className="medical-input" name="conditions" value={formData.conditions} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Past Surgeries</label>
                                    <input className="medical-input" name="surgeries" value={formData.surgeries} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Reason for Visit <span className="required">*</span></label>
                                    <input className="medical-input" name="reason" value={formData.reason} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Date of Visit <span className="required">*</span></label>
                                    <input type="date" className="medical-input" name="dateOfVisit" value={formData.dateOfVisit} onChange={handleChange} required />
                                </div>
                                <button type="button" className="submit-button" onClick={() => {
                                    const medicalRequired = ["conditions", "reason", "dateOfVisit"];
                                    const missingMedical = medicalRequired.filter(field => !formData[field]?.toString().trim());
                                    if (missingMedical.length) {
                                        alert(`Please fill all required medical fields: ${missingMedical.join(", ")}`);
                                    } else {
                                        changeSection("insurance");
                                    }
                                }}>
                                    Next: Insurance Info
                                </button>
                            </>
                        )}

                        {activeSection === "insurance" && (
                            <>
                                <div className="form-group">
                                    <label>Insurance Provider</label>
                                    <input name="insuranceProvider" value={formData.insuranceProvider} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Policy Number</label>
                                    <input name="policyNumber" value={formData.policyNumber} onChange={handleChange} />
                                </div>
                                <button type="submit" className="submit-button" disabled={progress !== 100} style={{
                                    opacity: progress === 100 ? 1 : 0.6,
                                    cursor: progress === 100 ? 'pointer' : 'not-allowed'
                                }}>
                                    Submit Registration
                                </button>
                            </>
                        )}
                        {showSuccess && (
                            <div className="success-popup-overlay">
                                <div className="success-popup">
                                    <div className="popup-content">
                                        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                                            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                                        </svg>
                                        <h3>Patient Registered Successfully!</h3>
                                        <button className="close-popup-button" onClick={() => {
                                            setShowSuccess(false)
                                            localStorage.removeItem('patientRegistered');
                                        }}>
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}