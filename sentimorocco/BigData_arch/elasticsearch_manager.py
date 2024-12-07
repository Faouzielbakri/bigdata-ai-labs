import requests
import json
from requests.auth import HTTPBasicAuth

class ElasticsearchManager:
    def __init__(self, index_name, es_url="https://localhost:9200", username="elastic", password=None, cert_path=None):
        """
        Initialize the Elasticsearch manager with the index name, base URL, authentication, and SSL certificate path.
        """
        self.index_name = index_name
        self.es_url = es_url
        self.auth = HTTPBasicAuth(username, password)
        self.cert_path = cert_path

    def create_index(self, mappings):
        """
        Create an Elasticsearch index with the specified mappings.
        """
        url = f"{self.es_url}/{self.index_name}"
        payload = {
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 1
            },
            "mappings": mappings
        }
        response = requests.put(url, json=payload, auth=self.auth, verify=self.cert_path)
        return response.status_code, response.json()

    def add_document(self, document_id, document):
        """
        Add a new document to the index.
        """
        url = f"{self.es_url}/{self.index_name}/_doc/{document_id}"
        response = requests.post(url, json=document, auth=self.auth, verify=self.cert_path)
        return response.status_code, response.json()

    def get_document(self, document_id):
        """
        Retrieve a document by its ID.
        """
        url = f"{self.es_url}/{self.index_name}/_doc/{document_id}"
        response = requests.get(url, auth=self.auth, verify=self.cert_path)
        return response.status_code, response.json()

    def update_document(self, document_id, new_comments):
        """
        Update an existing document with new comments.
        """
        url = f"{self.es_url}/{self.index_name}/_update/{document_id}"
        payload = {
            "script": {
                "source": """
                    if (ctx._source.comments == null) {
                        ctx._source.comments = params.comments;
                    } else {
                        ctx._source.comments.addAll(params.comments);
                    }
                """,
                "params": {
                    "comments": new_comments
                }
            }
        }
        response = requests.post(url, json=payload, auth=self.auth, verify=self.cert_path)
        return response.status_code, response.json()

    def delete_document(self, document_id):
        """
        Delete a document by its ID.
        """
        url = f"{self.es_url}/{self.index_name}/_doc/{document_id}"
        response = requests.delete(url, auth=self.auth, verify=self.cert_path)
        return response.status_code, response.json()

    def batch_upload(self, articles):
        """
        Batch upload multiple articles to Elasticsearch.
        """
        url = f"{self.es_url}/_bulk"
        bulk_data = ""
        for article in articles:
            action = {
                "index": { "_index": self.index_name, "_id": article["href"] }
            }
            bulk_data += json.dumps(action) + "\n"
            bulk_data += json.dumps(article) + "\n"

        headers = {"Content-Type": "application/x-ndjson"}
        response = requests.post(url, headers=headers, data=bulk_data, auth=self.auth, verify=self.cert_path)
        return response.status_code, response.json()

    def search(self, query):
        """
        Search documents using a query.
        """
        url = f"{self.es_url}/{self.index_name}/_search"
        response = requests.get(url, json={"query": query}, auth=self.auth, verify=self.cert_path)
        return response.status_code, response.json()
