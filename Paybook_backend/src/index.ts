import Express, { Router } from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import passport from 'passport'
import { ruruHTML } from 'ruru/server';
import userSchema from './models/users/userSchema.js';
import './utils/google.strategy.js'
import './utils/passport.js'
import {sessionMiddleware} from './utils/session.js'

const PORT = 3001;

const app = Express();

app.use(Express.json());
// session middlewares
app.use(sessionMiddleware)
app.use(passport.initialize());
app.use(passport.session());

app.all('/graphql',createHandler({
    schema:userSchema
}))

app.get('/', (req, res) => {
  res.type('html');
  res.end(ruruHTML({ endpoint: '/graphql' }));
});

app.get('/login/federated/google', passport.authenticate('google',{scope:['profile']}))

app.get('/oauth2/redirect/google',passport.authenticate('google',{
  failureRedirect:'/login',
  successRedirect:'/loggedin'
}))

app.get('/login',(req,res)=>{
  res.send("<h1>Login</h1>")
})
app.get('/loggedin',(req,res)=>{
  res.send("<h1>HEllo User</h1>")
})

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
