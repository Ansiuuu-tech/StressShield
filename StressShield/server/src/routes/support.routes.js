import { Router } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const supportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Too many support requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const supportSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  category: z.enum(['technical', 'account', 'feedback', 'other']),
  message: z.string().min(10).max(5000),
});

router.post('/contact', supportLimiter, async (req, res, next) => {
  try {
    const data = supportSchema.parse(req.body);

    let userId = null;
    if (req.auth?.sub) {
      userId = req.auth.sub;
    }

    const supportMessage = await prisma.supportMessage.create({
      data: {
        userId,
        name: data.name,
        email: data.email,
        category: data.category,
        message: data.message,
        status: 'open',
      },
    });

    // TODO: Add email notification here when email service is configured
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'Support <support@stressshield.app>',
    //   to: 'support@stressshield.app',
    //   subject: `New Support Request: ${data.category}`,
    //   html: `<p><strong>Name:</strong> ${data.name}</p><p><strong>Email:</strong> ${data.email}</p><p><strong>Category:</strong> ${data.category}</p><p><strong>Message:</strong></p><p>${data.message}</p>`,
    // });

    res.status(201).json({
      message: 'Message sent — we\'ll get back to you within 1-2 business days.',
      id: supportMessage.id,
    });
  } catch (error) {
    next(error);
  }
});

export default router;