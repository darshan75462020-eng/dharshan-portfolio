import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Resend } from "resend";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// 🔐 Security Headers
app.use(helmet());

// 🔐 Restrict CORS (VERY IMPORTANT)
app.use(
  cors({
    origin: "https://dharshan-portfolio-psi.vercel.app",
    methods: ["POST"],
  })
);

// 🔐 Rate Limiting (Prevents spam)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per IP
  message: { error: "Too many requests. Please try again later." },
});

app.use(limiter);

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Backend is live 🚀");
});

// Contact route
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: process.env.EMAIL,
      subject: `Portfolio Contact from ${name}`,
      reply_to: email,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });

  } catch (error) {
    console.error("Resend error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
