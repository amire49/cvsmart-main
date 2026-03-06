import os
import jwt
from functools import wraps
from flask import request, jsonify
import requests

SUPABASE_URL = 'https://jcxahlzszwvmvmzsbnwv.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjeGFobHpzend2bXZtenNibnd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNDc3MDksImV4cCI6MjA2MjcyMzcwOX0.zUcZB8qL5_CGKXWMww41od0tb3ImqwSgxqxSgz--jxI'
SUPABASR_JWT_SECRET = 'gb7v9qEc1CcJ2R+k01KV/zDluWgmK5GKp5YCC+63lW0NPC5rvkRvTZTC6QC4i3abNXTaNe7Uyv7CLi84YiPiuA=='

def get_jwt_secret():
    if not SUPABASR_JWT_SECRET:
        response = request.get(
        f"{SUPABASE_URL}/url/v1/jwt/secret",
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}'
        }
        )
        if response.status_code == 200:
            return response.json().get('jwt_secret')
        else:
            raise Exception("Failed to fetch JWT secret from Supabase")
    return SUPABASR_JWT_SECRET

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({"error": "Authorization header is expected"}), 401
        try:
            # Extract the token from the header
            token = auth_header.split(" ")[1]
            
            # Verify the token
            payload = jwt.decode(
                token,
                get_jwt_secret(),
                algorithms=["HS256"],
                options={"verify_signature": True}
            )
            
            # Add user info to request
            request.user = payload.get('sub')
            request.user_email = payload.get('email')
            
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        except Exception as e:
            return jsonify({"error": str(e)}), 401
        
        return f(*args, **kwargs)
    
    return decorated
    