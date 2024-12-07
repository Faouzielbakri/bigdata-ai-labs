# SentiMorocco Dashboard

SentiMorocco is a sentiment analysis dashboard designed to provide insights into user comments from **HESPRESS.com**, analyzing trends, engagement metrics, and sentiment breakdowns. Built with **Next.js**, the app connects to **Elasticsearch** and **Kafka** Docker containers for real-time data processing and visualization.

---

## Features

### **Sentiment Analysis**

- Analyze the sentiment distribution for **positive**, **neutral**, and **negative** comments.
- Visualize sentiment trends over time with interactive charts.

### **Engagement Insights**

- Track top-performing articles and comments based on engagement (likes, comments).
- Fetch detailed analytics for individual articles or categories.

### **Keyword Analysis**

- Identify trending keywords from user comments.
- Generate word clouds for top phrases.

### **Real-Time Scraping**

- Scrape live articles and comments from HESPRESS.com for real-time analysis.

---

## Setup Instructions

### **Prerequisites**

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **Docker** to run Kafka and Elasticsearch

### **Installation**

1. Clone the repository:

   ```bash
   git clone https://github.com/username/sentimorocco.git
   cd sentimorocco
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start Docker containers for Kafka and Elasticsearch:

   ```bash
   docker-compose up
   ```

4. Configure `.env.local`:
   Create a `.env.local` file in the root directory:

   ```env
   ELASTICSEARCH_URL=http://localhost:9200
   KAFKA_BROKER=localhost:9092
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open the app in your browser:
   - Default URL: `http://localhost:3000`

---

## API Overview

The app includes RESTful API routes to power the dashboard, such as:

- **Article Analytics**
  - `GET /api/article`: Fetch sentiment breakdown for specific articles.
- **Engagement Insights**

  - `GET /api/engagement/articles`: Retrieve engagement metrics for articles.

- **Sentiment Trends**

  - `GET /api/sentiment/trends`: Fetch historical sentiment trends.

- **Real-Time Scraping**
  - `POST /api/scrape`: Trigger real-time scraping of articles and comments.

---

## Project Highlights

1. **Frontend**:

   - Built with **Next.js** using the App Router.
   - Dynamic pages for article-level analytics, sentiment trends, and engagement insights.
   - Styled with **TailwindCSS** for responsiveness.

2. **Backend**:

   - API routes handle data queries, scraping, and predictions.
   - Integration with **Elasticsearch** for fast querying and real-time insights.
   - Kafka consumers enable real-time comment ingestion.

3. **Key Components**:
   - Interactive charts for sentiment trends and engagement metrics.
   - Real-time search for articles and comments.
   - Custom UI elements for navigation, filtering, and displaying analytics.

---

## Contribution Guidelines

Contributions are welcome! Follow these steps to contribute:

1. Fork this repository.
2. Create a new branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m "Add feature"`.
4. Push your branch: `git push origin feature-name`.
5. Open a pull request.

---

## Screenshots

### **Dashboard Overview**

![Dashboard Overview](screenshots/dashboard-overview.png)

### **Article Analytics**

![Article Analytics](screenshots/article-analytics.png)

### **Sentiment Trends**

![Sentiment Trends](screenshots/sentiment-trends.png)

---

## License

This project is licensed under the **MIT License**. See the LICENSE file for details.

---
