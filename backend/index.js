const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcrypt');

function generateTag() {
  return '#' + Math.random().toString(36).substring(2, 8).toLowerCase();
}

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let db;

async function initDB() {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      avatarUri TEXT,
      bench REAL DEFAULT 0,
      squat REAL DEFAULT 0,
      deadlift REAL DEFAULT 0,
      bodyWeight REAL DEFAULT 0,
      userTag TEXT UNIQUE
    );
  `);
  
  try { await db.exec('ALTER TABLE users ADD COLUMN bench REAL DEFAULT 0'); } catch(e) {}
  try { await db.exec('ALTER TABLE users ADD COLUMN squat REAL DEFAULT 0'); } catch(e) {}
  try { await db.exec('ALTER TABLE users ADD COLUMN deadlift REAL DEFAULT 0'); } catch(e) {}
  try { await db.exec('ALTER TABLE users ADD COLUMN bodyWeight REAL DEFAULT 0'); } catch(e) {}
  try { await db.exec('ALTER TABLE users ADD COLUMN userTag TEXT'); } catch(e) {
    // If it fails, maybe we need to ignore or log. But SQLite doesn't allow UNIQUE here.
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      friendId INTEGER,
      UNIQUE(userId, friendId)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userEmail TEXT NOT NULL,
      text TEXT NOT NULL,
      sender TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Backend database initialized.');
}

app.post('/register', async (req, res) => {
  const { name, email, password, avatarUri } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userTag = generateTag();
    
    const result = await db.run(
      'INSERT INTO users (name, email, password, avatarUri, userTag) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, avatarUri, userTag]
    );
    res.status(201).json({ id: result.lastID, name, email, avatarUri, bench: 0, squat: 0, deadlift: 0, bodyWeight: 0, userTag });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await db.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        let safeUser = { ...user };
        delete safeUser.password;
        
        if (!safeUser.userTag) {
          const newTag = generateTag();
          await db.run('UPDATE users SET userTag = ? WHERE id = ?', [newTag, safeUser.id]);
          safeUser.userTag = newTag;
        }

        res.status(200).json(safeUser);
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/google', async (req, res) => {
  const { email, name, avatarUri } = req.body;
  
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (user) {
      let safeUser = { ...user };
      delete safeUser.password;
      
      if (!safeUser.userTag) {
        const newTag = generateTag();
        await db.run('UPDATE users SET userTag = ? WHERE id = ?', [newTag, safeUser.id]);
        safeUser.userTag = newTag;
      }
      return res.status(200).json(safeUser);
    } else {
      const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
      const userTag = generateTag();
      
      const result = await db.run(
        'INSERT INTO users (name, email, password, avatarUri, userTag) VALUES (?, ?, ?, ?, ?)',
        [name, email, dummyPassword, avatarUri || null, userTag]
      );
      
      return res.status(201).json({ id: result.lastID, name, email, avatarUri: avatarUri || null, bench: 0, squat: 0, deadlift: 0, bodyWeight: 0, userTag });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/user', async (req, res) => {
  const { email, name, avatarUri } = req.body;
  
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  try {
    const result = await db.run(
      'UPDATE users SET name = ?, avatarUri = ? WHERE email = ?',
      [name, avatarUri, email]
    );

    if (result.changes > 0) {
      res.status(200).json({ message: 'Profile updated successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/records', async (req, res) => {
  const { email, bench, squat, deadlift, bodyWeight } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    await db.run(
      'UPDATE users SET bench = ?, squat = ?, deadlift = ?, bodyWeight = ? WHERE email = ?',
      [bench || 0, squat || 0, deadlift || 0, bodyWeight || 0, email]
    );
    res.status(200).json({ message: 'Records updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/friends', async (req, res) => {
  const { email, friendTag } = req.body;
  
  if (!email || !friendTag) {
    return res.status(400).json({ error: 'Email and friendTag are required' });
  }

  try {
    const user = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const friend = await db.get('SELECT id FROM users WHERE userTag = ?', [friendTag]);
    if (!friend) return res.status(404).json({ error: 'Friend tag not found' });

    if (user.id === friend.id) {
      return res.status(400).json({ error: 'You cannot add yourself' });
    }

    await db.run('INSERT INTO friends (userId, friendId) VALUES (?, ?)', [user.id, friend.id]);
    res.status(200).json({ message: 'Friend added successfully' });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      res.status(400).json({ error: 'Already friends' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.get('/friends/:email', async (req, res) => {
  try {
    const user = await db.get('SELECT id FROM users WHERE email = ?', [req.params.email]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const friends = await db.all(`
      SELECT u.id, u.name, u.userTag, u.avatarUri, u.bench, u.squat, u.deadlift, u.bodyWeight 
      FROM users u
      JOIN friends f ON u.id = f.friendId
      WHERE f.userId = ?
    `, [user.id]);

    res.status(200).json(friends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/friends/:email/:friendId', async (req, res) => {
  try {
    const user = await db.get('SELECT id FROM users WHERE email = ?', [req.params.email]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const result = await db.run('DELETE FROM friends WHERE userId = ? AND friendId = ?', [user.id, req.params.friendId]);
    
    if (result.changes > 0) {
      res.status(200).json({ message: 'Friend removed successfully' });
    } else {
      res.status(404).json({ error: 'Friend not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/chat', async (req, res) => {
  const { email, text, sender } = req.body;
  if (!email || !text || !sender) {
    return res.status(400).json({ error: 'Email, text, and sender are required' });
  }
  try {
    const result = await db.run(
      'INSERT INTO chat_history (userEmail, text, sender) VALUES (?, ?, ?)',
      [email, text, sender]
    );
    res.status(201).json({ id: result.lastID, userEmail: email, text, sender });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/chat/:email', async (req, res) => {
  try {
    const messages = await db.all(
      'SELECT id, text, sender, timestamp FROM chat_history WHERE userEmail = ? ORDER BY id ASC',
      [req.params.email]
    );
    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

initDB();

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
