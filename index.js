const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

/**
 * Fungsi untuk mengunggah file dan mengubah format URL
 * @param {string} filePath - Path file lokal (misal: './foto.png')
 */
async function uploadAndTransformUrl(filePath) {
    // 1. Validasi apakah file ada
    if (!fs.existsSync(filePath)) {
        console.error('File tidak ditemukan:', filePath);
        return;
    }

    const form = new FormData();
    // Gunakan 'files[]' sesuai spesifikasi REST API Anda
    form.append('files[]', fs.createReadStream(filePath));

    try {
        console.log('Sedang mengunggah...');

        const response = await axios.post('https://qu.ax/upload', form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        // 2. Ambil URL asli dari response API
        // Struktur: https://qu.ax/9jZTc
        const originalUrl = response.data.files[0].url;

        // 3. Ambil ekstensi file asli (misal: .jpg, .png, .mp4)
        const extension = path.extname(filePath);

        // 4. Manipulasi URL
        // Kita ubah 'https://qu.ax/' menjadi 'https://qu.ax/x/' 
        // dan tambahkan ekstensi di akhir
        const directUrl = originalUrl.replace('https://qu.ax/', 'https://qu.ax/x/') + extension;

        console.log('--- Berhasil ---');
        console.log('URL Asli   :', originalUrl);
        console.log('URL Langsung:', directUrl);
        
        return directUrl;

    } catch (error) {
        console.error('Gagal saat proses:');
        if (error.response) {
            console.error('Response Error:', error.response.data);
        } else {
            console.error('Message:', error.message);
        }
    }
}

// --- CARA PENGGUNAAN ---
// Ganti 'image.jpg' dengan file yang ingin Anda tes.
// Kode ini otomatis menyesuaikan ekstensi (jpg/png/webp/dll)
uploadAndTransformUrl('image.jpg');
