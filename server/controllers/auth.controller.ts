// === AUTHENTICATION CONTROLLER ===
// Organized authentication logic

import { Request, Response } from 'express';
import { storage } from '../storage';

export class AuthController {
  static async demoLogin(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      
      // Fixed credentials for demo
      const validCredentials = {
        "admin": "admin123",
        "agent": "agent123", 
        "manager": "manager123",
        "demo": "demo123"
      };

      if (!validCredentials[username as keyof typeof validCredentials] || 
          validCredentials[username as keyof typeof validCredentials] !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Return fixed user data based on username
      let userData = {
        id: 1,
        username: username,
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@azamtv.co.tz",
        role: "admin",
      };

      // Customize user data based on username
      switch (username) {
        case "admin":
          userData = {
            ...userData,
            firstName: "Admin",
            lastName: "User",
            email: "admin@azamtv.co.tz",
            role: "admin"
          };
          break;
        case "agent":
          userData = {
            ...userData,
            id: 2,
            firstName: "Field",
            lastName: "Agent",
            email: "agent@azamtv.co.tz",
            role: "agent"
          };
          break;
        case "manager":
          userData = {
            ...userData,
            id: 3,
            firstName: "Regional",
            lastName: "Manager",
            email: "manager@azamtv.co.tz",
            role: "manager"
          };
          break;
        case "demo":
          userData = {
            ...userData,
            id: 4,
            firstName: "Demo",
            lastName: "User",
            email: "demo@azamtv.co.tz",
            role: "user"
          };
          break;
      }

      res.json(userData);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Try to find user in storage
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Fixed test accounts for demo purposes
      const testAccounts = {
        "admin@azamtv.co.tz": { password: "admin123", role: "admin", name: "Admin User" },
        "agent@azamtv.co.tz": { password: "agent123", role: "agent", name: "Field Agent" },
        "manager@azamtv.co.tz": { password: "manager123", role: "manager", name: "Regional Manager" },
        "kyc@azamtv.co.tz": { password: "kyc123", role: "kyc", name: "KYC Officer" },
        "demo@azamtv.co.tz": { password: "demo123", role: "user", name: "Demo User" }
      };

      const account = testAccounts[email as keyof typeof testAccounts];
      
      if (!account || account.password !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const [firstName, lastName] = account.name.split(' ');
      
      const userData = {
        id: Object.keys(testAccounts).indexOf(email) + 1,
        username: email.split('@')[0],
        firstName,
        lastName,
        email,
        role: account.role,
      };

      res.json(userData);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  }

  static async logout(req: Request, res: Response) {
    res.json({ message: "Logged out successfully" });
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Simulate password reset process
      res.json({ 
        message: "Password reset instructions sent to your email",
        success: true 
      });
    } catch (error) {
      res.status(500).json({ message: "Password reset failed" });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      // Simulate password reset
      res.json({ 
        message: "Password reset successfully",
        success: true 
      });
    } catch (error) {
      res.status(500).json({ message: "Password reset failed" });
    }
  }

  static async getCurrentUser(req: Request, res: Response) {
    try {
      // In a real app, you would get the user ID from session/JWT
      // For demo, we'll try to match against our test users
      const testUsers = await storage.getUsers();
      
      // Return first user as demo current user
      if (testUsers.length > 0) {
        const { createdAt, ...userData } = testUsers[0];
        res.json(userData);
      } else {
        res.status(401).json({ message: "Not authenticated" });
      }
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ message: "Failed to get current user" });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      // In a real app, you would get the user from session/JWT
      // For demo, we'll return enhanced profile data
      const testUsers = await storage.getUsers();
      
      if (testUsers.length > 0) {
        const user = testUsers[0];
        const profileData = {
          ...user,
          phone: "+255 712 345 678",
          department: "Operations",
          location: "Dar es Salaam, Tanzania",
          timezone: "Africa/Dar_es_Salaam",
          language: "en",
          lastLogin: new Date().toISOString(),
          profileImage: null,
          bio: "AZAM TV Agent Management Portal Administrator",
          isActive: true
        };
        res.json(profileData);
      } else {
        res.status(401).json({ message: "Not authenticated" });
      }
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: "Failed to get profile" });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const profileData = req.body;
      
      // In a real app, you would update the user in database
      // For demo, we'll just return success
      res.json({ 
        message: "Profile updated successfully",
        success: true,
        data: profileData 
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  }

  static async getPreferences(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      // For demo, return default preferences
      const preferences = {
        emailNotifications: true,
        smsNotifications: false,
        systemNotifications: true,
        dashboardLayout: "grid",
        theme: "auto",
        language: "en",
        timezone: "Africa/Dar_es_Salaam",
        sessionTimeout: 30
      };
      
      res.json(preferences);
    } catch (error) {
      console.error('Get preferences error:', error);
      res.status(500).json({ message: "Failed to get preferences" });
    }
  }

  static async updatePreferences(req: Request, res: Response) {
    try {
      const preferencesData = req.body;
      
      // In a real app, you would update preferences in database
      // For demo, we'll just return success
      res.json({ 
        message: "Preferences updated successfully",
        success: true,
        data: preferencesData 
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  }

  static async getActivities(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      // For demo, return empty array to let frontend use mock data
      res.json([]);
    } catch (error) {
      console.error('Get activities error:', error);
      res.status(500).json({ message: "Failed to get activities" });
    }
  }
}