var bcrypt = require('bcrypt')
var pool = require('../db')
exports.register = async(req, res)=>{
    console.log('user registring')
    const { first_name, last_name, gender, birth_date, email, password } = req.body.inputs;

    // Input validation (you can expand this as needed)
    if (!first_name || !last_name || !gender || !birth_date || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'Email is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (first_name, last_name, gender, birth_date, email, password) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, gender, birth_date, email, hashedPassword]
        );

        if (result[0].affectedRows > 0) {
            res.status(200).json({ message: 'User registered successfully',user_id:result[0].insertId });
        } else {
            res.status(500).json({ error: 'Failed to register user' });
        }
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
exports.login = async(req, res) =>{
    
}