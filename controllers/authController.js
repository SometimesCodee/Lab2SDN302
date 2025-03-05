const User = require('../model/user');
const jwt = require('jsonwebtoken');

// Register new user
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { email: email },
                { phone: phone }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or phone already exists'
            });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            phone,
            address,
            role: 'user' // Set default role as user
        });

    
        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error in registration',
            error: error.message
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id.toString(), role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('accessToken', token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error in login',
            error: error.message
        });
    }
}; 

exports.loginAdmin =async function (req, res) {
    const {email,password} = req.body
        try {
            const user = await User.findOne({ email });
            console.log('user', user);
            
            if (user) {
                const match = await user.comparePassword(password)
                if (match) {
                    const token = jwt.sign(
                        { userId: user._id.toString(), role: user.role },
                        process.env.JWT_SECRET,
                        { expiresIn: '7d' }
                    );
                    res.cookie('accessToken',token,{
                        expires : new Date(Date.now() + 7*24*60*60*1000 )
                    }) 
                    res.status(200).json({
                        token,
                        message: "Login Successfully"
                    })
                } else {
                    res.status(404).json({
                        error: "Password Wrong"
                    })
                }
            } else {
                res.status(404).json({
                    error: "Email not Found"
                })
            }
            
        } catch (error) {
            res.status(500).json({
                error: error.message
            })
        }
};