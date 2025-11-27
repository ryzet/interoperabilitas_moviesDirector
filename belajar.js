const express = require('express');
const app = express();
const PORT = process.env.PORT || 3300;

app.get('/', (req, res) => {
  res.send('Server berjalan!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
