const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors()); // Izinkan akses dari domain lain
app.use(express.json());

// Konfigurasi Multer (Menyimpan file di memori sementara/Buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Route: GET /
 * Deskripsi: Cek status server
 */
app.get('/', (req, res) => {
    res.json({
        status: true,
        message: "Server is running. Use POST /api/upload to upload files.",
        author: "Your Name"
    });
});

/**
 * Route: POST /api/upload
 * Deskripsi: Upload file ke qu.ax dan transform URL
 * Body: form-data -> key: 'file'
 */
app.post('/api/upload', upload.single('file'), async (req, res) => {
    // 1. Validasi apakah file dikirim
    if (!req.file) {
        return res.status(400).json({
            status: false,
            message: "Tidak ada file yang diunggah. Gunakan key 'file' pada form-data."
        });
    }

    try {
        const fileBuffer = req.file.buffer;
        const originalName = req.file.originalname;
        const fileExtension = path.extname(originalName);

        // Siapkan Form Data untuk dikirim ke qu.ax
        const form = new FormData();
        // Penting: Saat mengirim buffer, kita harus menyertakan opsi filename
        form.append('files[]', fileBuffer, { filename: originalName });

        console.log(`Sedang mengunggah: ${originalName}...`);

        // Kirim ke API qu.ax
        const response = await axios.post('https://qu.ax/upload', form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        // 2. Ambil URL asli (Contoh: https://qu.ax/9jZTc)
        const data = response.data;
        if (!data.success || !data.files || data.files.length === 0) {
            throw new Error("Gagal mendapatkan respon valid dari qu.ax");
        }
        
        const originalUrl = data.files[0].url;

        // 3. Manipulasi URL (Logic sesuai permintaan Anda)
        // Ubah 'https://qu.ax/' menjadi 'https://qu.ax/x/' + extension
        const directUrl = originalUrl.replace('https://qu.ax/', 'https://qu.ax/x/') + fileExtension;

        // 4. Kirim Respon ke User
        res.json({
            status: true,
            message: "Berhasil diunggah",
            data: {
                original_name: originalName,
                extension: fileExtension,
                original_url: originalUrl,
                direct_url: directUrl // URL siap pakai
            }
        });

    } catch (error) {
        console.error('Upload Error:', error.message);
        res.status(500).json({
            status: false,
            message: "Gagal memproses file",
            error: error.response ? error.response.data : error.message
        });
    }
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
