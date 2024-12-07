import requests
from bs4 import BeautifulSoup
import json
from collections import defaultdict
from confluent_kafka import Producer
import os

class HespressScraper:
    def __init__(self, base_url, headers, kafka_topic, kafka_conf, save_directory="./scraped_data"):
        """
        Initialize the Hespress Scraper with base configurations and Kafka producer.
        """
        self.base_url = base_url
        self.headers = headers
        self.kafka_topic = kafka_topic
        self.save_directory = save_directory
        self.kafka_producer = Producer(kafka_conf)

        # Ensure the save directory exists
        if not os.path.exists(self.save_directory):
            os.makedirs(self.save_directory)
            print(f"Created directory: {self.save_directory}")

    def extract_articles(self, main_url):
        """
        Extract articles from a given URL.
        """
        try:
            response = requests.get(main_url, headers=self.headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            cards = soup.find_all('div', class_='overlay card')
            articles = []

            for card in cards:
                href = card.find('a', class_='stretched-link')['href'] if card.find('a', class_='stretched-link') else None
                img_url = card.find('img')['src'] if card.find('img') else None
                title = card.find('a', class_='stretched-link')['title'] if card.find('a', class_='stretched-link') else None
                date = card.find('small', class_='text-muted time').text.strip() if card.find('small', class_='text-muted time') else None
                category_span = card.find('span', class_='cat')
                category = category_span.text.strip() if category_span else "unknown"
                category_french = category_span['class'][1] if category_span and len(category_span['class']) > 1 else "unknown"
                category_key = f"{category_french}-{category}"

                articles.append({
                    'href': href,
                    'img_url': img_url,
                    'title': title,
                    'date': date,
                    'category': category_key
                })
            
            return articles
        except Exception as e:
            print(f"Error extracting articles from {main_url}: {e}")
            return []

    def extract_comments(self, article_url):
        """
        Extract comments from a given article URL.
        """
        try:
            response = requests.get(article_url, headers=self.headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            comments_section = soup.find('ul', class_='comment-list')
            if not comments_section:
                return []

            comments = []
            comment_elements = comments_section.find_all('li', class_='comment')
            for comment_element in comment_elements:
                comment_id = comment_element.get('id', None)
                author = comment_element.find('span', class_='fn').text.strip() if comment_element.find('span', class_='fn') else None
                date = comment_element.find('div', class_='comment-date').text.strip() if comment_element.find('div', class_='comment-date') else None
                comment_text = comment_element.find('div', class_='comment-text').text.strip() if comment_element.find('div', class_='comment-text') else None
                likes = comment_element.find('span', class_='comment-recat-number').text.strip() if comment_element.find('span', class_='comment-recat-number') else '0'
                comments.append({
                    'id': comment_id,
                    'author': author,
                    'date': date,
                    'text': comment_text,
                    'likes': likes
                })

            return comments
        except Exception as e:
            print(f"Error extracting comments from {article_url}: {e}")
            return []

    def scrape_all_articles(self, ids, max_pages=50):
        """
        Scrape all articles for the given IDs and send them with their comments to Kafka in real time.
        """
        for id_value in ids:
            print(f"Scraping ID: {id_value}")
            page = 1
            while page <= max_pages:
                print(f"Scraping page {page} for ID {id_value}")
                url = f"{self.base_url}?action=ajax_listing&id={id_value}&paged={page}"
                articles = self.extract_articles(url)

                if not articles:
                    print(f"No more articles found for ID {id_value} on page {page}. Moving to the next ID.")
                    break

                for article in articles:
                    href = article['href']
                    print(f"Fetching comments for article: {article['title']}")
                    article['comments'] = self.extract_comments(href)

                    # Send the article and its comments to Kafka
                    self.send_to_kafka(article)

                page += 1

    def send_to_kafka(self, article):
        """
        Send a single article along with its comments to Kafka.
        """
        try:
            json_data = json.dumps(article)
            self.kafka_producer.produce(self.kafka_topic, value=json_data)
            self.kafka_producer.flush()
            print(f"Sent article to Kafka: {article['title']}")
        except Exception as e:
            print(f"Error sending article to Kafka: {e}")

# Example usage
if __name__ == "__main__":
    headers = {
        'accept': '*/*',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,ar;q=0.7',
        'priority': 'u=1, i',
        'referer': 'https://www.hespress.com',
        'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
        'x-requested-with': 'XMLHttpRequest'
    }
    kafka_conf = {
        'bootstrap.servers': 'localhost:9092',
        'client.id': 'hespress-scraper-producer'
    }
    topic = 'hespress-articles'

    scraper = HespressScraper(base_url="https://www.hespress.com", headers=headers, kafka_topic=topic, kafka_conf=kafka_conf)
    ids_to_scrape = list(range(2, 13))
    scraper.scrape_all_articles(ids_to_scrape)