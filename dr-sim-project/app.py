from flask import Flask, jsonify
from flask_cors import CORS
from google.cloud import storage
import subprocess
import sys

app = Flask(__name__)
CORS(app)

@app.route('/attack', methods=['POST'])
def trigger_attack():
    print("API: Received attack command from React UI...")
    subprocess.run([sys.executable, "ransomware_sim.py"])
    return jsonify({"status": "success", "message": "Payload delivered."})

@app.route('/recover', methods=['POST'])
def trigger_recovery():
    print("API: Received recovery command from React UI...")
    subprocess.run([sys.executable, "recover_data.py"])
    return jsonify({"status": "success", "message": "System restored."})

@app.route('/status', methods=['GET'])
def check_status():
    try:
        # Re-importing here just in case!
        from google.cloud import storage 
        client = storage.Client()
        bucket = client.bucket("secure-dr-vault-shaurya-2026")
        blob = bucket.get_blob("financial_ledger.csv")
        
        if blob is not None:
            # Force the blob to fetch the latest data from the cloud
            blob.reload()
            size = blob.size
            if size == 133:
                return jsonify({"status": "healthy", "size": size})
            else:
                return jsonify({"status": "compromised", "size": size})
        else:
            return jsonify({"status": "compromised", "size": 0})
            
    except Exception as e:
        # If it crashes, print the EXACT reason to the terminal
        print(f"\n❌ STATUS CHECK CRASHED: {str(e)}\n")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/lifecycle', methods=['POST'])
def update_lifecycle():
    try:
        from google.cloud import storage
        from datetime import datetime, timezone, timedelta
        
        client = storage.Client()
        bucket = client.bucket("secure-dr-vault-shaurya-2026")
        
        # Enterprise Note: Native GCP Lifecycle rules require a minimum of 1 Day.
        # For this demo, we run a custom active-purge script for a 30-minute window.
        
        blobs = bucket.list_blobs(versions=True)
        now = datetime.now(timezone.utc)
        deleted_count = 0
        
        for blob in blobs:
            # In GCP, 'time_deleted' is only populated if the version is non-current.
            # This ensures we NEVER delete the live file.
            if blob.time_deleted is not None:
                age = now - blob.time_deleted
                # If the corrupted version is older than 30 minutes, permanently destroy it
                if age > timedelta(minutes=30):
                    blob.delete()
                    deleted_count += 1
        
        print(f"Aggressive Purge Complete. Removed {deleted_count} old versions.")
        return jsonify({"status": "success", "message": f"Purged {deleted_count} versions older than 30 mins."})
        
    except Exception as e:
        print(f"Lifecycle error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    print("🛡️ Security API is online and listening on Port 5001...")
    # Debug mode is ON so it auto-reloads and shows errors
    app.run(port=5001, debug=True)