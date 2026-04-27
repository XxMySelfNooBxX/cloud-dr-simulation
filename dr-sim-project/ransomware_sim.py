from google.cloud import storage
import requests
import datetime

# --- CONFIGURATION ---
BUCKET_NAME = "secure-dr-vault-shaurya-2026" 
FILE_NAME = "financial_ledger.csv"
DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1498331002752209037/HbFSebk6sWXMxQVaujvdNvdIceFgseBNt_i1yX4I8vHrylrQPhdLWthJ89xBIf_bXBmf"

def trigger_discord_alert(message):
    """Sends a real-time intrusion alert to your Discord security channel."""
    data = {"content": message}
    try:
        response = requests.post(DISCORD_WEBHOOK_URL, json=data)
        response.raise_for_status()
        print("🚨 Intrusion alert transmitted to Discord successfully!")
    except Exception as e:
        print(f"⚠️ Failed to send Discord alert: {e}")

def simulate_ransomware_attack():
    """Overwrites the healthy file with 'encrypted' garbage data."""
    print(f"Initiating simulated attack on {BUCKET_NAME}/{FILE_NAME}...")
    
    # Initialize the GCS client
    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(FILE_NAME)

    # 1. 'Encrypt' the data (overwrite it with a ransom note)
    attack_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    corrupted_data = f"!!! YOUR FILES HAVE BEEN COMPROMISED AND ENCRYPTED BY RANSOMWARE !!!\n" \
                     f"Attack Time: {attack_time}\n" \
                     f"All original data has been overwritten. Pay 1 BTC to recover."

    # 2. Upload the corrupted data over the original file
    print("Overwriting target file...")
    blob.upload_from_string(corrupted_data, content_type="text/plain")
    
    # Get the new generation ID
    blob.reload()
    print(f"💥 Attack successful! File overwritten. Malicious Generation ID: {blob.generation}")

    # 3. Trigger the Intrusion Alert to Discord
    alert_msg = f"🚨 **CRITICAL SECURITY ALERT: RANSOMWARE ACTIVITY DETECTED** 🚨\n" \
                f"Unauthorized modification detected on `{FILE_NAME}` in cloud storage bucket `{BUCKET_NAME}`!\n" \
                f"**Action Required:** Initiate Incident Response and rollback to previous clean version immediately."
    trigger_discord_alert(alert_msg)

if __name__ == "__main__":
    simulate_ransomware_attack()