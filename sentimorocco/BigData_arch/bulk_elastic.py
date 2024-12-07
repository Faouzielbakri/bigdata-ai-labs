import json
import requests
from datetime import datetime
from babel.dates import parse_date


def convert_arabic_date_to_iso(arabic_date):
    """
    Convert an Arabic date string to ISO 8601 format by extracting specific parts.
    """
    # Mapping Arabic month names to Gregorian month names
    arabic_to_gregorian = {
        "يناير": "January", "فبراير": "February", "مارس": "March", "أبريل": "April",
        "ماي": "May", "يونيو": "June", "يوليوز": "July", "غشت": "August",
        "شتنبر": "September", "أكتوبر": "October", "نونبر": "November", "دجنبر": "December"
    }

    try:
        # Split the Arabic date string into parts
        parts = arabic_date.split(" ")

        # Extract the relevant parts: day, month, year, and time
        day = parts[1]
        month = arabic_to_gregorian[parts[2]]
        year = parts[3]
        time = parts[5]

        # Construct the formatted string for parsing
        formatted_date = f"{day} {month} {year} {time}"

        # Parse the date into ISO 8601 format
        parsed_date = datetime.strptime(formatted_date, "%d %B %Y %H:%M")
        return parsed_date.isoformat()
    except Exception as e:
        print(f"Error parsing date: {arabic_date} - {e}        : formatted_date = {day} {month} {year} {time}")
        return None

def preprocess_data(file_path):
    """
    Preprocess the JSON data: Convert Arabic dates to ISO 8601.
    """
    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    i =0
    for article in data:
        i+=1
        if "date" in article:
            article["date"] = convert_arabic_date_to_iso(article["date"])
        if "comments" in article:
            for comment in article["comments"]:
                if "date" in comment:
                    comment["date"] = convert_arabic_date_to_iso(comment["date"])
    print(i)
    return data

def split_into_batches(data, batch_size):
    """
    Split data into smaller batches.
    :param data: List of documents to upload
    :param batch_size: Maximum number of documents in each batch
    :return: Generator yielding batches of documents
    """
    for i in range(0, len(data), batch_size):
        yield data[i:i + batch_size]

def upload_bulk_to_elasticsearch(file_path, index_name, es_url, username, password, cert_path, batch_size=1000):
    """
    Upload bulk data to Elasticsearch from a JSON file in smaller batches.

    :param file_path: Path to the JSON file containing the data
    :param index_name: Name of the Elasticsearch index
    :param es_url: URL of the Elasticsearch instance
    :param username: Elasticsearch username (e.g., 'elastic')
    :param password: Elasticsearch password
    :param cert_path: Path to the Elasticsearch SSL certificate
    :param batch_size: Number of documents in each batch
    """

    # Preprocess the data
    data = preprocess_data(file_path)

    url = f"{es_url}/_bulk"

    try:
        # # Read the JSON file
        # with open(file_path, "r", encoding="utf-8") as file:
        #     data = json.load(file)

        # Split data into batches
        batches = split_into_batches(data, batch_size)

        # Upload each batch
        for batch in batches:
            bulk_data = ""
            for article in batch:
                action = {
                    "index": {
                        "_index": index_name,
                        "_id": article["href"]
                    }
                }
                bulk_data += json.dumps(action) + "\n"
                bulk_data += json.dumps(article) + "\n"

            # Make the bulk request
            headers = {"Content-Type": "application/x-ndjson"}
            response = requests.post(
                url,
                headers=headers,
                data=bulk_data,
                auth=(username, password),
                verify=cert_path
            )

            # Check response
            if response.status_code == 200:
                print("Batch upload successful!")
            else:
                print("Batch upload failed!")
                print(response.status_code, response.text)

    except Exception as e:
        print(f"Error during bulk upload: {e}")


# Example usage
if __name__ == "__main__":
    file_path = "hespress_articles_labeled.json"  # Path to the JSON file
    index_name = "hespress_articles"             # Elasticsearch index name
    es_url = "https://localhost:9200"           # Elasticsearch instance URL
    username = "elastic"                        # Elasticsearch username
    password = "lPk3KchtYP0eDG9A2d*Q"
    cert_path = "http_ca.crt"          # Path to SSL certificate

    upload_bulk_to_elasticsearch(file_path, index_name, es_url, username, password, cert_path)
