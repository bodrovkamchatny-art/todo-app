const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'myapp',
  password: 'Adminfel90739', 
  port: 5432,
});


app.get('/todos', async (req, res) => {
  try {
    const { done, limit = 10, sort = 'created_at' } = req.query;

    let query = 'SELECT * FROM todos';
    const params = [];

    // WHERE — фільтр по done
    if (done !== undefined) {
      params.push(done === 'true');
      query += ` WHERE done = $${params.length}`;
    }

    
    query += ` ORDER BY ${sort} DESC`;

    
    params.push(limit);
    query += ` LIMIT $${params.length}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.post('/todos', async (req, res) => {
  try {
    const { title } = req.body;
    const result = await pool.query(
      'INSERT INTO todos (title) VALUES ($1) RETURNING *',
      [title]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.patch('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { done } = req.body;
    const result = await pool.query(
      'UPDATE todos SET done = $1 WHERE id = $2 RETURNING *',
      [done, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Не знайдено" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.delete('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    res.json({ message: "Видалено" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(3000, () => {
  console.log('Todo сервер запущено на порту 3000');
});