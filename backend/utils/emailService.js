const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // For development, use ethereal (fake SMTP)
  // For production, replace with real SMTP settings (Gmail, SendGrid, etc.)
  
  if (process.env.NODE_ENV === 'production') {
    // Production email settings
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development - use Gmail or Ethereal
    // For Gmail, enable "Less secure app access" or use App Password
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password',
      },
    });
  }
};

// Send quiz assignment notification
const sendQuizAssignmentEmail = async (studentEmail, studentName, quizTitle, startTime, endTime, durationMinutes) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"CHARUSAT Quiz System" <${process.env.EMAIL_USER || 'noreply@charusat.edu.in'}>`,
      to: studentEmail,
      subject: `New Quiz Assigned: ${quizTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">New Quiz Assignment</h2>
          <p>Hello <strong>${studentName}</strong>,</p>
          <p>You have been assigned a new quiz:</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1F2937;">${quizTitle}</h3>
            <p><strong>Duration:</strong> ${durationMinutes} minutes</p>
            <p><strong>Start Time:</strong> ${new Date(startTime).toLocaleString()}</p>
            <p><strong>End Time:</strong> ${new Date(endTime).toLocaleString()}</p>
          </div>
          <p>Please make sure to attempt the quiz within the given time window.</p>
          <p style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/student/quizzes" 
               style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Quiz
            </a>
          </p>
          <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
            This is an automated email from CHARUSAT Quiz Management System.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Quiz assignment email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending quiz assignment email:', error);
    return { success: false, error: error.message };
  }
};

// Send quiz reminder (1 hour before deadline)
const sendQuizReminderEmail = async (studentEmail, studentName, quizTitle, endTime) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"CHARUSAT Quiz System" <${process.env.EMAIL_USER || 'noreply@charusat.edu.in'}>`,
      to: studentEmail,
      subject: `Reminder: Quiz "${quizTitle}" Deadline Approaching`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #F59E0B;">⏰ Quiz Deadline Reminder</h2>
          <p>Hello <strong>${studentName}</strong>,</p>
          <p>This is a reminder that the deadline for the following quiz is approaching:</p>
          <div style="background-color: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
            <h3 style="margin-top: 0; color: #92400E;">${quizTitle}</h3>
            <p><strong>Deadline:</strong> ${new Date(endTime).toLocaleString()}</p>
          </div>
          <p>If you haven't attempted this quiz yet, please do so before the deadline.</p>
          <p style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/student/quizzes" 
               style="background-color: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Attempt Quiz Now
            </a>
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Quiz reminder email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending quiz reminder email:', error);
    return { success: false, error: error.message };
  }
};

// Send quiz result notification
const sendQuizResultEmail = async (studentEmail, studentName, quizTitle, score, totalMarks, percentage, passed) => {
  try {
    const transporter = createTransporter();
    
    const statusColor = passed ? '#10B981' : '#EF4444';
    const statusText = passed ? 'PASSED ✓' : 'FAILED ✗';
    
    const mailOptions = {
      from: `"CHARUSAT Quiz System" <${process.env.EMAIL_USER || 'noreply@charusat.edu.in'}>`,
      to: studentEmail,
      subject: `Quiz Result: ${quizTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Quiz Result Available</h2>
          <p>Hello <strong>${studentName}</strong>,</p>
          <p>Your quiz has been evaluated. Here are your results:</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1F2937;">${quizTitle}</h3>
            <div style="font-size: 48px; font-weight: bold; color: ${statusColor}; margin: 20px 0;">
              ${percentage.toFixed(1)}%
            </div>
            <p><strong>Score:</strong> ${score} / ${totalMarks}</p>
            <p style="font-size: 20px; font-weight: bold; color: ${statusColor};">
              ${statusText}
            </p>
          </div>
          <p style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/student/results" 
               style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Detailed Results
            </a>
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Quiz result email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending quiz result email:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✓ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('✗ Email configuration error:', error.message);
    return false;
  }
};

module.exports = {
  sendQuizAssignmentEmail,
  sendQuizReminderEmail,
  sendQuizResultEmail,
  testEmailConfig,
};
