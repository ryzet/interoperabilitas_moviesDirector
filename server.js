const express = require('express');
const app = express();
const port = 3100;

//app.use(core)

let movies = [
    { id: 1, title: 'LOTR', director: 'peter jackson', year:1999 },
    { id: 2, title: 'avenger', director: 'peter jackson', year:2018 },
    { id: 3, title: 'spiderman', director: 'peter jackson', year:2025 }
];
// console.log(movies);
app.use(express.json());

app.get('/', (request, response) => {
  response.send('Selamat Datang di Server Express!!!');
});

app.get('/movies/:id', (req, res) => {
    const movie = movies.find(m => m.id === parseInt(req.params.id));
    if (movie) {
        res.json(movie);
    } else {
        res.status(404).send('Movie not found');
    }
});

app.post('/movies/:id', (req, res) => {
    const movie = movies.find(m => m.id === parseInt(req.params.id));
    if (movie) {
        res.json(movie);
    } else {
        res.status(404).send('Movie not found');
    }
});

app.put('/movies/:id', (req, res) => {
    const id = Number(req.params.id);
    const movieIndex = movies.findIndex(m => m.id === id);
    if (movieIndex === -1) {
        return res.status(404).json({  error: `Movie tidak ditemukan` });
    }
    const { title, director, year } = req.body || {};
    const updateMovie = { id, title, director, year };
    movies[movieIndex] = updateMovie;
    res.json(updateMovie);
});

app.delete('/movies/:id', (req, res) => {
    const movie = movies.find(m => m.id === parseInt(req.params.id));
    if (movie) {
        res.json(movie);
    } else {
        res.status(404).send('Movie not found');
    }
});


let directors = [
    { id: 1, name: 'FARIS', age: '24', birthYear:1999 },
    { id: 2, name: 'FARAS', age: '28', birthYear:2018 },
    { id: 3, name: 'FIRIS', age: '25', birthYear:2025 },
];
// console.log(movies);
app.use(express.json());


app.get('/directors/:id', (req, res) => {
    const director = directors.find(m => m.id === parseInt(req.params.id));
    if (director) {
        res.json(director);  
    } else {
        res.status(404).send('Director not found');
    }
});


app.post('/directors', (req, res) => {
    const { name, birthYear } = req.body || {};
    if (!name || !birthYear) {
        return res.status(400).json({ error: 'Name and birthYear are required' });
    }
    const newDirector = { id: directors.length + 1, name, birthYear };
    directors.push(newDirector);
    res.status(201).json(newDirector);
});

app.put('/director/:id', (req, res) => {
    const id = Number(req.params.id);
    const directorIndex = directors.findIndex(m => m.id === id);
    if (directorIndex === -1) {
        return res.status(404).json({  error: `Director tidak ditemukan` });
    }
    const { name, age, birthYear } = req.body || {};
    const updateDirector = { name, age, birthYear };
    directors[directorIndex] = updateDirector;
    res.json(updateDirector);
});

app.delete('/director/:id', (req, res) => {
    const id = Number(req.params.id);
    const directorIndex = directors.findIndex(m => m.id === id);
    if (directorIndex === -1) {
        return res.status(404).json({  error: `Director tidak ditemukan` });
    }
    directors.splice(directorIndex, 1);
    res.status(204).send();
});

app.get('/Directors', (req, res) => {
    res.json(directors);
});

app.listen(port, () => {
  console.log(`Server Running on ${port}`);
});

