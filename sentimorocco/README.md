# SentiMorocco Dashboard

SentiMorocco is a sentiment analysis dashboard designed to analyze user comments from **HESPRESS.com**, providing real-time insights into public opinion through sentiment trends, engagement metrics, and sentiment breakdowns. The app connects to **Elasticsearch** and **Kafka** Docker containers for real-time data integration, while the Next.js framework powers its frontend and backend.

---

## Features

### **Dashboard Overview**

- Total comments analyzed, with percentage growth from previous periods.
- Sentiment distribution across **positive**, **neutral**, and **negative** classes.
- Recent comments categorized by sentiment, user engagement (likes), and timestamps.

### **Analytics Feed**

- Analyze sentiment for specific articles by entering a URL or article title.
- Visual breakdown of:
  - Sentiment trends over time.
  - Top keywords from comments.
  - Engagement metrics (likes, comments).

### **Trends**

- Historical sentiment trends visualized through line charts (monthly or yearly views).
- Top articles ranked by engagement and sentiment distribution.

### **Model Insights**

- Displays model performance metrics such as accuracy and F1-scores.
- Highlights class-specific challenges (e.g., struggles with neutral sentiment).

---

## Setup Instructions

### **Prerequisites**

- Install **Node.js** and **npm** (or yarn).
- Install **Docker** to run Kafka and Elasticsearch containers.

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

   - Navigate to the Docker setup directory and start containers:
     ```bash
     docker-compose up
     ```
   - This will spin up:
     - **Elasticsearch**: Used for querying processed sentiment data.
     - **Kafka**: Handles real-time comment ingestion.

4. Configure `.env.local`:
   Create a `.env.local` file in the root of your project and add:

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

## API Routes

Next.js API routes located in `pages/api` connect the frontend to Kafka and Elasticsearch containers. Key API routes include:

- **GET /api/sentiments**
  - Retrieves sentiment breakdown for a specific article or time range.
- **GET /api/trends**
  - Fetches sentiment trends over time.
- **POST /api/comments**
  - Submits new comments for real-time analysis.

---

## Dependencies

### Core Frameworks and Libraries:

- **Next.js**: Framework for frontend and backend integration.
- **KafkaJS**: Used to connect the API routes to Kafka for real-time data ingestion.
- **Elasticsearch Client**: Queries Elasticsearch to fetch pre-processed sentiment data.
- **TailwindCSS**: Responsive styling for UI components.

### Data Integrations:

- **Elasticsearch**: Stores processed comment data for fast analytics and querying.
- **Kafka**: Powers real-time data ingestion pipelines.

---

## Project Structure

The application is structured as follows:

```
├── components
│   ├── Dashboard.js          # Main dashboard component
│   ├── SentimentTrends.js    # Visualizations for trends
│   └── ArticleAnalytics.js   # Analytics feed component
├── pages
│   ├── index.js              # Main dashboard page
│   ├── api                   # API routes to connect Kafka and Elasticsearch
│   │   ├── sentiments.js
│   │   └── trends.js
├── public
│   ├── images                # Static assets
└── utils
    ├── elasticClient.js      # Elasticsearch configuration
    ├── kafkaClient.js        # Kafka client setup
```

---

## Usage Instructions

1. **Search for Articles**:

   - Enter an article URL or title to retrieve its sentiment breakdown and engagement data.

2. **Explore Trends**:

   - View sentiment trends across months, including top-performing articles.

3. **Monitor Model Insights**:
   - Access details about the model's accuracy, precision, recall, and F1-scores for each sentiment class.

---

## Contribution Guidelines

Contributions are welcome! To contribute:

1. Fork this repository.
2. Create a new branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m "Add feature"`.
4. Push to your branch: `git push origin feature-name`.
5. Open a pull request.

---

## Screenshots

### **Dashboard Overview**

![Dashboard Overview](hespress-dashboard.jpg)

### **Article Analytics**

![Article Analytics](hespress-article.jpg)

### **Sentiment Trends**

![Sentiment Trends](hespress-top.jpg)

---

## Known Issues

- Neutral class struggles with misclassification due to overlapping features with negative and positive sentiments.
- Some API calls may require rate-limiting optimizations for high-traffic scenarios.

---

## License

This project is licensed under the **MIT License**. See the LICENSE file for details.

---
