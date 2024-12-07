"""
Kafka script acting as both consumer and producer.
Consumes articles, analyzes comments, and produces enriched articles to `hespress-articles-processed`.
"""

import json
import sys
import os
from typing import Dict
from confluent_kafka import Consumer, Producer, KafkaException
from llama_classifier import CommentClassifier
from elasticsearch_manager import ElasticsearchManager 
# Kafka Configuration
KAFKA_BROKER: str = 'localhost:9092'
CONSUMER_TOPIC: str = 'hespress-articles'
PRODUCER_TOPIC: str = 'hespress-articles-processed'  # Updated topic for enriched articles
KAFKA_GROUP: str = 'enrichment-group'

# Initialize Kafka Producer
producer_conf = {'bootstrap.servers': KAFKA_BROKER}
producer = Producer(producer_conf)

# Initialize Kafka Consumer
consumer_conf = {
    'bootstrap.servers': KAFKA_BROKER,
    'group.id': KAFKA_GROUP,
    'auto.offset.reset': 'earliest',
}
consumer = Consumer(consumer_conf)

# Instantiate the classifier
classifier = CommentClassifier()


# Local JSON file configuration
local_json_file = "hespress_articles.json"

def append_article_to_file(file_path, article):
    """Append a single article to the local JSON file."""
    with open(file_path, 'r+') as f:
        data = json.load(f)
        data.append(article)
        f.seek(0)
        json.dump(data, f, ensure_ascii=False, indent=2)


def consume_and_produce():
    """
    Consume articles from Kafka, enrich them with sentiment analysis, and produce to another Kafka topic.
    """
    consumer.subscribe([CONSUMER_TOPIC])
    print(f"Subscribed to Kafka topic: {CONSUMER_TOPIC}")

    try:
        while True:
            # Poll for messages from Kafka
            msg = consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaException._PARTITION_EOF:
                    print(f"Reached end of partition for topic {msg.topic()}.")
                    continue
                else:
                    raise KafkaException(msg.error())

            # Parse the Kafka message
            kafka_value = msg.value().decode('utf-8')
            article = json.loads(kafka_value)
            print(f"Received article: {article['title']}")

            # Analyze comments and enrich the article
            new_labeled_article =  classifier.process_article_comments(article)

            # Serialize the enriched article to JSON
            enriched_data = json.dumps(new_labeled_article, ensure_ascii=False)
            
            ElasticsearchManager.add_document(enriched_data['href'],enriched_data)
            # Write to local JSON file
            append_article_to_file(local_json_file, new_labeled_article)
            # Produce enriched article to Kafka
            # producer.produce(PRODUCER_TOPIC, value=enriched_data)
            print(f"Produced enriched article to topic: {PRODUCER_TOPIC}")

            # Ensure delivery
            producer.flush()

    except KeyboardInterrupt:
        print("Kafka Consumer/Producer interrupted.")
    finally:
        consumer.close()
        print("Kafka Consumer/Producer closed.")


if __name__ == "__main__":
    print("Starting Kafka Consumer and Producer...")
    consume_and_produce()