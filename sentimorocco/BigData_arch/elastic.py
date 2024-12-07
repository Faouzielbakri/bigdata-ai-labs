from elasticsearch_manager import ElasticsearchManager

# Initialize ElasticsearchManager
es_manager = ElasticsearchManager(
    index_name="hespress_articles",
    es_url="https://localhost:9200",
    username="elastic",
    password="lPk3KchtYP0eDG9A2d*Q",
    cert_path="http_ca.crt"
)

# Define mappings
mappings = {
    "properties": {
        "href": { "type": "keyword" },  # Exact matches, ideal for unique IDs or URLs
        "img_url": { "type": "keyword" },  # Same for image URLs
        "title": { "type": "text", "analyzer": "standard" },  # Full-text search
        "date": { 
            "type": "date",
            "format": "yyyy-MM-dd'T'HH:mm:ss||yyyy-MM-dd||epoch_millis"  # Supports ISO 8601
        },
        "category": { "type": "keyword" },  # Exact matches, not analyzed
        "comments": {
            "type": "nested",  # Nested type to allow sub-document queries
            "properties": {
                "id": { "type": "keyword" },  # Unique comment ID
                "author": { "type": "text", "analyzer": "standard" },  # Full-text search for author names
                "date": { 
                    "type": "date",
                    "format": "yyyy-MM-dd'T'HH:mm:ss||yyyy-MM-dd||epoch_millis"  # Consistent date format
                },
                "text": { "type": "text", "analyzer": "standard" },  # Full-text search for comments
                "likes": { "type": "integer" },  # Ensure likes are numeric
                "label": { "type": "keyword" }  # Exact match for sentiment labels
            }
        }
    }
}

# Create the index
status, response = es_manager.create_index(mappings)
print(f"Index creation status: {status}")
print(f"Response: {response}")
