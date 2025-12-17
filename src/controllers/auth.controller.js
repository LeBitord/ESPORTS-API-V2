import authService from '../services/auth.service.js';

class AuthController {
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      
      res.status(201).json({
        message: 'User registered successfully',
        ...result
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const result = await authService.login(req.body);
      
      res.json({
        message: 'Login successful',
        ...result
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async me(req, res) {
    res.json({ user: req.user });
  }
}

export default new AuthController();
