import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = (process.env.JWT_SECRET || 'transitops-super-secret-key-2026') as string;

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        res.status(401).json({ error: 'Unauthorized: Invalid token format' });
        return;
      }

      const token = parts[1] as string;

      jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
          res.status(403).json({ error: 'Forbidden: Invalid token' });
          return;
        }

        req.user = user;
        next();
      });
    } else {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: No user found in request' });
      return;
    }

    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ error: `Forbidden: Requires one of roles: ${roles.join(', ')}` });
      return;
    }
  };
};
