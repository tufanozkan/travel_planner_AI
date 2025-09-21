# 🧳 Travel Planner AI

**Yapay Zeka Destekli Akıllı Seyahat Planlama Sistemi**

Bu proje, kullanıcıların seyahat tercihlerine göre kişiselleştirilmiş seyahat önerileri sunan kapsamlı bir AI destekli seyahat planlama platformudur. Sistem, YouTube videolarından elde edilen seyahat içeriklerini analiz ederek, RAG (Retrieval-Augmented Generation) teknolojisi ve Ollama LLM entegrasyonu ile akıllı öneriler üretir.

## 🚀 Özellikler

### 🎯 Ana Özellikler

- **Kişiselleştirilmiş Seyahat Önerileri**: Bütçe, kişi sayısı, ilgi alanları ve süreye göre özelleştirilmiş öneriler
- **AI Destekli İçerik Analizi**: YouTube videolarından otomatik transcript çıkarma ve NLP analizi
- **RAG Teknolojisi**: Pinecone vektör veritabanı ile gelişmiş bilgi erişimi
- **Çoklu Dil Desteği**: Türkçe ve İngilizce içerik desteği
- **Gerçek Zamanlı Veri İşleme**: Canlı veri çekme ve analiz

### 🛠️ Teknik Özellikler

- **Modern Frontend**: React 18 + Material-UI ile responsive tasarım
- **Güçlü Backend**: Node.js + Express.js API servisi
- **AI/ML Pipeline**: Python tabanlı NLP ve embedding işlemleri
- **Vektör Veritabanı**: Pinecone ile semantik arama
- **NoSQL Veritabanı**: MongoDB Atlas ile esnek veri saklama
- **Web Scraping**: Puppeteer ile YouTube transcript çıkarma

## 📁 Proje Yapısı

```
travelplanner_ai/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # UI Bileşenleri
│   │   │   └── Header.js      # Ana navigasyon
│   │   ├── pages/             # Sayfa Bileşenleri
│   │   │   └── HomePage.js    # Ana seyahat formu
│   │   ├── App.js             # Ana uygulama
│   │   └── index.js           # Giriş noktası
│   └── package.json           # Frontend bağımlılıkları
├── server/                     # Node.js Backend
│   ├── config/
│   │   └── db.config.js       # MongoDB bağlantı yapılandırması
│   ├── controllers/           # API Controller'ları
│   │   ├── scraping.controller.js  # YouTube scraping
│   │   └── transcript.controller.js # Transcript yönetimi
│   ├── middleware/
│   │   └── security.js        # Güvenlik middleware'leri
│   ├── models/
│   │   └── Transcript.js      # MongoDB şema tanımları
│   ├── routes/                # API Rotaları
│   │   ├── scraping.routes.js # Scraping endpoint'leri
│   │   ├── search.route.js    # Ana arama API'si
│   │   └── transcript.routes.js # Transcript API'si
│   ├── python_scripts/        # AI/ML İşlemleri
│   │   ├── entity_extractor.py      # NLP entity çıkarma
│   │   ├── mongodb_pinecone_embeddings.py # Vektör oluşturma
│   │   ├── travel_rag_ollamaa.py    # RAG + Ollama entegrasyonu
│   │   ├── requirements.txt         # Python bağımlılıkları
│   │   └── venv/                    # Python sanal ortamı
│   ├── server.js              # Ana sunucu dosyası
│   └── package.json           # Backend bağımlılıkları
└── README.md                  # Bu dosya
```

## 🛠️ Kurulum

### Gereksinimler

- **Node.js** (v16 veya üzeri)
- **Python** (v3.8 veya üzeri)
- **MongoDB Atlas** hesabı
- **Pinecone** hesabı
- **OpenAI API** anahtarı
- **Ollama** (yerel LLM için)

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd travelplanner_ai
```

### 2. Backend Kurulumu

```bash
cd server
npm install
```

### 3. Frontend Kurulumu

```bash
cd ../client
npm install
```

### 4. Python Ortamı Kurulumu

```bash
cd ../server/python_scripts
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 5. Ortam Değişkenleri

`.env` dosyası oluşturun:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=travelplaner

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Server
PORT=5001
NODE_ENV=development
```

### 6. Ollama Kurulumu

```bash
# Ollama'yı indirin ve kurun
curl -fsSL https://ollama.ai/install.sh | sh

# Llama3.2 modelini indirin
ollama pull llama3.2
```

## 🚀 Çalıştırma

### 1. Backend'i Başlatın

```bash
cd server
npm run dev
```

### 2. Frontend'i Başlatın

```bash
cd client
npm start
```

### 3. Ollama'yı Başlatın

```bash
ollama serve
```

## 🔧 API Endpoints

### Arama API'si

```http
POST /api/search
Content-Type: application/json

{
  "location": "Londra",
  "budget": "orta",
  "personCount": "2",
  "interests": ["tarihi", "müze", "yemek"],
  "holidayDays": 5
}
```

### Transcript API'si

```http
GET /api/scrape/transcript/{videoId}
```

### Konum Bazlı Transcript'ler

```http
GET /api/transcripts/location/{location}
```

## 🤖 AI/ML Pipeline

### 1. Veri Toplama

- YouTube videolarından otomatik transcript çıkarma
- Puppeteer ile web scraping
- Türkçe ve İngilizce içerik desteği

### 2. NLP Analizi

- **spaCy**: Named Entity Recognition (NER)
- **BERT**: Gelişmiş entity çıkarma
- **NLTK**: Metin işleme ve tokenization

### 3. Vektör Oluşturma

- OpenAI Embeddings API ile metin vektörleştirme
- Pinecone vektör veritabanında saklama
- Semantik arama için optimizasyon

### 4. RAG Sistemi

- Kullanıcı sorguları için context retrieval
- Ollama LLM ile yanıt üretimi
- Kişiselleştirilmiş seyahat önerileri

## 📊 Veri Akışı

```mermaid
graph TD
    A[Kullanıcı Girişi] --> B[React Frontend]
    B --> C[Node.js API]
    C --> D[Python RAG Script]
    D --> E[Pinecone Search]
    D --> F[Ollama LLM]
    E --> G[Context Retrieval]
    F --> H[Response Generation]
    G --> H
    H --> I[Personalized Recommendations]
    I --> B
```

## 🎨 Frontend Özellikleri

### UI/UX

- **Material-UI**: Modern ve responsive tasarım
- **Gradient Backgrounds**: Görsel çekicilik
- **Form Validation**: Kullanıcı dostu hata yönetimi
- **Mobile Responsive**: Tüm cihazlarda uyumlu

### Bileşenler

- **Header**: Navigasyon ve kullanıcı girişi
- **HomePage**: Ana seyahat planlama formu
- **SearchForm**: Gelişmiş arama parametreleri

## 🔒 Güvenlik

- **CORS**: Cross-origin istekler için yapılandırma
- **Rate Limiting**: API istekleri için sınırlama
- **Input Validation**: Kullanıcı girişi doğrulama
- **Error Handling**: Kapsamlı hata yönetimi

## 📈 Performans Optimizasyonu

- **Batch Processing**: Toplu veri işleme
- **Caching**: Pinecone vektör cache'i
- **Rate Limiting**: API kullanım optimizasyonu
- **Async Processing**: Asenkron veri işleme

## 🧪 Test Etme

### Python Scriptleri

```bash
cd server/python_scripts
source venv/bin/activate

# Entity extraction test
python entity_extractor.py

# MongoDB to Pinecone migration
python mongodb_pinecone_embeddings.py

# RAG system test
python travel_rag_ollamaa.py
```

### API Testleri

```bash
# Backend test
cd server
npm test

# Frontend test
cd client
npm test
```

## 🚀 Deployment

### Production Build

```bash
# Frontend build
cd client
npm run build

# Backend production
cd server
npm start
```

### Docker (Opsiyonel)

```dockerfile
# Dockerfile örneği
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5001
CMD ["npm", "start"]
```

## 📝 Kullanım Örnekleri

### Temel Arama

1. Ana sayfada hedef lokasyonu girin
2. Bütçe seviyenizi seçin (düşük/orta/yüksek)
3. Kişi sayısını belirleyin
4. İlgi alanlarınızı işaretleyin
5. Tatil sürenizi girin
6. "Arama Yap" butonuna tıklayın

### Gelişmiş Özellikler

- **Çoklu İlgi Alanı**: Birden fazla kategori seçebilirsiniz
- **Esnek Bütçe**: Bütçe seviyenize göre öneriler
- **Süre Optimizasyonu**: Tatil sürenize uygun planlar

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 👥 Geliştirici

**Tufan** - Proje Geliştiricisi

## 🙏 Teşekkürler

- **OpenAI** - Embedding API'si
- **Pinecone** - Vektör veritabanı
- **Ollama** - Yerel LLM çözümü
- **Material-UI** - UI bileşenleri
- **MongoDB** - NoSQL veritabanı

## 📞 İletişim

Proje hakkında sorularınız için:

- GitHub Issues kullanın
- Email: [your-email@example.com]

---

**Not**: Bu proje geliştirme aşamasındadır. Production kullanımı için ek güvenlik ve optimizasyon önlemleri alınması önerilir.
