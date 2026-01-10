import json
from pathlib import Path
import os

# Always resolve the dataset path relative to this file so that it works
# no matter where the application is started from (repo root, service dir, etc.)
BASE_DIR = Path(__file__).resolve().parent.parent  # points to ml-backend-with-image/
DATA_FILE = BASE_DIR / "data" / "dataset.jsonl"

# Ensure data directory exists and log path on module load
try:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    print(f"[INIT] Dataset file path: {DATA_FILE.absolute()}")
    print(f"[INIT] Dataset file exists: {DATA_FILE.exists()}")
    print(f"[INIT] Dataset directory writable: {os.access(DATA_FILE.parent, os.W_OK)}")
except Exception as e:
    print(f"[ERROR] Failed to create data directory: {str(e)}")


def save_report(report_dict: dict):
    """Append raw report to dataset.jsonl (build dataset dynamically)."""
    try:
        # Ensure directory exists
        DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        
        # Get absolute path for logging
        abs_path = DATA_FILE.absolute()
        
        # Clean report_dict - remove non-serializable data
        clean_report = {}
        for key, value in report_dict.items():
            # Skip image_bytes (can't serialize bytes to JSON)
            if key == "image_bytes":
                continue
            # Convert any other non-serializable types
            try:
                json.dumps(value)  # Test if serializable
                clean_report[key] = value
            except (TypeError, ValueError):
                # If not serializable, convert to string representation
                clean_report[key] = str(value)
                print(f"[WARNING] Converted non-serializable value for key '{key}' to string")
        
        # Write to file
        with DATA_FILE.open("a", encoding="utf8") as f:
            json_str = json.dumps(clean_report, ensure_ascii=False)
            f.write(json_str + "\n")
            f.flush()  # Force write to disk
            os.fsync(f.fileno())  # Ensure data is written to disk
        
        # Verify file was written
        if DATA_FILE.exists():
            file_size = DATA_FILE.stat().st_size
            print(f"[DEBUG] Report saved to dataset: {clean_report.get('report_id', 'unknown')}")
            print(f"[DEBUG] Dataset file: {abs_path} (size: {file_size} bytes)")
            print(f"[DEBUG] Report status: {clean_report.get('status', 'unknown')}, accept: {clean_report.get('accept', 'unknown')}")
        else:
            print(f"[ERROR] Dataset file does not exist after write: {abs_path}")
        
    except PermissionError as e:
        print(f"[ERROR] Permission denied writing to dataset file: {str(e)}")
        print(f"[ERROR] File path: {DATA_FILE.absolute()}")
        print(f"[ERROR] Directory writable: {os.access(DATA_FILE.parent, os.W_OK)}")
        raise
    except Exception as e:
        print(f"[ERROR] Failed to save report to dataset: {str(e)}")
        print(f"[ERROR] File path: {DATA_FILE.absolute()}")
        print(f"[ERROR] Report data keys: {list(report_dict.keys())}")
        print(f"[ERROR] Report ID: {report_dict.get('report_id', 'unknown')}")
        import traceback
        print(traceback.format_exc())
        raise


def remove_report(report_id: str = None, description: str = None, user_id: str = None):
    """
    Remove a report from dataset.jsonl by report_id, or by description/user_id as fallback.
    Returns True if removed, False if not found.
    """
    try:
        if not DATA_FILE.exists():
            print(f"[WARNING] Dataset file does not exist: {DATA_FILE.absolute()}")
            return False
        
        # Read all lines
        lines = []
        removed = False
        removed_report = None
        
        with DATA_FILE.open("r", encoding="utf8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    report = json.loads(line)
                    should_remove = False
                    
                    # Method 1: Match by report_id (primary method)
                    if report_id and report.get("report_id") == report_id:
                        should_remove = True
                        print(f"[DEBUG] Removing report from dataset by report_id: {report_id}")
                    
                    # Method 2: Fallback - match by description and user_id
                    elif description and user_id:
                        report_desc = (report.get("description") or "").strip().lower()
                        report_user_id = (report.get("user_id") or "").strip()
                        search_desc = description.strip().lower()
                        search_user_id = user_id.strip()
                        
                        # Normalize descriptions for comparison (remove extra whitespace)
                        report_desc_normalized = " ".join(report_desc.split())
                        search_desc_normalized = " ".join(search_desc.split())
                        
                        if (report_desc_normalized == search_desc_normalized and 
                            report_user_id == search_user_id):
                            should_remove = True
                            print(f"[DEBUG] Removing report from dataset by description/user_id match")
                            print(f"[DEBUG] Matched description: {report_desc_normalized[:50]}...")
                            print(f"[DEBUG] Matched user_id: {report_user_id}")
                    
                    if should_remove:
                        removed = True
                        removed_report = report
                        continue  # Skip this line (don't add to lines)
                    
                    lines.append(line)
                except json.JSONDecodeError:
                    # Keep invalid JSON lines (don't lose data)
                    lines.append(line)
                    continue
        
        # Write back all lines except the removed one
        if removed:
            with DATA_FILE.open("w", encoding="utf8") as f:
                for line in lines:
                    f.write(line + "\n")
                f.flush()
                os.fsync(f.fileno())
            
            removed_id = removed_report.get("report_id") if removed_report else "unknown"
            print(f"[DEBUG] ✅ Successfully removed report from dataset: report_id={removed_id}")
            return True
        else:
            if report_id:
                print(f"[WARNING] Report not found in dataset: report_id={report_id}")
            elif description and user_id:
                print(f"[WARNING] Report not found in dataset by description/user_id")
            return False
        
    except PermissionError as e:
        print(f"[ERROR] Permission denied modifying dataset file: {str(e)}")
        print(f"[ERROR] File path: {DATA_FILE.absolute()}")
        raise
    except Exception as e:
        print(f"[ERROR] Failed to remove report from dataset: {str(e)}")
        print(f"[ERROR] Report ID: {report_id}")
        import traceback
        print(traceback.format_exc())
        raise
