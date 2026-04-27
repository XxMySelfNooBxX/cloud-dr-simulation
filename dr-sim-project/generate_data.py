from google.cloud import storage
import datetime

# --- CONFIGURATION ---
# Replace this with your actual bucket name!
BUCKET_NAME = "secure-dr-vault-shaurya-2026"
FILE_NAME = "financial_ledger.csv"

def upload_healthy_file():
    """Generates a healthy file and uploads it to the GCS bucket."""
    print(f"Connecting to bucket: {BUCKET_NAME}...")
    
    # Initialize the GCS client
    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(FILE_NAME)

    # Generate some 'healthy' dummy data with a timestamp
    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    healthy_data = f"TRANSACTION_ID,AMOUNT,STATUS,TIMESTAMP\n" \
                   f"TXN-88291,$10500.00,CLEARED,{current_time}\n" \
                   f"TXN-88292,$420.50,PENDING,{current_time}\n"
    
    # Upload the string as a file
    print(f"Uploading healthy data to {FILE_NAME}...")
    blob.upload_from_string(healthy_data, content_type="text/csv")
    
    # Get the specific generation (version) number we just created
    blob.reload()
    print(f"✅ Success! Uploaded healthy version. Generation ID: {blob.generation}")

if __name__ == "__main__":
    upload_healthy_file()