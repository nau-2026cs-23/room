import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { UserRepository } from '../repositories/users';
import { JWT_CONFIG, AUTH_ERRORS } from './constants';

const userRepo = new UserRepository();

// 类型定义
interface JwtPayload {
  email: string;
  sub: string;
  iat: number;
  exp: number;
}

// Configure local strategy for username/password authentication
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        // Find the user by email
        const user = await userRepo.findByEmail(email);
        
        // If user not found or password doesn't match
        if (!user) {
          return done(null, false, { message: AUTH_ERRORS.INVALID_CREDENTIALS });
        }
        
        // Verify password
        const isValidPassword = await userRepo.verifyPassword(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: AUTH_ERRORS.INVALID_CREDENTIALS });
        }
        
        // Return the user without the password
        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (error) {
        console.error('Local strategy error:', error);
        return done(error);
      }
    }
  )
);

// Configure JWT strategy for token authentication
const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_CONFIG.SECRET,
  algorithms: ['HS256'],
  ignoreExpiration: false,
};

passport.use(
  new JwtStrategy(
    jwtOptions,
    async (jwtPayload: JwtPayload, done) => {
      try {
        // Find the user by email from JWT payload
        const user = await userRepo.findByEmail(jwtPayload.email);
        
        if (!user) {
          return done(null, false, { message: AUTH_ERRORS.USER_NOT_FOUND });
        }
        
        // Return the user without the password
        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (error) {
        console.error('JWT strategy error:', error);
        return done(error, false);
      }
    }
  )
);

// Serialize and deserialize user for session management
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user as Express.User);
});

export default passport;