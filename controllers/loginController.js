const pool = require("../db");
const bcrypt = require('bcrypt');

exports.login = async(req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const [userRows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (userRows.length === 0) {
            return res.status(404).json({ error: 'Invalid username' });
        }

        const user = userRows[0];

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        res.status(200).json({ message: 'Login successful', user:user });
        
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
