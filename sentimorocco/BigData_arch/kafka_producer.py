import json
import os
from confluent_kafka import Producer
from hespress import HespressScraper  # Import the HespressScraper class
from llama_classifier import CommentClassifier


# Kafka Configuration
TOPIC = 'hespress-articles'
HOST = 'localhost'
PORT = 9092

# Instantiate the classifier
classifier = CommentClassifier()


producer_conf = {
    'bootstrap.servers': f'{HOST}:{PORT}',
    'client.id': 'hespress-producer'
}
producer = Producer(producer_conf)
print('Kafka Producer initialized:', producer)

# Custom callback for Kafka delivery reports
def delivery_report(err, msg):
    if err is not None:
        print(f"Delivery failed for record {msg.key()}: {err}")
    else:
        print(f"Record successfully produced to {msg.topic()} partition [{msg.partition()}] at offset {msg.offset()}")

# Local JSON file configuration
local_json_file = "hespress_articles.json"

def initialize_local_file(file_path):
    """Initialize or recover a local JSON file."""
    if not os.path.exists(file_path):
        with open(file_path, 'w') as f:
            json.dump([], f)  # Start with an empty list
    else:
        # Check if the file is corrupted
        try:
            with open(file_path, 'r') as f:
                json.load(f)  # Attempt to load the JSON file
        except json.JSONDecodeError:
            print(f"File {file_path} is corrupted. Resetting it.")
            with open(file_path, 'w') as f:
                json.dump([], f)

def read_existing_articles(file_path):
    """Read existing articles from the local JSON file."""
    with open(file_path, 'r') as f:
        return json.load(f)

def append_article_to_file(file_path, article):
    """Append a single article to the local JSON file."""
    with open(file_path, 'r+') as f:
        data = json.load(f)
        data.append(article)
        f.seek(0)
        json.dump(data, f, ensure_ascii=False, indent=2)

# Initialize the HespressScraper
headers = {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,ar;q=0.7',
    'cache-control': 'max-age=0',
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': 'cf_clearance=yjGIgy2A8pkySzbgCqfrdDC76M_Jr4TR8iOY22CstiU-1732827627-1.2.1.1-1x6Djwa_GaRU8jK85583YvZc1e_0mCSDsm1o8364CsOUhS4at9ZkyIMv3dlPN0HVewHzxTJFhXf5Vn7zrCyflyI60.laQweM9VGaM4kzxxLj0vHy0IDZaeWXfYTTHBTEXWjQg2PPeZ4TVss8lqkO8xPs_zzT3HW0yZD7L6qfkPfNUnh4Qdhwu0rTJ98SsnvqvnpgjOMFKSyQGWspiFSMZ.2wsv3CZrJqdRIkpMc09IHEB6W07zqGKZob7PHL9IZtCPSXSeHyWT_emx.fO49sXyyx8NQ0eInkQ5hD4vKvw.B0qeiCnwkEUXo_55EW1OcCyJOqva1cmmxzQbRmAxIxbDnAHig0Lb.hr5UzhTM2bXinOKk._WWX7GxPHT9CgnCT1VghVtwMnR.tK4OcqhmSTIgD97Ey_CQizXArq2uucQJt7y2UEFXrppPxbSzgmTnYBdOsIDx4DaMwJ_Ui6GZe9g',
    'if-modified-since': 'Thu, 28 Nov 2024 21:00:32 GMT',
    'priority': 'u=0, i',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    }

scraper = HespressScraper(base_url="https://www.hespress.com", headers=headers, kafka_topic=TOPIC, kafka_conf=producer_conf)

# Scrape articles and send them to Kafka
def send_articles_to_kafka(scraper, ids_to_scrape):
    """
    Scrape articles and send each article with its comments to Kafka in real-time.
    """
    existing_articles = read_existing_articles(local_json_file)
    existing_titles = {article['title'] for article in existing_articles}

    for id_value in ids_to_scrape:
        print(f"Scraping and sending articles for ID: {id_value}")
        page = 1
        max_pages = 200  # Adjust based on your needs
        while page <= max_pages:
            url = f"{scraper.base_url}?action=ajax_listing&id={id_value}&paged={page}"
            articles = scraper.extract_articles(url)

            if not articles:
                print(f"No articles found for ID {id_value} on page {page}. Moving to the next ID.")
                break

            for article in articles:
                # Skip already processed articles
                if article['title'] in existing_titles:
                    print(f"Article already processed: {article['title']}")
                    continue

                article['comments'] = scraper.extract_comments(article['href'])
                processed_articles = classifier.process_article_comments(article)
                # Serialize the article to JSON
                json_data = json.dumps(processed_articles, ensure_ascii=False)

                producer.produce(
                    TOPIC,
                    value=json_data,
                    callback=delivery_report
                )
                print(f"Sent article to Kafka at {TOPIC}: {article['title']}")

                # Write to local JSON file
                append_article_to_file(local_json_file, json_data)
                print(f"Article written to local file: {article['title']}")

                # Add to existing titles set
                existing_titles.add(article['title'])

            page += 1

    # Ensure all messages are sent
    producer.flush()
    print("All articles have been sent to Kafka.")

# Main execution
if __name__ == "__main__":
    initialize_local_file(local_json_file)
    ids_to_scrape = list(range(2, 14))  # Adjust based on your needs
    send_articles_to_kafka(scraper, ids_to_scrape)