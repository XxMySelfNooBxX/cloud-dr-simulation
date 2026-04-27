from flask import Flask, jsonify
from flask_cors import CORS
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

if __name__ == '__main__':
    print("🛡️ Security API is online and listening on Port 5001...")
    app.run(port=5001)