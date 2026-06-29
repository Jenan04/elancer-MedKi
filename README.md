# 🩺 MedKi — Universal Medical Study Tool & AI Flashcard Converter

**MedKi** is an intelligent, full-stack application engineered specifically for medical students. It streamlines learning by turning unorganized medical materials—ranging from messy handwritten clinic notes to dense lecture slide decks—into clean, structured Question/Answer pairs. Students can preview, edit, and export these seamlessly as ready-to-import Anki CSV files or study them directly inside the app.

---

## Key Features

- **Universal File Ingestion:** Supports `.docx`, `.pptx`, `.pdf`, and raw images.
- **Phase 1: Advanced OCR Layer:** Specialized parsing to extract text from messy handwritten medical prescriptions and clinical notebooks.
- **Phase 2: Medical AI Parsing:** Powered by Gemini API to break down long paragraphs into structured Question & Answer high-yield flashcards.
- **Interactive Draft Board:** A robust frontend preview table allowing students to edit (inline), refine, or delete flashcards before saving.
- **Physical CSV Export:** One-click download of standardized, UTF-8 encoded `.csv` files built specifically for effortless Anki compatibility.
- **Future Add-on:** Live in-app lecture voice recorder with Speech-to-Text conversion.

---

## Architecture & Tech Stack

MedKi is built as a decoupled, performance-optimized system utilizing a multi-container isolated infrastructure:

- **Frontend:** Next.js 15+ (App Router) & Tailwind CSS
- **Backend API:** Laravel 13 (PHP 8.4-FPM)
- **Database:** PostgreSQL 15
- **Reverse Proxy / Gateway:** Nginx Alpine
- **Containerization:** Docker & Docker Compose

---

## Getting Started (Local Development)

### Prerequisites
Make sure you have [Docker](https://www.docker.com/) and `docker-compose` installed on your machine.

### Installation

1. **Clone the Repository:**
   ```bash
   git clone [https://github.com/your-username/medki.git](https://github.com/your-username/medki.git)
   cd medki