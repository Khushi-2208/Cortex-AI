# 🏆 Cortex-AI

> Your intelligent sports companion powered by Retrieval-Augmented Generation (RAG)

Cortex-AI is an advanced AI chatbot that provides instant, accurate, and up-to-date insights on Cricket, Badminton, and Chess. Built with Next.js 14, Google Gemini AI, and DataStax Astra DB for vector search capabilities.

![Cortex-AI Banner](https://img.shields.io/badge/Cortex--AI-Sports%20Intelligence-blue?style=for-the-badge)

---

## ✨ Features

- 🤖 *RAG-Powered Responses* - Retrieval-Augmented Generation for accurate, context-aware answers
- ⚡ *Real-time Streaming* - Watch responses appear as they're generated
- 🎯 *Sports-Focused* - Specialized knowledge in Cricket, Badminton, and Chess
- 🔍 *Vector Search* - Fast semantic search using DataStax Astra DB
- 🔐 *Secure Authentication* - JWT-based login/logout system with bcrypt password hashing
- 🛡 *Protected Routes* - Middleware for route protection and session management
- 🏠 *Beautiful Landing Page* - Engaging hero section to showcase features
- 🌓 *Dark/Light Mode* - Adaptive UI that respects your preferences
- 📱 *Fully Responsive* - Beautiful experience on mobile, tablet, and desktop
- 💬 *Smart Suggestions* - Quick-start prompts to explore capabilities

---

## 🛠 Tech Stack

### Frontend
- *Next.js 14* - React framework with App Router
- *TypeScript* - Type-safe development
- *Tailwind CSS* - Utility-first styling
- *shadcn/ui* - High-quality, accessible UI components
- *React Hooks* - Modern state management

### Backend & AI
- *Google Gemini AI* - Advanced language model (Gemini 2.0 Flash)
- *Google Text Embedding* - Vector embeddings for semantic search
- *DataStax Astra DB* - Serverless vector database
- *Streaming API* - Real-time response generation

### Authentication & Security
- *JWT (jsonwebtoken)* - Secure token-based authentication
- *bcrypt* - Password hashing and verification
- *Next.js Middleware* - Route protection and session management

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- DataStax Astra DB account
- Google AI Studio API key

### 1. Clone the Repository
bash
git clone https://github.com/yourusername/cortex-ai.git
cd cortex-ai


### 2. Install Dependencies
bash
npm install


### 3. Environment Setup
Create a .env file in the root directory:

env
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# DataStax Astra DB
ASTRA_DB_APPLICATION_TOKEN=your_astra_token_here
ASTRA_DB_API_ENDPOINT=https://your-database-id-region.apps.astra.datastax.com
ASTRA_DB_KEYSPACE=your_keyspace_name
ASTRA_DB_COLLECTION=your_collection_name

# JWT Authentication
ACCESS_TOKEN_SECRET=your_secure_jwt_secret_key_here
NEXTAUTH_URL=http://localhost:3000


### 4. Prepare Your Data
Place your sports data files in src/data/ directory (e.g., cricket.json, badminton.json, chess.json)

### 5. Seed the Database
Load your data and generate embeddings:

bash
npm run seed


### 6. Run Development Server
bash
npm run dev


Visit [http://localhost:3000](http://localhost:3000) to see your app! 🚀

---

## 📁 Project Structure


cortex-ai/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── chat/
│   │   └── page.tsx             # Main chat interface
│   ├── login/
│   │   └── page.tsx             # Login page
│   ├── register/
│   │   └── page.tsx             # Registration page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── components/
│   │   ├── Bubble.tsx           # Chat message bubble
│   │   ├── LoadingBubble.tsx    # Loading animation
│   │   ├── PromptSuggestionButton.tsx
│   │   ├── promtSuggestions.tsx # Suggestion row
│   │   └── ui/                  # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       └── ...
│   └── api/
│       ├── chat/
│       │   └── route.ts         # Chat API endpoint
│       ├
│       ├──├── login/
│       │  │   └── route.ts     # Login API
│       │  ├── register/
│       │  │   └── route.ts     # Registration API
│       │  └── logout/
│       │       └── route.ts     # Logout API
├── middleware.ts                # Route protection middleware
├── src/
│   ├── scripts/
│   │   └── loadDB.ts           # Database seeding script
│   ├── lib/
│   │   ├── auth.ts             # JWT utilities
│   │   └── utils.ts            # Helper functions
│   └── data/                   # Sports data files
├── public/
│   └── assets/                 # Images and static files
├── .env.local                  # Environment variables
├── components.json             # shadcn/ui config
├── package.json
└── tailwind.config.ts


---

## 🎯 How It Works

### 1. *Authentication Flow*

Landing Page → Register/Login → JWT Token → Protected Chat Route

- User credentials hashed with bcrypt (10 salt rounds)
- JWT tokens stored in HTTP-only cookies
- Middleware validates tokens on protected routes
- Automatic logout on token expiration

### 2. *Data Ingestion*
- Sports data is processed and stored in JSON format
- Text is chunked for optimal embedding size

### 3. *Vector Embeddings*
- Google's text-embedding-004 model converts text to vectors
- Embeddings are stored in DataStax Astra DB with vector search capability

### 4. *User Query Processing*

User Question → Generate Embedding → Vector Search → Retrieve Context
                                                            ↓
User ← Stream Response ← Gemini AI ← Augmented Prompt with Context


### 5. *RAG Pipeline*
- User query is embedded using the same model
- Vector similarity search finds relevant context (top 10 results)
- Context + user query sent to Gemini AI
- Response streamed back in real-time

---

## 🚀 Usage

### Getting Started
1. *Visit the Landing Page* - See features and benefits
2. *Sign Up* - Create an account with email and password
3. *Login* - Authenticate to access the chat interface
4. *Start Chatting* - Ask questions about sports!

### Authentication
- *Registration*: /register - Create new account
- *Login*: /login - Access existing account
- *Logout*: Automatic token cleanup and redirect
- *Protected Routes*: Chat interface requires authentication

### Starting a Conversation
1. Click on any suggestion prompt or type your question
2. Ask about:
   - Cricket stats, players, tournaments

### Example Queries

"Who is the ICC T20s world champion?"
"Who is the highest paid cricketer?"

---

## 🔧 Configuration

### Adjust Vector Search Results
In app/api/chat/route.ts:
typescript
const cursor = collection.find({}, {
  sort: { $vector: embedding.values },
  limit: 10  // Change this number
})


### Customize AI Prompt
Edit the system prompt in app/api/chat/route.ts:
typescript
const prompt = `
You are an AI assistant who knows everything about Cricket, Badminton, Chess.
// ... customize your prompt
`;


---

## 📊 API Endpoints

### POST /api/chat
Handles chat interactions with streaming responses.

*Request Body:*
json
{
  "messages": [
    { "role": "user", "content": "Your question here" }
  ]
}


*Response:*
Streaming text response from Gemini AI

---

## 🎨 Customization

### Changing Colors
Edit Tailwind classes in components:
- User bubble: bg-blue-500
- Assistant bubble: bg-gray-200 dark:bg-slate-700
- Accent color: text-blue-500

### Adding New Sports
1. Add data files to src/data/
2. Update the system prompt in route.ts
3. Run npm run seed to regenerate embeddings
4. Update suggestion prompts in promtSuggestions.tsx

---

## 🐛 Troubleshooting

### Environment Variables Not Loading
bash
# Stop the dev server and restart
npm run dev


### Vector Search Not Working
- Verify Astra DB credentials
- Check collection name matches .env.local
- Ensure data was seeded successfully

### Streaming Issues
- Check network connection
- Verify Gemini API key is valid
- Look for CORS errors in browser console

---

## 📈 Performance

- *Response Time*: ~2-3 seconds for first token
- *Vector Search*: < 100ms
- *Embedding Generation*: ~500ms per query
- *Streaming*: Real-time token-by-token delivery

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.
---

## 🙏 Acknowledgments

- *Google Gemini AI* - For powerful language generation
- *DataStax* - For scalable vector database
- *Next.js Team* - For an amazing React framework
- *Tailwind CSS* - For beautiful styling

---

## 📧 Contact

Have questions or suggestions? Feel free to reach out!

- GitHub: [@Khushi-2208](https://github.com/Khushi-2208)
- Email: khushikumari062205@gmail.com

---

<div align="center">

*Made with ❤ and 🤖 by [Khushi]*

⭐ Star this repo if you find it helpful!

</div>
