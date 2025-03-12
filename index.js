const express = require('express');
const mysql = require('./db'); // Import MySQL connection
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the EduCase India Assignment!');
  });

app.post('/addSchool', (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
  mysql.query(query, [name, address, latitude, longitude], (err, result) => {
    if (err) {
      console.error(' Error inserting data:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'School added successfully', schoolId: result.insertId });
  });
});

app.get('/listSchools', (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLon = parseFloat(req.query.longitude);

  if (!userLat || !userLon) {
    return res.status(400).json({ error: 'Latitude and Longitude are required' });
  }

  const query = `
    SELECT id, name, address, latitude, longitude, 
    ( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) 
    * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) 
    * sin( radians( latitude ) ) ) ) AS distance 
    FROM schools 
    ORDER BY distance ASC
  `;

  mysql.query(query, [userLat, userLon, userLat], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ schools: results });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
