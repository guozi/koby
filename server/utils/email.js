const { Resend } = require('resend');

let resend;
function getClient() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

async function sendVerificationEmail(email, name, token) {
  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;
  const from = process.env.RESEND_FROM || 'Koby <onboarding@resend.dev>';

  await getClient().emails.send({
    from,
    to: email,
    subject: 'Koby - 验证您的邮箱',
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:sans-serif;">
        <h2>您好，${name}</h2>
        <p>感谢注册 Koby！请点击下方按钮验证您的邮箱：</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#3B82F6;color:#fff;border-radius:6px;text-decoration:none;margin:16px 0;">验证邮箱</a>
        <p style="color:#666;font-size:14px;">如果按钮无法点击，请复制以下链接到浏览器：</p>
        <p style="color:#666;font-size:12px;word-break:break-all;">${verifyUrl}</p>
        <p style="color:#999;font-size:12px;">此链接 24 小时内有效。</p>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail };
