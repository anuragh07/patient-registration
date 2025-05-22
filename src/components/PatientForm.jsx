import { useState } from "react";
import db from "../db/database";

export default function PatientForm() {
    const [formData, setFormData] = useState({
        name: "", contact: "", dob: "", age: "", bloodGroup: "", gender: "",
        address: "", emergencyContact: "", conditions: "", surgeries: "",
        reason: "", insuranceProvider: "", policyNumber: ""
    });

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
        const required = ["name", "contact", "dob", "gender", "address", "emergencyContact", "conditions", "reason"];
        // const findMissing = (required) => {

        // }
        const missing = required.filter(field => !formData[field]);
        if (missing.length) return alert(`Missing fields: ${missing.join(", ")}`);

        await db.exec(`
            INSERT INTO patients ( name, contact, dob, age, bloodGroup, gender, address, emergencyContact, conditions, surgeries, reason, insuranceProvider, policyNumber
            ) VALUES (
            '${formData.name}','${formData.contact}', '${formData.dob}', ${formData.age || 'NULL'}, '${formData.bloodGroup}',
            '${formData.gender}','${formData.address}', '${formData.emergencyContact}', '${formData.conditions}',
            '${formData.surgeries}', '${formData.reason}', '${formData.insuranceProvider}', '${formData.policyNumber}'
            );
        `);

        const result = await db.exec("SELECT * FROM patients");
        console.log("Patient Table Data:", result);

        alert("Patient registered!");

        setFormData({
            name: "", contact: "", dob: "", age: "", bloodGroup: "", gender: "",
            address: "", emergencyContact: "", conditions: "", surgeries: "",
            reason: "", insuranceProvider: "", policyNumber: ""
        });
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "auto" }}>
            <h2>Patient Registration</h2>
            {[
                { label: "Name*", name: "name" },
                { label: "Contact*", name: "contact" },
                { label: "Date of Birth*", name: "dob", type: "date" },
                { label: "Age", name: "age", disabled: true },
                { label: "Blood Group*", name: "bloodGroup" },
                { label: "Gender*", name: "gender" },
                { label: "Address*", name: "address" },
                { label: "Emergency Contact Number*", name: "emergencyContact" },
                { label: "Existing Medical Conditions*", name: "conditions" },
                { label: "Past Surgeries", name: "surgeries" },
                { label: "Reason for Visit*", name: "reason" },
                { label: "Insurance Provider", name: "insuranceProvider" },
                { label: "Policy Number", name: "policyNumber" },
            ].map(({ label, name, type = "text", disabled = false }) => (
                <div key={name} style={{ marginBottom: "10px" }}>
                    <label>{label}</label><br />
                    <input
                        type={type}
                        name={name}
                        value={formData[name]}
                        disabled={disabled}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>
            ))}
            <button type="submit" style={{ padding: "10px 20px" }}>Submit</button>
        </form>
    );
}
