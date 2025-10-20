Perfect — you’ve got a solid creative and technical direction for **MB Pictures Canada Inc.**’s website.
Below is a **complete, professional-level `README.md`** file that includes:

* A full project overview
* The design and feature descriptions you provided
* A technical architecture (PERN stack)
* Folder structure plan for single frontend (with `admin/` and `user/` pages)
* Setup instructions and deployment strategy
* Developer notes for scalability and CMS control

---

## 📽️ MB Pictures Canada Inc. – Website

### 🎬 Overview

**MB Pictures Canada Inc.** is a complete **Film & Media Production House** based in **London, Ontario**, offering end-to-end production services across Canada — from **concept and casting** to **post-production and distribution**.
This project builds a **cinematic, dynamic, and CMS-powered website** with an admin panel for full content control.

---

### 🌐 Website Sections

#### **1. Home Page**

* Hero section with **golden/yellow embossed logo** and **cinematic light beam** background.
* Headline: *“Canada’s Complete Film & Media Production House”*
* Subtitle: *“Nationwide Movie Production • Line Production • Post Production • Distribution”*
* CTA Buttons: **[Start Your Project]** & **[View Our Work]**

#### **2. About Us**

Showcases MB Pictures’ mission, values, and operations.

**Mission:**
To produce films, music videos, documentaries, and art projects that inspire audiences, while supporting creators with world-class production and distribution.

**Values:**

* 🎨 Creativity
* 🤝 Integrity
* 🏆 Excellence
* 💡 Innovation

#### **3. Line Production**

Dedicated section describing nationwide production services:

* Location scouting, permits, casting, crew, logistics, budgeting, and on-set supervision.
* Visual: glowing **map of Canada** highlighting production locations.
* Tone: professional and cinematic.

#### **4. Services**

Comprehensive list of services:

* Film Production
* Documentaries
* Music Videos
* Post-Production
* Casting
* Distribution

#### **5. Portfolio / Projects**

Showcase films, shorts, and documentaries with posters and glowing hover effects.

* Categories: **Feature Films**, **Short Films**, **Documentaries**, **Music Videos**, **Art Films**

#### **6. News & Updates**

Dynamic blog section for:

* Ongoing productions
* Film festival selections
* Casting calls
* Behind-the-scenes stories

#### **7. Contact Us**

Company info + interactive form + Google Map embed.

```
📍 125 Barker St, London, Ontario, Canada  
✉️ info@mbpicturescanada.com  
📞 +1 (XXX) XXX-XXXX
```

---

### 🎨 Style Guide

| Element        | Description                                          |
| -------------- | ---------------------------------------------------- |
| **Theme**      | Black background with golden/yellow highlights       |
| **Typography** | Bold cinematic headings + clean sans-serif body text |
| **Visuals**    | Luxurious, cinematic lighting, film-reel textures    |
| **Icons**      | Minimalist, outlined in yellow                       |

---

## 🏗️ Technical Architecture

### ⚙️ Stack

| Layer          | Technology                                                              |
| -------------- | ----------------------------------------------------------------------- |
| **Frontend**   | React + Vite + Tailwind CSS                                             |
| **Backend**    | Node.js + Express.js                                                    |
| **Database**   | PostgreSQL   + cloudinary                                               |
| **Auth**       | JWT-based login (Admin only)                                            |
| **Deployment** | Vercel / Render / Railway / Neon DB                                     |
| **CMS Logic**  | Custom CMS inside admin dashboard controlling frontend content via APIs |

---

### 🧠 Project Structure

```
mbpictures/
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── routes/
│   │   │   ├── cmsRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   └── contentRoutes.js
│   │   ├── controllers/
│   │   ├── models/
│   │   └── middleware/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── user/
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── About.jsx
│   │   │   │   ├── LineProduction.jsx
│   │   │   │   ├── Services.jsx
│   │   │   │   ├── Projects.jsx
│   │   │   │   ├── News.jsx
│   │   │   │   └── Contact.jsx
│   │   │   └── admin/
│   │   │       ├── Login.jsx
│   │   │       ├── Dashboard.jsx
│   │   │       ├── ManageContent.jsx
│   │   │       ├── EditPages.jsx
│   │   │       └── MediaLibrary.jsx
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── assets/
│   │   └── utils/
│   └── package.json
│
├── .env
├── README.md
└── package.json
```

---

### 🔐 Admin CMS Access

* Admin URL: `companyname.com/auth/login`
* After authentication → redirect to `companyname.com/admin`
* Admin can modify:

  * Home text, hero images
  * About, Services, Portfolio data
  * Add/edit blog/news items
  * Upload posters, media, etc.
  * Store image in cloudinary

All data is stored in **PostgreSQL** and served to the frontend through API routes.

---

### 🧩 API Routes Example

```
GET /api/content/home        → Fetch home page content
POST /api/content/home       → Update hero section
GET /api/projects            → Fetch projects data
POST /api/projects           → Add new project
POST /api/auth/login         → Admin authentication
```

---

### 🚀 Setup Instructions

#### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/mbpictures.git
cd mbpictures
```

#### 2️⃣ Install Dependencies

Frontend:

```bash
cd frontend
npm install
```

Backend:

```bash
cd backend
npm install
```

#### 3️⃣ Configure Environment

Create `.env` in `backend/`:

```
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/mbpictures
JWT_SECRET=your_jwt_secret
#Cloudinary for images storage
CLOUDINARY_API_KEY=692761693279597
CLOUDINARY_API_SECRET=WDf1Xhc6tn8xDjxDBMe8iSeMJyM
```

#### 4️⃣ Run Servers

Frontend:

```bash
npm run dev
```

Backend:

```bash
npm run start
```

#### 5️⃣ Build for Production

```bash
npm run build
```

---

### 🧱 Deployment

* **Frontend:** Deploy on **Vercel** or **Netlify**
* **Backend + DB:** Deploy on **Render**, **Railway**, or **NeonDB**
* Setup environment variables for production.

---

### 🧭 Future Enhancements

* 🎞️ Dynamic video player section for projects
* 🧑‍💼 Multi-admin roles & permissions
* 🪄 Drag-and-drop CMS editor
* 🧠 AI-assisted content writing integration (optional)
* 📱 Full mobile responsiveness

---

### 💡 Developer Notes

* Keep admin completely detached from user routes.
* Use Tailwind’s `dark` theme with gold accent for branding.
* Use context or Redux for managing CMS content state.
* All frontend text/images fetched dynamically via backend API.
* Optimize images using Cloudinary or similar CDN.

---

### 🧑‍💻 Author

**MB Pictures Canada Inc.**
Development Team @ [Your Studio or Developer Name]
📧 [info@mbpicturescanada.com](mailto:info@mbpicturescanada.com)
🌍 [www.mbpicturescanada.com](#)

---
