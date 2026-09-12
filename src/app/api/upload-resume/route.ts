// app/api/upload-resume/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const VALID_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Honeypot: a hidden field named "website" that only a bot filling every
    // field on the page would populate. Real users never see it. We still
    // return 200 so the bot gets no signal that it was caught.
    const honeypot = formData.get("website")?.toString().trim();
    if (honeypot) {
      console.warn("[RESUME_SPAM_BLOCKED] honeypot field was filled");
      return NextResponse.json({ message: "Email sent!" }, { status: 200 });
    }

    const file = formData.get("file") as File | null;
    const name = formData.get("name")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const mobile = formData.get("mobile")?.toString() || "";

    if (!file || !name || !email || !mobile) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Server-side validation — the client-side checks in the form are UX
    // only; anyone can call this endpoint directly and skip them.
    if (!VALID_RESUME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Please upload a PDF, DOC, or DOCX." },
        { status: 400 }
      );
    }
    if (file.size > MAX_RESUME_BYTES) {
      return NextResponse.json(
        { message: "File size should not exceed 5MB." },
        { status: 400 }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Collect extra job info (if any)
    const jobInfo: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (!["file", "name", "email", "mobile", "website"].includes(key)) {
        jobInfo[key] = value.toString();
      }
    }

    // Create transporter — uses the dedicated careers mailbox (career@ufirm.in),
    // NOT the general site's EMAIL_USERNAME/EMAIL_PASSWORD (crm@ufirm.in). Resume
    // submissions are hiring-specific and must not go through the general
    // contact-form inbox. See src/lib/jobAlerts.ts for the same split.
    const transporter = nodemailer.createTransport({
      host: "smtpout.secureserver.net",
      port: 465,
      secure: true,
      auth: {
        user: process.env.CAREERS_EMAIL_USERNAME,
        pass: process.env.CAREERS_EMAIL_PASSWORD,
      },
    });

    await transporter.verify();

    const emailText = `
      New resume submission:

      Name: ${name}
      Email: ${email}
      Mobile: ${mobile}

      ${Object.keys(jobInfo).length > 0 ? "Job Info:\n" : ""}
      ${Object.entries(jobInfo)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")}
    `;

    await transporter.sendMail({
      from: process.env.CAREERS_EMAIL_USERNAME, // safer than spoofing applicant email
      replyTo: email, // this way you can reply directly to applicant
      to: process.env.CAREERS_RECEIVER_EMAIL,
      subject: "Resume Submission - UFirm Careers",
      text: emailText,
      attachments: [
        {
          filename: file.name,
          content: buffer,
        },
      ],
    });

    return NextResponse.json({ message: "Email sent!" }, { status: 200 });
  } catch (err) {
    console.error("[RESUME_SUBMIT_ERR]", err);
    return NextResponse.json(
      { message: "Failed to send email" },
      { status: 500 }
    );
  }
}
