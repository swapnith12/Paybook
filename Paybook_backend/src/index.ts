import Express, { Router } from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import passport from 'passport'
import { ruruHTML } from 'ruru/server';
import userSchema from './models/users/userSchema.js';
import './Auth/google.strategy.js'
import './utils/passport.js'
import {sessionMiddleware} from './utils/session.js'
import Authroutes from './routes/Auth/routes.auth.js'

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
  res.end(ruruHTML({}));
});

app.use("/auth", Authroutes)

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
