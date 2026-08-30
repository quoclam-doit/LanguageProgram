import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  nativeLang: z.string().optional(),
  targetLangs: z.array(z.string()).optional(),
  timezone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

// Helper calculation for Level = floor(sqrt(XP / 100))
const calculateLevel = (xp: number): number => {
  return Math.floor(Math.sqrt(xp / 100));
};

const generateTokens = (user: { id: string; email: string; role: string }) => {
  const accessSecret = process.env.JWT_ACCESS_SECRET || 'default_access_secret';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';

  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    accessSecret,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    refreshSecret,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validatedData.email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ success: false, error: 'Email này đã được sử dụng' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    const newUser = await User.create({
      email: validatedData.email.toLowerCase(),
      passwordHash,
      name: validatedData.name,
      nativeLang: validatedData.nativeLang || 'vi',
      targetLangs: validatedData.targetLangs || ['en'],
      timezone: validatedData.timezone || 'Asia/Ho_Chi_Minh',
      xp: 0,
      streak: { current: 0, lastLearnedDate: null },
      role: 'learner',
    });

    const { accessToken, refreshToken } = generateTokens({
      id: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          name: newUser.name,
          nativeLang: newUser.nativeLang,
          targetLangs: newUser.targetLangs,
          timezone: newUser.timezone,
          xp: newUser.xp,
          level: calculateLevel(newUser.xp),
          streak: newUser.streak,
          role: newUser.role,
          createdAt: newUser.createdAt.toISOString(),
        },
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors[0].message });
      return;
    }
    res.status(500).json({ success: false, error: error.message || 'Lỗi đăng ký tài khoản' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validatedData.email.toLowerCase() });
    if (!user) {
      res.status(400).json({ success: false, error: 'Email hoặc mật khẩu không chính xác' });
      return;
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, error: 'Email hoặc mật khẩu không chính xác' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          nativeLang: user.nativeLang,
          targetLangs: user.targetLangs,
          timezone: user.timezone,
          xp: user.xp,
          level: calculateLevel(user.xp),
          streak: user.streak,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
        },
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors[0].message });
      return;
    }
    res.status(500).json({ success: false, error: error.message || 'Lỗi đăng nhập' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
  res.json({ success: true, message: 'Đăng xuất thành công' });
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Chưa đăng nhập' });
      return;
    }

    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, error: 'Không tìm thấy thông tin người dùng' });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          nativeLang: user.nativeLang,
          targetLangs: user.targetLangs,
          timezone: user.timezone,
          xp: user.xp,
          level: calculateLevel(user.xp),
          streak: user.streak,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Lỗi lấy thông tin cá nhân' });
  }
};
