import Express, { Router} from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import passport from 'passport'
import { ruruHTML } from 'ruru/server';
import userSchema from './models/users/userSchema.js';
import './Auth/google.strategy.js';
import './Auth/passport.js'
import {sessionMiddleware} from './utils/session.js'
import Authroutes from './routes/Auth/routes.auth.js'
import cookieParser from 'cookie-parser'


const PORT = 3001;

const app = Express();

app.use(Express.json());
// session middlewares
app.use(sessionMiddleware)
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser())

app.all('/graphql',createHandler({
    schema:userSchema
}))

app.get('/', (req, res) => {
  res.type('html');
  res.end(ruruHTML({}));
});

app.use('/api/v1/auth',Authroutes)

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
