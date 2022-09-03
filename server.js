const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Registeruser = require('./model')
const jwt = require('jsonwebtoken');
const middleware = require('./middleware');
const port = 8080;

mongoose.connect("mongodb+srv://prakash:123@cluster0.fquyyjp.mongodb.net/?retryWrites=true&w=majority",{
    useUnifiedTopology :true,
    useNewUrlParser: true,

}).then(()=>{
    console.log('Database connected');
})

app.use(express.json());


app.post('/register',async(req,res)=>{
    try{
        const {username,email,password,confirmpassword} = req.body;
        const exit = await Registeruser.findOne({email});
        if(exit){
            return res.status(400).send('user already exits');
        }
        if(password!==confirmpassword){
            return res.status(400).send('passwords are not matching');
        }
        const newUser = new Registeruser({
            username,
            email,
            password,
            confirmpassword
        })
        await newUser.save();
    }
    catch(err){
          console.log(err);
          res.status(200).send('Registered successfully');
    }
})

app.post('/login',async(req,res)=>{
    try{
        const {email,password} = req.body;
        const exit = await Registeruser.findOne({email});
        if(!exit){
             return res.status(400).send('user not found');
        }
        if(exit.password !==password){
            return res.status(400).send('Invalid credentials');
        }
        let payload ={
            user: {
                id: exit.id
            }
        }
        jwt.sign(payload,'jwtSecret',{expiresIn: 3600000},
        (err,token)=>{
            if(err) throw err;
            return res.json({token})
        }
        )
    }
        catch(err){
            console.log(err);
            return res.status(500).send('server error');
        }
    
})

app.get('/myprofile',middleware,async(req,res)=>{
    try{
        const exit = await Registeruser.findById(req.user.id);
        if(!exit){
            return res.status(400).send('user not found');

        }
        res.json(exit);
    }
    catch(err){
        console.log(err);
        return res.status(500).send('server error');
    }
})

app.listen(port,()=>{
    console.log(`server is running on http://localhost:${port}`);
})
