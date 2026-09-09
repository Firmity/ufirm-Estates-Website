import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fullName, phone, email } = body;

        if (!fullName || !email || !phone) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            host: 'smtpout.secureserver.net',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                ciphers: 'SSLv3',
                rejectUnauthorized: false
            }
        });

        await transporter.sendMail({
            from: `"UFIRM Website" <${process.env.EMAIL_USERNAME}>`,
            to: 'support@ufirm.in',
            subject: 'New Demo Request from Footer',
            html: `
                <h2>New Demo Request</h2>
                <p><strong>Full Name:</strong> ${fullName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <hr/>
                <p><em>This request was submitted from the footer contact form.</em></p>
            `,
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Email send error:', error);
        return NextResponse.json({ success: false, message: 'Email failed to send' }, { status: 500 });
    }
}
