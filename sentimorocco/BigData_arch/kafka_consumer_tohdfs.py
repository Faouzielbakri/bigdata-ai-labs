"""
Python script to consume Kafka messages, batch posts by category and day,
and write them into predefined folders in HDFS: raw and processed.
Handles delayed or out-of-order articles by tracking independent current dates
and categories.
"""

import json
from typing import Dict, List
from datetime import datetime

from urllib3.util import connection
from hdfs import InsecureClient
from confluent_kafka import Consumer, KafkaError, KafkaException

# HDFS Configuration
NAMENODE_HOST = 'localhost'
NAMENODE_PORT = 9870
NAMENODE_URL = f'http://{NAMENODE_HOST}:{NAMENODE_PORT}'
USER = 'faouzi'
RAW_HDFS_DIR = '/user/faouzi/raw'
PROCESSED_HDFS_DIR = '/user/faouzi/processed'

# Kafka Configuration
KAFKA_BROKER = 'localhost:9092'
RAW_TOPIC = 'hespress-articles'
PROCESSED_TOPIC = 'hespress-articles-processed'
KAFKA_GROUP = 'daily-batch-writers'

# Arabic month mapping
arabic_months = {
    "يناير": "01",
    "فبراير": "02",
    "مارس": "03",
    "أبريل": "04",
    "ماي": "05",
    "يونيو": "06",
    "يوليوز": "07",
    "غشت": "08",
    "شتنبر": "09",
    "أكتوبر": "10",
    "نونبر": "11",
    "دجنبر": "12"
}

# Override DNS entries for containerized HDFS
_orig_create_connection = connection.create_connection


def patched_create_connection(address: tuple, *args, **kwargs):
    hostname, port = address
    if hostname != 'localhost':
        print(f'WARNING: Replacing {hostname} with localhost.')
        hostname = 'localhost'
    return _orig_create_connection((hostname, port), *args, **kwargs)


connection.create_connection = patched_create_connection


def parse_arabic_date(date_str: str) -> str:
    """
    Convert an Arabic date string into a standardized ISO 8601 format (YYYY-MM-DD).
    """
    try:
        parts = date_str.split()
        day = parts[1]
        month_ar = parts[2]
        year = parts[3]
        month = arabic_months.get(month_ar, "01")
        return f"{year}-{month}-{day}"
    except Exception as e:
        print(f"Error parsing date: {e}")
        return None


def write_batch_to_hdfs(client, hdfs_dir, category, batch, batch_date):
    """
    Write a batch of posts to HDFS for a specific day and category.
    """
    if not batch:
        print(f"No articles to write for {hdfs_dir}/{category}. Skipping batch.")
        return

    file_path = f"{hdfs_dir}/{category}/{batch_date}.json"
    try:
        with client.write(file_path, overwrite=True, encoding='utf-8') as writer:
            json.dump(batch, writer, ensure_ascii=False, indent=4)
        print(f"Successfully written batch for {hdfs_dir}/{category} on {batch_date} to HDFS: {file_path}")
    except Exception as e:
        print(f"Error writing batch for {hdfs_dir}/{category} on {batch_date} to HDFS: {e}")


def consume_and_batch_by_category_and_day():
    """
    Consume Kafka messages, batch them by category and day, and write to HDFS.
    """
    consumer_conf = {
        'bootstrap.servers': KAFKA_BROKER,
        'group.id': KAFKA_GROUP,
        'auto.offset.reset': 'earliest',
    }
    consumer = Consumer(consumer_conf)
    consumer.subscribe([RAW_TOPIC, PROCESSED_TOPIC])

    client: InsecureClient = InsecureClient(NAMENODE_URL, user=USER)

    print(f"Subscribed to Kafka topics: {RAW_TOPIC}, {PROCESSED_TOPIC}")

    # Track current dates and batches for each category and folder
    current_dates = {}
    batches = {}

    try:
        while True:
            # Poll for messages from Kafka
            msg = consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    print(f"Reached end of partition for topic {msg.topic()}.")
                    continue
                else:
                    raise KafkaException(msg.error())

            # Parse Kafka message
            kafka_value = msg.value().decode('utf-8')
            article = json.loads(kafka_value)

            # Determine category and date
            category = article.get("category", "unknown").replace("/", "-").replace(" ", "_")
            article_date = parse_arabic_date(article.get("date", ""))
            if not article_date:
                print(f"Skipping article due to invalid date: {article}")
                continue

            # Determine HDFS folder
            hdfs_dir = RAW_HDFS_DIR if msg.topic() == RAW_TOPIC else PROCESSED_HDFS_DIR

            # Initialize tracking for category if not already present
            if category not in current_dates:
                current_dates[category] = None
                batches[category] = []

            # Check if we're processing a new day for the category
            current_date = current_dates[category]
            if current_date and article_date != current_date:
                # Write the batch for the current date and category
                print(f"New day detected for {hdfs_dir}/{category}. Writing batch for {current_date}...")
                write_batch_to_hdfs(client, hdfs_dir, category, batches[category], current_date)

                # Reset the batch for the new day
                batches[category] = []

            # Update the current date for the category and add the article to the batch
            current_dates[category] = article_date
            batches[category].append(article)

    except KeyboardInterrupt:
        print("Kafka Consumer interrupted.")
    except Exception as e:
        print(f"Error during consumption: {e}")
    finally:
        # Write any remaining batches
        for category, batch in batches.items():
            if batch:
                print(f"Finalizing remaining batch for {category} on {current_dates[category]}...")
                hdfs_dir = RAW_HDFS_DIR if msg.topic() == RAW_TOPIC else PROCESSED_HDFS_DIR
                write_batch_to_hdfs(client, hdfs_dir, category, batch, current_dates[category])
        consumer.close()
        print("Kafka Consumer closed.")


if __name__ == "__main__":
    print("Starting Kafka Consumer with batching by category and day...")
    consume_and_batch_by_category_and_day()