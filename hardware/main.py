import cv2
import face_recognition
import numpy as np
import os
from supabase import create_client, Client
from datetime import datetime
import time
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
DEVICE_ID = os.getenv("DEVICE_ID", "RPI_CLASSROOM_1")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_KEY must be set in .env file")
    exit(1)

# Initialize Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Global variables
known_face_encodings = []
known_face_ids = []
known_face_names = []

def load_known_faces():
    """Fetch student face encodings from Supabase"""
    global known_face_encodings, known_face_ids, known_face_names
    
    print("Loading known faces from database...")
    try:
        # Fetch students with face_encoding
        response = supabase.table('students').select('id, enrollment_number, face_encoding').execute()
        students = response.data
        
        known_face_encodings = []
        known_face_ids = []
        known_face_names = []
        
        for student in students:
            if student['face_encoding']:
                # Assuming face_encoding is stored as a list/array in JSONB
                encoding = np.array(student['face_encoding'])
                known_face_encodings.append(encoding)
                known_face_ids.append(student['id'])
                known_face_names.append(student['enrollment_number'])
                
        print(f"Loaded {len(known_face_encodings)} faces.")
    except Exception as e:
        print(f"Error loading faces: {e}")

def mark_attendance(student_id):
    """Send attendance record to Supabase"""
    try:
        # Check if already marked today for this subject (simplified: just check date)
        today = datetime.now().strftime('%Y-%m-%d')
        
        # In a real scenario, we would determine the current subject based on time/timetable
        # For now, we'll leave subject_id null or fetch a default one
        
        # Check duplicate
        response = supabase.table('attendance').select('*').eq('student_id', student_id).eq('date', today).execute()
        
        if len(response.data) == 0:
            print(f"Marking attendance for {student_id}")
            data = {
                'student_id': student_id,
                'date': today,
                'status': 'present',
                'timestamp': datetime.now().isoformat(),
                'device_id': DEVICE_ID
            }
            supabase.table('attendance').insert(data).execute()
            print("Attendance marked successfully.")
        else:
            print(f"Attendance already marked for {student_id} today.")
            
    except Exception as e:
        print(f"Error marking attendance: {e}")

def main():
    load_known_faces()
    
    video_capture = cv2.VideoCapture(0)
    
    if not video_capture.isOpened():
        print("Error: Could not open video device.")
        return

    print("Starting Face Recognition Loop...")
    
    process_this_frame = True
    
    while True:
        ret, frame = video_capture.read()
        if not ret:
            break
            
        # Resize frame of video to 1/4 size for faster face recognition processing
        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        
        # Convert the image from BGR color (which OpenCV uses) to RGB color (which face_recognition uses)
        rgb_small_frame = small_frame[:, :, ::-1]
        
        if process_this_frame:
            # Find all the faces and face encodings in the current frame of video
            face_locations = face_recognition.face_locations(rgb_small_frame)
            face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
            
            face_names = []
            for face_encoding in face_encodings:
                # See if the face is a match for the known face(s)
                matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
                name = "Unknown"
                student_id = None

                # Or instead, use the known face with the smallest distance to the new face
                face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
                if len(face_distances) > 0:
                    best_match_index = np.argmin(face_distances)
                    if matches[best_match_index]:
                        name = known_face_names[best_match_index]
                        student_id = known_face_ids[best_match_index]
                        
                        # Mark attendance
                        mark_attendance(student_id)

                face_names.append(name)
                
        process_this_frame = not process_this_frame
        
        # Display the results
        for (top, right, bottom, left), name in zip(face_locations, face_names):
            # Scale back up face locations since the frame we detected in was scaled to 1/4 size
            top *= 4
            right *= 4
            bottom *= 4
            left *= 4
            
            # Draw a box around the face
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)
            
            # Draw a label with a name below the face
            cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 0, 255), cv2.FILLED)
            font = cv2.FONT_HERSHEY_DUPLEX
            cv2.putText(frame, name, (left + 6, bottom - 6), font, 1.0, (255, 255, 255), 1)
            
        # Display the resulting image
        cv2.imshow('Video', frame)
        
        # Hit 'q' on the keyboard to quit!
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
    video_capture.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
