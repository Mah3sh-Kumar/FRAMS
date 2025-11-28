import cv2
import face_recognition
import numpy as np
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import requests
import tempfile

# Load environment variables
load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_KEY must be set in .env file")
    exit(1)

# Initialize Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def register_faces():
    print("Starting face registration process...")
    
    try:
        # Fetch all students
        response = supabase.table('students').select('id, user_id, enrollment_number').execute()
        students = response.data
        
        print(f"Found {len(students)} students.")
        
        for student in students:
            user_id = student['user_id']
            enrollment = student['enrollment_number']
            
            print(f"Checking student {enrollment} ({user_id})...")
            
            # Check for reference image in storage
            # Path: face_registrations/{userId}/reference.jpg
            file_path = f"face_registrations/{user_id}/reference.jpg"
            
            try:
                # Get public URL
                url_response = supabase.storage.from('avatars').get_public_url(file_path)
                public_url = url_response
                
                # Verify if file exists by trying to download it
                # Note: get_public_url might return a URL even if file doesn't exist, 
                # so we need to check the response code
                
                img_response = requests.get(public_url)
                
                if img_response.status_code == 200:
                    print(f"  Found reference image for {enrollment}")
                    
                    # Save to temp file
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
                        tmp.write(img_response.content)
                        tmp_path = tmp.name
                    
                    try:
                        # Load image
                        image = face_recognition.load_image_file(tmp_path)
                        
                        # Generate encoding
                        encodings = face_recognition.face_encodings(image)
                        
                        if len(encodings) > 0:
                            encoding = encodings[0]
                            print(f"  Generated face encoding for {enrollment}")
                            
                            # Update database
                            # Convert numpy array to list for JSON serialization
                            encoding_list = encoding.tolist()
                            
                            supabase.table('students').update({
                                'face_encoding': encoding_list
                            }).eq('id', student['id']).execute()
                            
                            print(f"  Updated database for {enrollment}")
                        else:
                            print(f"  No face found in image for {enrollment}")
                            
                    except Exception as e:
                        print(f"  Error processing image for {enrollment}: {e}")
                    finally:
                        os.remove(tmp_path)
                        
                else:
                    print(f"  No reference image found for {enrollment} (Status: {img_response.status_code})")
                    
            except Exception as e:
                print(f"  Error checking storage for {enrollment}: {e}")
                
    except Exception as e:
        print(f"Error fetching students: {e}")

if __name__ == "__main__":
    register_faces()
