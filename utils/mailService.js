const nodemailer = require('nodemailer');

// Создаем транспорт для отправки писем
const transporter = nodemailer.createTransport({
    host: 'smtp.example.com', // SMTP-сервер
    port: 587,               // Порт
    secure: false,           // true для 465, false для других портов
    auth: {
        user: process.env.SMTP_USER, // Имя пользователя SMTP
        pass: process.env.SMTP_PASS  // Пароль SMTP
    }
});

// Функция для отправки письма
const sendMail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"Your App Name" <${process.env.SMTP_USER}>`, // Отправитель
            to,                                                // Кому
            subject,                                           // Тема письма
            html                                              // Содержимое письма (HTML)
        });
    } catch (error) {
        console.error('Ошибка отправки письма:', error);
    }
};

module.exports = { sendMail };
