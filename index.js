const express = require("express")
const mongoose = require('mongoose')
const cors = require("cors")
const nodemailer = require('nodemailer');
const usermodel = require('./models/Users')
const app = express()
const bodyParser = require('body-parser');
const Job = require("./models/Jobs");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

mongoose.connect(process.env.MONGODB_URI);

app.use(express.json())
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ["https://jobsearch-dm9j.onrender.com"]
  : ["http://localhost:3000/","https://jobsearch-dm9j.onrender.com"];

app.use(cors({
  origin: allowedOrigins,
}));
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    mongoose.connection.db.createCollection('register', (err, result) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Collection "register" created');
        }
    });
});

const secretKey = process.env.SECRET_KEY || '123';

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(403).json({ success: false, message: 'No token provided' });
    }

    // Extract the token from the Authorization header
    const tokenParts = token.split(' ');
    const tokenValue = tokenParts[1];

    jwt.verify(tokenValue, secretKey, (err, decoded) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Failed to authenticate token' });
        }

        req.decoded = decoded;
        next();
    });
};


// app.post('/login', (req, res) => {
//     const { email, password } = req.body;
//     usermodel.findOne({ email: email })
//         .then(user => {
//             if (user) {
//                 if (user.password == password) {
//                     res.json("success")
//                 }
//                 else {
//                     res.json("no user exits")
//                 }
//             }
//             else {
//                 res.json("no user exists")
//             }
//         })
// })



// app.post('/register', (req, res) => {
//     usermodel.create(req.body)
//         .then(user => {

//             const { email, name } = req.body;
//             sendRegistrationEmail(email, name);
//             res.json(user);
//         })
//         .catch(err => res.json(err));
// });

// app.post('/login', (req, res) => {
//     const { email, password ,name , category} = req.body;
//     usermodel.findOne({ email: email })
//     // console.log(usermodel.name)
//         .then(user => {
//             if (user) {
//                 if (user.password === password) {
//                     // console.log(user.name)
//                     // const nam1 = user.name
//                     const cat = user.category
                    
//                     // console.log(cat)
//                     const token = jwt.sign({ id: user._id, email: user.email, }, secretKey, {
//                         expiresIn: 86400
//                     });
//                     res.json({ success: true, token, cat});
//                 } else {
//                     res.json({ success: false, message: 'Incorrect password' });
//                 }
//             } else {
//                 res.json({ success: false, message: 'User not found' });
//             }
//         })
//         .catch(err => res.json({ success: false, error: err }));
// });

// app.post('/login', async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         // Check if the user exists
//         const user = await usermodel.findOne({ email: email });
//         if (!user) {
//             return res.status(404).json({ success: false, message: 'User not found' });
//         }

//         // Compare passwords
//         const matchPassword = await bcrypt.compare(password, user.password);
//         if (!matchPassword) {
//             return res.status(400).json({ success: false, message: 'Invalid credentials' });
//         }

//         // Generate a token
//         const token = jwt.sign({ id: user._id, email: user.email }, secretKey, {
//             expiresIn: 86400, // Token expires in 24 hours
//         });

//         res.json({ success: true, token, user });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, error: 'Something went wrong' });
//     }
// });
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      console.log('Received login request for email:', email);
  
      // Check if the user exists
      const user = await usermodel.findOne({ email: email });
      if (!user) {
        console.log('User not found');
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Compare passwords
      const matchPassword = await bcrypt.compare(password, user.password);
      if (!matchPassword) {
        console.log('Invalid credentials');
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }
  
      console.log('Login successful for user:', user.email);
  
      // Generate a token
      const token = jwt.sign({ id: user._id, email: user.email }, secretKey, {
        expiresIn: 86400, // Token expires in 24 hours
      });
  
      // Include the user category in the response
      res.json({ success: true, token, cat: user.category, user });
    } catch (error) {
      console.error('Error processing login request:', error);
      res.status(500).json({ success: false, error: 'Something went wrong' });
    }
  });
  






// app.post('/register', (req, res) => {
//     usermodel.create(req.body)
//         .then(user => {
//             const { email, name , password } = req.body;

//             sendRegistrationEmail(email, name);
//             res.json({ success: true, message: 'User registered successfully' });
//         })
//         .catch(err => res.json({ success: false, error: err }));
// });

app.post('/register', async (req, res) => {
    const { name, email, password, category } = req.body;

    try {
        
        const existingUser = await usermodel.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await usermodel.create({
            name: name,
            email: email,
            password: hashedPassword,
            category: category,
        });

        const token = jwt.sign({ email: newUser.email, id: newUser._id }, secretKey, {
            expiresIn: 86400, 
        });

        sendRegistrationEmail(email, name);

        res.status(201).json({ success: true, message: 'User registered successfully', token: token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Something went wrong' });
    }
});





app.post('/jobs', async (req, res) => {
    try {
        const {
            title,
            description,
            requirements,
            applicationInstructions,
            companyName,
            location,
            salaryRange,
            employmentType,
            industry,
            companyDescription,
            contactEmail,
            contactPhone,
            applicationDeadline,
        } = req.body;

        const newJob = new Job({
            title,
            description,
            requirements,
            applicationInstructions,
            companyName,
            location,
            salaryRange,
            employmentType,
            industry,
            companyDescription,
            contactEmail,
            contactPhone,
            applicationDeadline,
        });
        
        await newJob.save();
        res.json({ message: 'Job listing created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error submitting job listing' });
    }
});

// server.js
// Get job details by ID
app.get('/jobs/:id', async (req, res) => {
    try {
        const jobId = req.params.id;
        
        // Validate if jobId is a valid ObjectId before querying the database
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ error: 'Invalid job ID' });
        }

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json(job);
    } catch (error) {
        console.error('Error getting job details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update job by ID
app.put('/jobs/:id', async (req, res) => {
    try {
        const jobId = req.params.id;
        
        // Validate if jobId is a valid ObjectId before updating the database
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ error: 'Invalid job ID' });
        }

        const updatedJob = await Job.findByIdAndUpdate(jobId, req.body, { new: true });

        if (!updatedJob) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json(updatedJob);
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.get('/jobs', async (req, res) => {
    try {
        const jobs = await Job.find();
        res.json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching jobs' });
    }
});

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const verificationCode = generateRandomCode();
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 1);

    try {
        
        const user = await usermodel.findOneAndUpdate(
            { email },
            { verificationCode, verificationCodeExpires: expirationTime },
            { new: true }
        );

        if (user) {
            sendEmail(email, 'Password Recovery Code', `Your verification code is: ${verificationCode}`);

            res.json({ success: true, message: 'Verification code sent successfully' });
        } else {
            res.status(404).json({ success: false, error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error generating verification code' });
    }
});

app.post('/verify-code', async (req, res) => {
    const { email, code } = req.body;

    try {
        const user = await usermodel.findOne({ email, verificationCode: code, verificationCodeExpires: { $gt: new Date() } });

        if (user) {
            res.json({ success: true, message: 'Code verified successfully' });
        } else {
            res.json({ success: false, error: 'Incorrect code or code expired' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error verifying code' });
    }
});

app.post('/update-password', async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const updatedUser = await usermodel.findOneAndUpdate(
            { email },
            { password: newPassword, verificationCode: null, verificationCodeExpires: null },
            { new: true }
        );

        if (updatedUser) {
            res.json({ success: true, message: 'Password updated successfully' });
        } else {
            res.json({ success: false, error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error updating password' });
    }
});

function sendEmail(to, subject, text) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'sanchitverma030303@gmail.com',
            pass: 'dytx hmhe nxzh qelx', 
        },
    });

    var mailOptions = {
        from: 'sanchitverma030303@gmail.com',
        to,
        subject,
        text,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

function generateRandomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendRegistrationEmail(email, name) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'sanchitverma030303@gmail.com',
            pass: 'dytx hmhe nxzh qelx'
        }
    });

    var mailOptions = {
        from: 'sanchitverma030303@gmail.com',
        to: email,
        subject: 'Welcome to ourSite',
        text: `Dear ${name},\n\nThank you for registering on OurSite.`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

app.get('/me', verifyToken, (req, res) => {
    const userEmail = req.decoded.email;
    usermodel.findOne({ email: userEmail })
        .select('name email')
        .exec((err, user) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error fetching user details' });
            }

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            res.json({ success: true, user });
        });
});




app.listen(3001, () => {
    console.log("server is running")
})
