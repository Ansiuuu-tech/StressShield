import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { requireAuth } from '../middlewares/auth.js';
const router = Router();
router.use(requireAuth);
const fallback = (message) =>
  `It makes sense that this feels heavy. From what you shared, a gentle next step could be to pause, name the most pressing thing, and choose one small action within your control. You deserve support - not just endurance. Would it help to make a short plan for the next hour?`;
router.get('/history', async (req, res, next) => {
  try {
    res.json(
      await prisma.chatMessage.findMany({
        where: { userId: req.auth.sub },
        orderBy: { createdAt: 'asc' },
        take: 100,
      })
    );
  } catch (e) {
    next(e);
  }
});
router.post('/chat', async (req, res, next) => {
  try {
    const message = String(req.body.message || '').trim();
    if (!message) return res.status(400).json({ message: 'A message is required.' });
    await prisma.chatMessage.create({
      data: { userId: req.auth.sub, role: 'user', content: message },
    });
    let reply = fallback(message);
    if (process.env.GEMINI_API_KEY) {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction:
          'You are StressShield, a warm wellbeing companion for teachers. Give concise, supportive advice. Never diagnose, present yourself as a clinician, or handle emergencies alone; for immediate danger ask the person to contact local emergency services or a crisis hotline.',
      });
      const result = await model.generateContent(message);
      reply = result.response.text();
    }
    const assistant = await prisma.chatMessage.create({
      data: { userId: req.auth.sub, role: 'assistant', content: reply },
    });
    res.json(assistant);
  } catch (e) {
    next(e);
  }
});
export default router;
