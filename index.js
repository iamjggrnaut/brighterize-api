const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
    const numCPUs = os.cpus().length;
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {
    require('dotenv').config()
    const express = require('express')
    const sequelize = require('./db')
    const { User } = require('./models/models')
    const multer = require('multer')
    const upload = multer({ dest: './statics/' })
    const bcrypt = require('bcrypt')
    const PORT = process.env.PORT || 5000
    const cors = require('cors')
    const router = require('./routes/index')
    const errorHandling = require('./middleware/ErrorHandlingMiddleware')
    const fs = require('fs')
    const bodyParser = require('body-parser');

    const app = express()

    app.use('/static', express.static('statics'))

    app.use(cors())

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // app.post('/uploadfile', upload.single('static'), (req, res) => {
    //     const fileType = req.file.mimetype.split('/')[1]
    //     const newName = req.file.filename + '.' + fileType
    //     fs.rename('./statics/' + req.file.filename, './statics/' + newName, () => {
    //         res.send(newName)
    //     })
    // })

    app.post('/api/uploadfile', upload.single('static'), (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileExt = req.file.originalname.split('.').pop(); // Получение оригинального расширения
        const newName = `${req.file.filename}.${fileExt}`; // Установка нового имени файла

        fs.rename(`./statics/${req.file.filename}`, `./statics/${newName}`, (err) => {
            if (err) {
                console.error('Error renaming file:', err);
                return res.status(500).json({ error: 'Failed to process file' });
            }

            res.json({ filename: newName, filePath: `/static/${newName}` }); // Возвращаем клиенту имя файла и путь
        });
    });

    app.use(express.json())
    app.use('/api', router)
    app.use(errorHandling)

    const start = async () => {
        try {

            await sequelize.authenticate()
            await sequelize.sync()

            const adminEmail = process.env.ADMIN_EMAIL || 'arcaneadmin@arcanedevlab.com';
            const adminPassword = process.env.ADMIN_PASSWORD || 'ArcaneBusinessman2025!!';

            const existingAdmin = await User.findOne({ where: { role: 'admin' } });
            if (!existingAdmin) {
                const hashedPassword = await bcrypt.hash(adminPassword, 10);
                await User.create({
                    email: adminEmail,
                    first_name: 'ADL',
                    last_name: 'Admin',
                    password: hashedPassword,
                    phone: '79994654345',
                    subscription_status: 'premium',
                    role: 'admin'
                });
                console.log(`Admin user created with email: ${adminEmail}`);
            } else {
                console.log('Admin user already exists.');
            }

            app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))

        } catch (e) { console.log(e); }
    }

    start();
}