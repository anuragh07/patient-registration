# Patient Registration From 
A responsive  **Patient Registration System** built using **React**, designed for collecting and storing personal, medical, and insurance data of patients. It includes client-side validation, localStorage form persistence, data synchronization within tabs of same browser and PgLite database integration.
The main page contains two buttons namely "Patient Registration Form" and "Query Exisitng Records". When Clicked on  "Patient Registration Form" button, it opens up the patients registration form and when clicked on "Query Exisitng Records" button, it opens up the UI to enter your Raw SQL statements, and result will be displayed in a tabular format in the same page.

## Features
- Multiple tabs data synchronization
- Data persistance across page reloads
- Real time progress bar indicating form completion
- Sectioned UI: Personal, Medical, and Insurance Information
- Field validation with required fields enforcement
- Data insertion into PgLite database
- Query records using Raw SQL Queries
- Schema is provided in the same page where you execute your SQL Queries
- Responsive and user-friendly interface

## Setup
 ```bash
   git clone https://github.com/anuragh07/patient-registration.git
   cd patient-registration
   npm install
   npm run dev
```
## Usage
- Fill in the form across three sections.
- Progress is saved automatically to localStorage.
- Upon submission, the data is validated and inserted into the PgLite patients table.
- A success alert appears and the form resets.
- You can also query the records by clicking "Query Exisiting Records" button on main page.
- Enter your SQL query and click "Execute" button, your result will be displayed on the page.

## Required Fields
- To submit the form successfully, the following fields are mandatory:
- First Name
- Last Name
- Date of Birth
- Gender
- Phone Number
- Emergency Contact
- Conditions
- Reason for Visit

## Technologies Used
**React.js**
**PgLite (Postgre SQL)**
**HTML 5 and CSS 3**
**JavaScript**

## Challenges faced
- Faced challanges in integrating PgLite Database into a Vite + React Application
- Encountered database errors, which were overcome by debugging the code
- Multiple tab synchronization was a new concept to me, so I had to research it before implementing it in the application
- Faced issues while retrieving data using Raw SQL and displaying it on the UI
- Spent a significant amount of time creating a progress bar
- Managing form input data dynamically, while ensuring smooth user experience

## Limitations
Even though there is multiple tab synchronization enabled (Only for the live data being entered), the data will not be shared across multiple tabs as a local in-memory database or IndexedDB is being used. Meaning each tab will have its own isolated instance of the database.



