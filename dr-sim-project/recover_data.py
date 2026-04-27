from google.cloud import storage

# --- CONFIGURATION ---
BUCKET_NAME = "secure-dr-vault-shaurya-2026"
FILE_NAME = "financial_ledger.csv"

def recover_file():
    """Restores the most recent healthy version of a file using heuristic size analysis."""
    print(f"Initiating Advanced Incident Response for {BUCKET_NAME}/{FILE_NAME}...\n")
    
    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)

    # 1. List and sort all versions
    blobs = bucket.list_blobs(versions=True, prefix=FILE_NAME)
    versions = list(blobs)
    versions.sort(key=lambda x: x.generation, reverse=True)

    if len(versions) < 2:
        print("⚠️ Not enough historical data to perform a restore.")
        return

    print("[ Forensic Version Log ]")
    target_blob = None
    
    # 2. Heuristic Scan: Look for the first file smaller than 150 bytes
    for idx, v in enumerate(versions):
        status = "LIVE" if idx == 0 else "NONCURRENT"
        
        if idx == 0:
            print(f"[{idx}] Gen: {v.generation} | Size: {v.size}B | Status: {status} (Corrupted)")
            continue

        # Our healthy file is ~133B, Ransomware is ~163B. 
        if v.size < 150: 
            print(f"[{idx}] Gen: {v.generation} | Size: {v.size}B | Status: {status} 🟢 CLEAN BACKUP FOUND")
            target_blob = v
            break # Stop looking once we find the newest healthy file
        else:
            print(f"[{idx}] Gen: {v.generation} | Size: {v.size}B | Status: {status} 🔴 SKIPPING (Corrupted)")

    # 3. Execute the Restore
    if target_blob:
        print(f"\nTargeting Generation {target_blob.generation} for recovery...")
        bucket.copy_blob(target_blob, bucket, FILE_NAME, source_generation=target_blob.generation)
        print("✅ System Restored! The file has been successfully rolled back to its healthy state.")
    else:
        print("\n❌ CRITICAL: No healthy backups found in the version history! Data may be lost.")

if __name__ == "__main__":
    recover_file()