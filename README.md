# 🧮 Age Calculator POC

This is a full-stack **Age Calculator** demo project built with:
- **React (Vite)** for frontend
- **Flask (Python)** for backend

It calculates detailed age (years, months, days, next birthday, etc.) from the user’s date of birth.

---

## 🏗️ Project Structure
age_calc_poc/
├── backend/ → Flask API (Python)
└── frontend/ → React UI (Vite)

yaml
Copy code

---

## ⚙️ Backend Setup (Flask)

### Prerequisites
- Python 3.9+
- pip

### Steps
```bash
cd backend
python -m venv myenv
myenv\Scripts\activate  # (Windows)
# or source myenv/bin/activate  (Mac/Linux)

pip install -r requirements.txt
python app.py
Backend runs at:
👉 http://localhost:5000

💻 Frontend Setup (React)
Prerequisites
Node.js v20+

npm 9+

Steps
bash
Copy code
cd frontend
npm install
npm run dev
Frontend runs at:
👉 http://localhost:5173

Make sure your frontend/src/services/ageService.js uses the correct backend URL, for example:

js
Copy code
const API_BASE_URL = "https://age-calc-poc-bckend.onrender.com/api";
🌍 Deployment
Backend: Render.com (Free Flask hosting)

Frontend: Vercel.com (Free React hosting)

🧩 Features
Accepts date in multiple formats (YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY)

Auto-converts to backend compatible format

Calculates:

Years, months, and days

Total months and total days

Next birthday and days left

Input validation and error handling (no future or invalid dates)

CORS enabled for React–Flask communication

🩺 Health Check
bash
Copy code
GET /api/health
Response:

json
Copy code
{
  "status": "healthy",
  "service": "age-calculator-api",
  "version": "1.0.0"
}
