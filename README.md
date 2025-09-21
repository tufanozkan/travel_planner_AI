# 🧳 Travel Planner AI

**Intelligent AI-Powered Travel Planning System**

A comprehensive AI-driven travel planning platform that delivers personalized travel recommendations based on user preferences. The system leverages advanced natural language processing, RAG (Retrieval-Augmented Generation) technology, and Ollama LLM integration to analyze travel content from YouTube videos and generate intelligent, context-aware recommendations.

## 🚀 Features

### 🎯 Core Capabilities

- **Personalized Travel Recommendations**: Customized suggestions based on budget, group size, interests, and duration
- **AI-Powered Content Analysis**: Automated transcript extraction from YouTube videos with advanced NLP processing
- **RAG Technology Integration**: Enhanced information retrieval using Pinecone vector database
- **Multi-Language Support**: Comprehensive Turkish and English content processing
- **Real-Time Data Processing**: Live content extraction and intelligent analysis

### 🛠️ Technical Architecture

- **Modern Frontend Stack**: React 18 with Material-UI for responsive, component-based design
- **Robust Backend Infrastructure**: Node.js + Express.js RESTful API architecture
- **Advanced AI/ML Pipeline**: Python-based NLP processing with spaCy, BERT, and NLTK
- **Vector Database Integration**: Pinecone for high-performance semantic search and similarity matching
- **Scalable NoSQL Database**: MongoDB Atlas for flexible document storage and retrieval
- **Intelligent Web Scraping**: Puppeteer-based automated content extraction from YouTube

## 📁 Project Structure

```
travelplanner_ai/
├── client/                     # React Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI Components
│   │   │   └── Header.js      # Main navigation component
│   │   ├── pages/             # Page Components
│   │   │   └── HomePage.js    # Primary travel planning form
│   │   ├── App.js             # Main application component
│   │   └── index.js           # Application entry point
│   └── package.json           # Frontend dependencies
├── server/                     # Node.js Backend Service
│   ├── config/
│   │   └── db.config.js       # MongoDB connection configuration
│   ├── controllers/           # API Controllers
│   │   ├── scraping.controller.js  # YouTube content scraping
│   │   └── transcript.controller.js # Transcript management
│   ├── middleware/
│   │   └── security.js        # Security middleware
│   ├── models/
│   │   └── Transcript.js      # MongoDB schema definitions
│   ├── routes/                # API Routes
│   │   ├── scraping.routes.js # Scraping endpoints
│   │   ├── search.route.js    # Main search API
│   │   └── transcript.routes.js # Transcript API endpoints
│   ├── python_scripts/        # AI/ML Processing Pipeline
│   │   ├── entity_extractor.py      # NLP entity extraction
│   │   ├── mongodb_pinecone_embeddings.py # Vector generation
│   │   ├── travel_rag_ollamaa.py    # RAG + Ollama integration
│   │   ├── requirements.txt         # Python dependencies
│   │   └── venv/                    # Python virtual environment
│   ├── server.js              # Main server file
│   └── package.json           # Backend dependencies
└── README.md                  # This file
```

## 🛠️ Installation

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB Atlas** account
- **Pinecone** account
- **OpenAI API** key
- **Ollama** (for local LLM)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd travelplanner_ai
```

### 2. Backend Setup

```bash
cd server
npm install
```

### 3. Frontend Setup

```bash
cd ../client
npm install
```

### 4. Python Environment Setup

```bash
cd ../server/python_scripts
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 5. Environment Variables

Create `.env` file:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

# Pinecone Vector Database
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=travelplaner

# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# Server Configuration
PORT=5001
NODE_ENV=development
```

### 6. Ollama Installation

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull Llama3.2 model
ollama pull llama3.2
```

## 🚀 Running the Application

### 1. Start Backend Server

```bash
cd server
npm run dev
```

### 2. Start Frontend Application

```bash
cd client
npm start
```

### 3. Start Ollama Service

```bash
ollama serve
```

## 🔧 API Endpoints

### Search API

```http
POST /api/search
Content-Type: application/json

{
  "location": "London",
  "budget": "medium",
  "personCount": "2",
  "interests": ["historical", "museums", "food"],
  "holidayDays": 5
}
```

### Transcript API

```http
GET /api/scrape/transcript/{videoId}
```

### Location-based Transcripts

```http
GET /api/transcripts/location/{location}
```

## 🤖 AI/ML Pipeline

### 1. Data Collection

- Automated transcript extraction from YouTube videos
- Puppeteer-based web scraping
- Multi-language content support (Turkish & English)

### 2. NLP Analysis

- **spaCy**: Named Entity Recognition (NER) with `en_core_web_lg` model
- **BERT**: Advanced entity extraction using `dbmdz/bert-large-cased-finetuned-conll03-english`
- **NLTK**: Text processing and tokenization with sentence segmentation

### 3. Vector Generation

- OpenAI Embeddings API (`text-embedding-ada-002`) for text vectorization
- Pinecone vector database for storage and retrieval
- Semantic search optimization with metadata filtering

### 4. RAG System

- Context retrieval for user queries using vector similarity search
- Ollama LLM integration for response generation
- Personalized travel recommendations with parameter-based filtering

## 📊 Data Flow Architecture

```mermaid
graph TD
    A[User Input] --> B[React Frontend]
    B --> C[Node.js API]
    C --> D[Python RAG Script]
    D --> E[Pinecone Vector Search]
    D --> F[Ollama LLM]
    E --> G[Context Retrieval]
    F --> H[Response Generation]
    G --> H
    H --> I[Personalized Recommendations]
    I --> B
```

## 🎨 Frontend Features

### UI/UX Design

- **Material-UI v5**: Modern, responsive component library
- **Gradient Backgrounds**: Visually appealing design system
- **Form Validation**: User-friendly error handling and validation
- **Mobile Responsive**: Cross-device compatibility

### Component Architecture

- **Header**: Navigation and user authentication interface
- **HomePage**: Primary travel planning form with advanced filtering
- **SearchForm**: Multi-parameter search with real-time validation

## 🔒 Security Implementation

- **CORS Configuration**: Cross-origin request handling
- **Rate Limiting**: API request throttling with `express-rate-limit`
- **Input Validation**: Comprehensive user input sanitization
- **Error Handling**: Secure error management with `helmet` middleware

## 📈 Performance Optimization

- **Batch Processing**: Efficient bulk data processing
- **Vector Caching**: Pinecone vector database caching
- **Rate Limiting**: API usage optimization
- **Async Processing**: Non-blocking asynchronous operations
- **Connection Pooling**: MongoDB connection optimization

## 🧪 Testing

### Python Scripts Testing

```bash
cd server/python_scripts
source venv/bin/activate

# Entity extraction testing
python entity_extractor.py

# MongoDB to Pinecone migration
python mongodb_pinecone_embeddings.py

# RAG system testing
python travel_rag_ollamaa.py
```

### API Testing

```bash
# Backend testing
cd server
npm test

# Frontend testing
cd client
npm test
```

## 🚀 Deployment

### Production Build

```bash
# Frontend production build
cd client
npm run build

# Backend production start
cd server
npm start
```

### Docker Configuration

```dockerfile
# Multi-stage Dockerfile
FROM node:18-alpine AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

FROM node:18-alpine AS backend
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./
COPY --from=frontend-build /app/client/build ./public

EXPOSE 5001
CMD ["npm", "start"]
```

## 📝 Usage Examples

### Basic Search Workflow

1. Enter target location in the main form
2. Select budget level (low/medium/high)
3. Specify group size
4. Choose interest categories
5. Set vacation duration
6. Click "Search" to generate recommendations

### Advanced Features

- **Multi-Category Selection**: Multiple interest categories support
- **Flexible Budgeting**: Dynamic budget-based recommendations
- **Duration Optimization**: Trip duration-specific planning

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## 👥 Developer

**Tufan** - Project Developer

## 🙏 Acknowledgments

- **OpenAI** - Embedding API and language models
- **Pinecone** - Vector database and similarity search
- **Ollama** - Local LLM solution
- **Material-UI** - React component library
- **MongoDB** - NoSQL database solution
- **spaCy** - Natural language processing library
- **Hugging Face** - Pre-trained BERT models

## 📞 Contact

For questions about this project:

- Use GitHub Issues
- Email: [tuf.ozkan@gmail.com]

---

**Note**: This project is in active development. Additional security and optimization measures are recommended for production deployment.
