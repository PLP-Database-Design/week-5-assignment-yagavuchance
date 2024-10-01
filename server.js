const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json()); // Handle JSON payloads

// Connection to MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, // Fixed typo here
});

db.connect((err) => {
    if (err) {
        console.error('DB is not connected to MySQL:', err); 
        return;
    }
    console.log('Connected to MySQL database');
});
// Default route for the root URL
app.get('/', (req, res) => {
    res.send('Welcome to the Hospital API!');
});

// Question 1: Retrieve all patients
app.get('/patients', (req, res) => {
    const query = 'SELECT patient_id, first_name, last_name, DATE_FORMAT(date_of_birth, "%Y-%m-%d") AS date_of_birth FROM patients';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('<h1>Error fetching patients</h1>');
        }

        // Start building the HTML response
        let html = '<h1>Patients List</h1>';
        html += '<table border="1"><tr><th>Patient ID</th><th>First Name</th><th>Last Name</th><th>Date of Birth</th></tr>';

        results.forEach(patient => {
            html += `<tr>
                        <td>${patient.patient_id}</td>
                        <td>${patient.first_name}</td>
                        <td>${patient.last_name}</td>
                        <td>${patient.date_of_birth}</td>
                     </tr>`;
        });

        html += '</table>';
        res.send(html); // Send the HTML response
    });
});

// Question 2: Retrieve all providers
app.get('/providers', (req, res) => {
    const query = 'SELECT first_name, last_name, provider_specialty FROM providers'; // Adjust table name if necessary
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching providers' });
        }

         // Start building the HTML response
         let html = '<h1>providers List</h1>';
         html += '<table border="1"><tr><th>First Name</th><th>Last Name</th><th>Provider Specialty</th></tr>';

         results.forEach(providers =>{
            html += `<tr>
              <td>${providers.first_name}</td>
              <td>${providers.last_name}</td>
              <td>${providers.provider_specialty}</td>
                   </tr>`
            
         });
         html+='</table';
         res.send(html); //send html response
    });
});

// Create a GET endpoint that retrieves patients by their first name
app.get('/patients/filter', (req, res) => {
    const firstName = req.query.first_name; // Get the first_name from query string

    if (!firstName) {
        return res.status(400).json({ error: "Please provide a first name to filter." });
    }

    // SQL query when user-provided first name
    const query = `SELECT * FROM patients WHERE first_name LIKE ?`; // Using placeholder for security

    db.query(query, [`%${firstName}%`], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching patients by first name' });
        }

        // Start building the HTML response
        let html = `<h1>Patients with First Name Matching: ${firstName}</h1>`;
        html += '<table border="1"><tr><th>Patient ID</th><th>First Name</th><th>Last Name</th><th>Date of Birth</th></tr>';

        results.forEach(patient => {
            html += `<tr>
                        <td>${patient.patient_id}</td>
                        <td>${patient.first_name}</td>
                        <td>${patient.last_name}</td>
                        <td>${patient.date_of_birth}</td>
                    </tr>`;
        });

        html += '</table>';
        res.send(html);
    });
});

 
// GET endpoint to filter providers by specialty
app.get('/providers/filter', (req, res) => {
    // Get the provider_specialty value from the query string in the URL
    const specialty = req.query.specialty;

    // Check if the specialty was provided
    if (!specialty) {
        return res.status(400).json({ error: "Please provide a specialty to filter." });
    }

    // SQL query to filter providers by their specialty
    const query = `SELECT first_name, last_name, provider_specialty FROM providers WHERE provider_specialty LIKE ?`;

    // Execute the query, dynamically inserting the specialty value
    db.query(query, [`%${specialty}%`], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching providers by specialty' });
        }

        // Build the HTML response (or return JSON if preferred)
        let html = `<h1>Providers with Specialty Matching: ${specialty}</h1>`;
        html += '<table border="1"><tr><th>First Name</th><th>Last Name</th><th>Specialty</th></tr>';

        results.forEach(provider => {
            html += `<tr>
                        <td>${provider.first_name}</td>
                        <td>${provider.last_name}</td>
                        <td>${provider.provider_specialty}</td>
                    </tr>`;
        });

        html += '</table>';
        res.send(html); // Send the response as HTML
    });
});


// Listen to the server
const PORT = 3370
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
