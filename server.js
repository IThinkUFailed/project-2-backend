const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const { getSpotifyToken, searchArtist } = require('./controllers/api.controller');
const cors = require('cors');
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    console.log('Received a request to the root endpoint');
  res.send('Hello World!');
});

app.post('/token', async (req, res) => {
    console.log('Received a request to the /token endpoint');
        const token = await getSpotifyToken();
        console.log(token, '<-- token in /token endpoint')
        res.json({ token });
});

app.get('/search', async (req, res) => {
    console.log('Received a request to the /search endpoint', req.query.name);
    try {
        const result = await searchArtist(req, res);
        res.json(result);
    } catch (error) {
        console.error('Error in /search endpoint:', error);
        res.status(500).json({ error: 'An error occurred while searching for the artist' });
    }
});



app.listen(port, () => 

    console.log(`Server is running on port ${port}`));
