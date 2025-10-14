from flask import Flask, render_template, jsonify, request, send_file
import random
import os
import base64
import io
try:
    from google.cloud import texttospeech
    from google.oauth2 import service_account
    GOOGLE_TTS_AVAILABLE = True
except ImportError:
    GOOGLE_TTS_AVAILABLE = False
    print("Google Cloud TTS not available. Using fallback mode.")

app = Flask(__name__)

# Hubungkan dgn service account google cloud
def get_tts_client():
    """Hubungkan dgn service account google cloud"""
    if not GOOGLE_TTS_AVAILABLE:
        return None
        
    try:
        # path ke file service account
        credentials_path = os.path.join(os.path.dirname(__file__), 'speech_service_account.json')
        
        if not os.path.exists(credentials_path):
            print(f"Service account file not found: {credentials_path}")
            return None
        
        # load credential
        credentials = service_account.Credentials.from_service_account_file(credentials_path)
        
        # buat TTS Client
        client = texttospeech.TextToSpeechClient(credentials=credentials)
        return client
        
    except Exception as e:
        print(f"Error initializing TTS client: {e}")
        return None

# Data kosakata bahasa Mandarin
vocabulary = [
    # Kategori 1: Hobi
    {"chinese": "做饭", "pinyin": "zuòfàn", "indonesian": "memasak", "category": "hobi"},
    {"chinese": "画画", "pinyin": "huàhuà", "indonesian": "melukis", "category": "hobi"},
    {"chinese": "看书", "pinyin": "kànshū", "indonesian": "membaca", "category": "hobi"},
    {"chinese": "唱歌", "pinyin": "chànggē", "indonesian": "menyanyi", "category": "hobi"},
    {"chinese": "跳舞", "pinyin": "tiàowǔ", "indonesian": "menari", "category": "hobi"},
    {"chinese": "运动", "pinyin": "yùndòng", "indonesian": "ber-olahraga", "category": "hobi"},
    {"chinese": "拍照片", "pinyin": "pāi zhàopiàn", "indonesian": "ambil foto", "category": "hobi"},
    {"chinese": "购物", "pinyin": "gòuwù", "indonesian": "belanja", "category": "hobi"},
    {"chinese": "旅游", "pinyin": "lǚyóu", "indonesian": "bepergian", "category": "hobi"},
    {"chinese": "玩乐器", "pinyin": "wán yuèqì", "indonesian": "memainkan alat musik", "category": "hobi"},
    {"chinese": "玩游戏", "pinyin": "wán yóuxì", "indonesian": "bermain game", "category": "hobi"},
    {"chinese": "上网", "pinyin": "shàngwǎng", "indonesian": "bermain sosial media", "category": "hobi"},
    {"chinese": "听音乐", "pinyin": "tīng yīnyuè", "indonesian": "mendengarkan musik", "category": "hobi"},
    {"chinese": "看电影", "pinyin": "kàn diànyǐng", "indonesian": "menonton film", "category": "hobi"},
    {"chinese": "写作", "pinyin": "xiězuò", "indonesian": "menulis", "category": "hobi"},
    
    # Kategori 2: Profesi
    {"chinese": "老师", "pinyin": "lǎoshī", "indonesian": "guru", "category": "profesi"},
    {"chinese": "警察", "pinyin": "jǐngchá", "indonesian": "polisi", "category": "profesi"},
    {"chinese": "消防员", "pinyin": "xiāofángyuán", "indonesian": "pemadam kebakaran", "category": "profesi"},
    {"chinese": "护士", "pinyin": "hùshi", "indonesian": "perawat", "category": "profesi"},
    {"chinese": "医生", "pinyin": "yīshēng", "indonesian": "dokter", "category": "profesi"},
    {"chinese": "牙医", "pinyin": "yáyī", "indonesian": "dokter gigi", "category": "profesi"},
    {"chinese": "兽医", "pinyin": "shòuyī", "indonesian": "dokter hewan", "category": "profesi"},
    {"chinese": "飞行员", "pinyin": "fēixíngyuán", "indonesian": "pilot", "category": "profesi"},
    {"chinese": "商人", "pinyin": "shāngrén", "indonesian": "pengusaha", "category": "profesi"},
    {"chinese": "记者", "pinyin": "jìzhě", "indonesian": "jurnalis", "category": "profesi"},
    {"chinese": "律师", "pinyin": "lǜshī", "indonesian": "pengacara", "category": "profesi"},
    {"chinese": "厨师", "pinyin": "chúshī", "indonesian": "koki", "category": "profesi"},
    {"chinese": "歌手", "pinyin": "gēshǒu", "indonesian": "penyanyi", "category": "profesi"},
    {"chinese": "演员", "pinyin": "yǎnyuán", "indonesian": "aktor", "category": "profesi"},
    {"chinese": "清洁工", "pinyin": "qīngjiégōng", "indonesian": "petugas kebersihan", "category": "profesi"},
    {"chinese": "司机", "pinyin": "sījī", "indonesian": "sopir", "category": "profesi"},
    {"chinese": "家庭主妇", "pinyin": "jiātíngzhǔfù", "indonesian": "ibu rumah tangga", "category": "profesi"},
    
    # Kategori 3: Angka
    {"chinese": "零", "pinyin": "líng", "indonesian": "nol", "category": "angka"},
    {"chinese": "一", "pinyin": "yī", "indonesian": "satu", "category": "angka"},
    {"chinese": "二", "pinyin": "èr", "indonesian": "dua", "category": "angka"},
    {"chinese": "三", "pinyin": "sān", "indonesian": "tiga", "category": "angka"},
    {"chinese": "四", "pinyin": "sì", "indonesian": "empat", "category": "angka"},
    {"chinese": "五", "pinyin": "wǔ", "indonesian": "lima", "category": "angka"},
    {"chinese": "六", "pinyin": "liù", "indonesian": "enam", "category": "angka"},
    {"chinese": "七", "pinyin": "qī", "indonesian": "tujuh", "category": "angka"},
    {"chinese": "八", "pinyin": "bā", "indonesian": "delapan", "category": "angka"},
    {"chinese": "九", "pinyin": "jiǔ", "indonesian": "sembilan", "category": "angka"},
    {"chinese": "十", "pinyin": "shí", "indonesian": "sepuluh", "category": "angka"},
    {"chinese": "十五", "pinyin": "shíwǔ", "indonesian": "lima belas", "category": "angka"},
    {"chinese": "七十", "pinyin": "qīshí", "indonesian": "tujuh puluh", "category": "angka"},
    {"chinese": "四十四", "pinyin": "sìshí sì", "indonesian": "empat puluh empat", "category": "angka"},
    {"chinese": "三百", "pinyin": "sānbǎi", "indonesian": "tiga ratus", "category": "angka"},
    {"chinese": "四百零四", "pinyin": "sìbǎi líng sì", "indonesian": "empat ratus empat", "category": "angka"},
    {"chinese": "六百八十三", "pinyin": "liùbǎi bāshí sān", "indonesian": "enam ratus delapan puluh tiga", "category": "angka"},
    
    # Kategori 4: Hari
    {"chinese": "星期一", "pinyin": "xīng qī yī", "indonesian": "senin", "category": "hari"},
    {"chinese": "星期二", "pinyin": "xīng qī èr", "indonesian": "selasa", "category": "hari"},
    {"chinese": "星期三", "pinyin": "xīng qī sān", "indonesian": "rabu", "category": "hari"},
    {"chinese": "星期四", "pinyin": "xīng qī sì", "indonesian": "kamis", "category": "hari"},
    {"chinese": "星期五", "pinyin": "xīng qī wǔ", "indonesian": "jumat", "category": "hari"},
    {"chinese": "星期六", "pinyin": "xīng qī liù", "indonesian": "sabtu", "category": "hari"},
    {"chinese": "星期日", "pinyin": "xīng qī rì", "indonesian": "minggu", "category": "hari"},
    
    # Kategori 5: Bulan
    {"chinese": "一月", "pinyin": "yī yuè", "indonesian": "januari", "category": "bulan"},
    {"chinese": "二月", "pinyin": "èr yuè", "indonesian": "februari", "category": "bulan"},
    {"chinese": "三月", "pinyin": "sān yuè", "indonesian": "maret", "category": "bulan"},
    {"chinese": "四月", "pinyin": "sì yuè", "indonesian": "april", "category": "bulan"},
    {"chinese": "五月", "pinyin": "wǔ yuè", "indonesian": "mei", "category": "bulan"},
    {"chinese": "六月", "pinyin": "liù yuè", "indonesian": "juni", "category": "bulan"},
    {"chinese": "七月", "pinyin": "qī yuè", "indonesian": "juli", "category": "bulan"},
    {"chinese": "八月", "pinyin": "bā yuè", "indonesian": "agustus", "category": "bulan"},
    {"chinese": "九月", "pinyin": "jiǔ yuè", "indonesian": "september", "category": "bulan"},
    {"chinese": "十月", "pinyin": "shí yuè", "indonesian": "oktober", "category": "bulan"},
    {"chinese": "十一月", "pinyin": "shíyī yuè", "indonesian": "november", "category": "bulan"},
    {"chinese": "十二月", "pinyin": "shí'èr yuè", "indonesian": "desember", "category": "bulan"},
    
    # Kategori 6: Timeline
    {"chinese": "昨天", "pinyin": "zuótiān", "indonesian": "kemarin", "category": "waktu"},
    {"chinese": "今天", "pinyin": "jīntiān", "indonesian": "hari ini", "category": "waktu"},
    {"chinese": "明天", "pinyin": "míngtiān", "indonesian": "besok", "category": "waktu"},
    
    # Kategori 7: Kata Sapaan
    {"chinese": "你好", "pinyin": "nǐ hǎo", "indonesian": "hai", "category": "sapaan"},
    {"chinese": "您好", "pinyin": "nín hǎo", "indonesian": "hai (formal)", "category": "sapaan"},
    {"chinese": "大家好", "pinyin": "dàjiā hǎo", "indonesian": "hai semua", "category": "sapaan"},
    {"chinese": "喂", "pinyin": "wèi", "indonesian": "halo", "category": "sapaan"},
    {"chinese": "早上好", "pinyin": "zǎoshang hǎo", "indonesian": "selamat pagi", "category": "sapaan"},
    {"chinese": "下午好", "pinyin": "xiàwǔ hǎo", "indonesian": "selamat siang/sore", "category": "sapaan"},
    {"chinese": "晚上好", "pinyin": "wǎnshàng hǎo", "indonesian": "selamat malam", "category": "sapaan"},
    {"chinese": "好久不见", "pinyin": "hǎojiǔ bùjiàn", "indonesian": "lama tidak berjumpa", "category": "sapaan"},
    {"chinese": "再见", "pinyin": "zàijiàn", "indonesian": "sampai jumpa", "category": "sapaan"},
    {"chinese": "谢谢", "pinyin": "xièxie", "indonesian": "terima kasih", "category": "sapaan"},
    {"chinese": "不客气", "pinyin": "bù kèqì", "indonesian": "sama-sama", "category": "sapaan"},
    {"chinese": "对不起", "pinyin": "duìbùqǐ", "indonesian": "maaf", "category": "sapaan"},
    {"chinese": "没关系", "pinyin": "méiguānxi", "indonesian": "nggak papa", "category": "sapaan"},
    
    # Kategori 8: Negara
    {"chinese": "中国", "pinyin": "zhōngguó", "indonesian": "tiongkok", "category": "negara"},
    {"chinese": "英国", "pinyin": "yīngguó", "indonesian": "inggris", "category": "negara"},
    {"chinese": "德国", "pinyin": "déguó", "indonesian": "jerman", "category": "negara"},
    {"chinese": "澳大利亚", "pinyin": "àodàlìyà", "indonesian": "australia", "category": "negara"},
    {"chinese": "意大利", "pinyin": "yìdàlì", "indonesian": "italia", "category": "negara"},
    {"chinese": "美国", "pinyin": "měiguó", "indonesian": "amerika", "category": "negara"},
    {"chinese": "法国", "pinyin": "fǎguó", "indonesian": "perancis", "category": "negara"},
    {"chinese": "加拿大", "pinyin": "jiānádà", "indonesian": "kanada", "category": "negara"},
    {"chinese": "日本", "pinyin": "rìběn", "indonesian": "jepang", "category": "negara"},
    {"chinese": "韩国", "pinyin": "hánguó", "indonesian": "korea selatan", "category": "negara"},
    {"chinese": "西班牙", "pinyin": "xībānyá", "indonesian": "spanyol", "category": "negara"},
    {"chinese": "阿根廷", "pinyin": "āgēntíng", "indonesian": "argentina", "category": "negara"},
    {"chinese": "荷兰", "pinyin": "hélán", "indonesian": "belanda", "category": "negara"},
    {"chinese": "俄罗斯", "pinyin": "éluósī", "indonesian": "rusia", "category": "negara"},
    {"chinese": "埃及", "pinyin": "āi jí", "indonesian": "mesir", "category": "negara"},
    {"chinese": "印度尼西亚", "pinyin": "yìndùníxīyà", "indonesian": "indonesia", "category": "negara"},
    {"chinese": "印度", "pinyin": "yìndù", "indonesian": "india", "category": "negara"},
    {"chinese": "马来西亚", "pinyin": "mǎlāxīyà", "indonesian": "malaysia", "category": "negara"},
    {"chinese": "泰国", "pinyin": "tàiguó", "indonesian": "thailand", "category": "negara"},
    {"chinese": "菲律宾", "pinyin": "fēilǜbīn", "indonesian": "filipina", "category": "negara"}
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/vocabulary')
def vocabulary_page():
    return render_template('vocabulary.html')

@app.route('/quiz')
def quiz_page():
    return render_template('quiz.html')

@app.route('/api/vocabulary')
def get_vocabulary():
    """Mendapatkan data kosakata dengan filter opsional"""
    category = request.args.get('category')
    search = request.args.get('search', '').lower()
    
    filtered_vocab = vocabulary
    
    # Filter berdasarkan kategori
    if category:
        filtered_vocab = [word for word in filtered_vocab if word['category'] == category]
    
    # Filter berdasarkan kata pencarian
    if search:
        filtered_vocab = [
            word for word in filtered_vocab 
            if search in word['chinese'].lower() or 
               search in word['pinyin'].lower() or 
               search in word['indonesian'].lower()
        ]
    
    return jsonify(filtered_vocab)

@app.route('/api/quiz')
def get_quiz():
    """Membuat 5 pertanyaan kuis acak"""
    quiz_questions = []
    
    # Pastikan memiliki cukup vocabulary untuk membuat 5 pertanyaan
    if len(vocabulary) < 4:
        return jsonify({'error': 'Tidak cukup vocabulary untuk membuat quiz'}), 400
    
    # Buat 5 pertanyaan
    used_words = set()
    for i in range(5):
        # Pilih kata acak yang belum digunakan
        available_words = [word for word in vocabulary if word['chinese'] not in used_words]
        if not available_words:
            break
            
        correct_word = random.choice(available_words)
        used_words.add(correct_word['chinese'])
        
        # Buat 2 jawaban salah dari kata yang berbeda
        wrong_words = random.sample(
            [word for word in vocabulary if word != correct_word], 2
        )
        
        # Buat daftar pilihan
        options = [correct_word['indonesian']] + [word['indonesian'] for word in wrong_words]
        random.shuffle(options)
        
        quiz_data = {
            'question': f"Apa arti dari '{correct_word['chinese']}' ({correct_word['pinyin']})?",
            'options': options,
            'correct': correct_word['indonesian'],
            'chinese': correct_word['chinese'],
            'pinyin': correct_word['pinyin']
        }
        
        quiz_questions.append(quiz_data)
    
    return jsonify(quiz_questions)

@app.route('/api/categories')
def get_categories():
    """Mendapatkan semua kategori yang tersedia"""
    categories = list(set(word['category'] for word in vocabulary))
    return jsonify(categories)

@app.route('/api/speak', methods=['POST'])
def speak_text():
    """Mengkonversi teks ke suara menggunakan Google Cloud TTS"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        print(f"[TTS] Permintaan untuk teks: {text}")
        
        if not text:
            print("[TTS] Error: Tidak ada teks yang diberikan")
            return jsonify({'error': 'Tidak ada teks yang diberikan'}), 400
        
        # Periksa apakah Google TTS tersedia
        if not GOOGLE_TTS_AVAILABLE:
            print("[TTS] Error: Google TTS tidak tersedia")
            return jsonify({'error': 'Google TTS tidak tersedia', 'fallback': True}), 503
        
        # Dapatkan klien TTS
        client = get_tts_client()
        if not client:
            print("[TTS] Error: Klien TTS tidak tersedia")
            return jsonify({'error': 'Layanan TTS tidak tersedia', 'fallback': True}), 503
        
        print("[TTS] Klien TTS berhasil dibuat")
        
        # Siapkan input sintesis
        synthesis_input = texttospeech.SynthesisInput(text=text)
        
        # Buat permintaan suara
        voice = texttospeech.VoiceSelectionParams(
            language_code="cmn-CN",  
            name="cmn-CN-Standard-A",
            ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
        )
        
        # Pilih jenis file audio
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )
        
        # Lakukan permintaan text-to-speech
        print("[TTS] Mengirim permintaan ke Google Cloud TTS...")
        response = client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )
        
        print(f"[TTS] Respons diterima, ukuran audio: {len(response.audio_content)} bytes")
        
        # Encode konten audio ke base64
        audio_base64 = base64.b64encode(response.audio_content).decode('utf-8')
        
        print("[TTS] Audio berhasil di-encode ke base64")
        
        return jsonify({
            'success': True,
            'audio': audio_base64,
            'format': 'mp3'
        })
        
    except Exception as e:
        print(f"[TTS] Error dalam sintesis suara: {e}")
        import traceback
        print(f"[TTS] Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Sintesis suara gagal', 'fallback': True}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)