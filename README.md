# Chinese Learning App 🇨🇳

Sebuah aplikasi web interaktif untuk belajar bahasa Mandarin dengan fitur kosakata dan kuis yang menarik.

## Fitur Utama

### 🏠 Halaman Utama

- Landing page yang menarik dengan desain modern
- Animasi interaktif dan responsif
- Navigasi yang mudah ke berbagai fitur

### 📚 Vocabulary (Kosakata)

- Koleksi 100+ kata bahasa Mandarin dengan pinyin dan terjemahan
- Pencarian kata berdasarkan karakter Hanzi, pinyin, atau bahasa Indonesia
- Filter berdasarkan kategori (sapaan, angka, warna, hewan, alam)
- Modal detail untuk setiap kata dengan fitur pronounce
- Desain card yang menarik dan responsif

### 🎯 Quiz Interaktif

- Kuis pilihan ganda dengan 5 pertanyaan acak
- Feedback langsung untuk setiap jawaban
- Sistem scoring dengan persentase
- Fitur text-to-speech untuk pronunciation
- Animasi dan transisi yang smooth

### 🎨 Desain & UX

- Desain modern dengan gradient yang menarik
- Fully responsive untuk semua device
- Animasi scroll dan hover effects
- Font khusus untuk karakter Cina (Noto Sans SC)
- Dark mode friendly colors

## Teknologi yang Digunakan

### Backend

- **Flask** - Web framework Python
- **Python 3.x** - Bahasa pemrograman utama

### Frontend

- **HTML5** - Struktur halaman
- **CSS3** - Styling dengan Flexbox dan Grid
- **JavaScript (ES6+)** - Interaktivitas dan API calls
- **Google Fonts** - Typography (Inter & Noto Sans SC)

### Fitur Browser

- **Web Speech API** - Text-to-speech untuk pronunciation
- **Fetch API** - AJAX requests
- **Intersection Observer** - Scroll animations
- **Local Storage** - Menyimpan preferensi user

## Instalasi dan Menjalankan

### Prasyarat

- Python 3.7 atau lebih baru
- pip (Python package installer)

### Langkah Instalasi

1. **Clone atau download project ini**

   ```bash
   cd aplikasi_sederhana
   ```

2. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Jalankan aplikasi**

   ```bash
   python app.py
   ```

4. **Buka browser dan akses**
   ```
   http://localhost:5000
   ```

## Struktur Project

```
aplikasi_sederhana/
│
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # Dokumentasi project
│
├── templates/            # HTML templates
│   ├── base.html        # Base template
│   ├── index.html       # Homepage
│   ├── vocabulary.html  # Vocabulary page
│   └── quiz.html        # Quiz page
│
└── static/              # Static files
    ├── css/
    │   └── style.css    # Main stylesheet
    └── js/
        ├── main.js      # Main JavaScript
        ├── vocabulary.js # Vocabulary functionality
        └── quiz.js      # Quiz functionality
```

## API Endpoints

### GET `/`

Halaman utama aplikasi

### GET `/vocabulary`

Halaman kosakata

### GET `/quiz`

Halaman kuis

### GET `/api/vocabulary`

Mendapatkan semua data kosakata dalam format JSON

- Query parameter: `category` (optional) - filter berdasarkan kategori

### GET `/api/quiz`

Mendapatkan 5 pertanyaan kuis acak dalam format JSON

### GET `/api/categories`

Mendapatkan daftar semua kategori kosakata

## Fitur Interaktif

### Keyboard Shortcuts

- **Vocabulary Page:**

  - `Ctrl+F` / `Cmd+F`: Focus pada search box
  - `Escape`: Clear search dan close modal

- **Quiz Page:**
  - `1-4`: Pilih jawaban (saat kuis aktif)
  - `Space` / `Enter`: Pronounce kata Cina
  - `Escape`: Close modal

### Text-to-Speech

- Fitur pronunciation menggunakan Web Speech API
- Mendukung bahasa Mandarin (zh-CN)
- Kecepatan bicara disesuaikan untuk pembelajaran

### Responsive Design

- Mobile-first approach
- Breakpoints: 480px, 768px, 1200px
- Touch-friendly interface
- Hamburger menu untuk mobile

## Data Kosakata

Aplikasi ini menyediakan 20+ kata bahasa Mandarin dalam 5 kategori:

1. **Greeting** - Sapaan (你好, 谢谢, 再见)
2. **Basic** - Dasar (水, 火)
3. **Nature** - Alam (山, 树, 花)
4. **Animal** - Hewan (猫, 狗, 鸟, 鱼)
5. **Color** - Warna (红色, 蓝色, 绿色)
6. **Number** - Angka (一, 二, 三, 四, 五)

Setiap kata dilengkapi dengan:

- Karakter Cina tradisional
- Pinyin (romanisasi)
- Terjemahan bahasa Inggris
- Kategori

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Pengembangan Lebih Lanjut

Beberapa ide untuk pengembangan:

1. **Database Integration** - Gunakan SQLite/PostgreSQL
2. **User Authentication** - Login dan progress tracking
3. **More Content** - Tambah lebih banyak kosakata dan kategori
4. **Audio Files** - Gunakan file audio native speaker
5. **Spaced Repetition** - Algoritma pembelajaran adaptif
6. **Writing Practice** - Fitur menulis karakter Cina
7. **Difficulty Levels** - Level pemula hingga mahir
8. **Social Features** - Leaderboard dan sharing

## Kontribusi

Project ini dibuat untuk keperluan pembelajaran. Silakan fork dan modifikasi sesuai kebutuhan.

## Lisensi

MIT License - Bebas digunakan untuk keperluan pendidikan dan komersial.

---

**Dibuat dengan ❤️ untuk para pembelajar bahasa Mandarin**

_Happy Learning! 加油! (Jiāyóu!)_
