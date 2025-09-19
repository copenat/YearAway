#!/usr/bin/env python3
"""
YearAway Token Generator
Generate member tokens for authentication system
"""

import json
import base64
import secrets
import hashlib
from datetime import datetime, timedelta

class TokenGenerator:
    def __init__(self):
        self.secret_key = "yearaway_secret_2025"  # Change this to something secure
    
    def generate_token(self, member_name="Member", expires_days=365):
        """
        Generate a member token
        
        Args:
            member_name (str): Name of the member
            expires_days (int): Token expiration in days
        
        Returns:
            str: Base64 encoded token
        """
        # Create token payload with unique timestamp
        now = datetime.now()
        payload = {
            "member": member_name,
            "issued": now.isoformat(),
            "exp": int((now + timedelta(days=expires_days)).timestamp()),
            "type": "member_access",
            "unique_id": secrets.token_hex(8)  # Add unique ID to payload
        }
        
        # Create a random component for uniqueness
        random_component = secrets.token_hex(16)
        
        # Combine payload with random component
        token_data = {
            "payload": payload,
            "random": random_component,
            "timestamp": now.timestamp()  # Add timestamp for uniqueness
        }
        
        # Encode as JSON and then base64
        json_data = json.dumps(token_data)
        token = base64.b64encode(json_data.encode()).decode()
        
        return token
    
    def validate_token(self, token):
        """
        Validate a token
        
        Args:
            token (str): Token to validate
        
        Returns:
            dict: Token data if valid, None if invalid
        """
        try:
            # Decode base64
            json_data = base64.b64decode(token.encode()).decode()
            token_data = json.loads(json_data)
            
            # Check expiration
            if token_data["payload"]["exp"] < datetime.now().timestamp():
                return None
            
            return token_data
        except:
            return None
    
    def generate_multiple_tokens(self, count=5):
        """
        Generate multiple tokens for distribution
        
        Args:
            count (int): Number of tokens to generate
        
        Returns:
            list: List of token dictionaries
        """
        tokens = []
        for i in range(count):
            token = self.generate_token(f"Member_{i+1}")
            tokens.append({
                "token": token,
                "member": f"Member_{i+1}",
                "created": datetime.now().isoformat()
            })
        
        return tokens

def main():
    """Main function to generate tokens"""
    print("🔐 YearAway Token Generator")
    print("=" * 40)
    
    generator = TokenGenerator()
    
    # Generate sample tokens
    print("\n📝 Generating sample member tokens...")
    tokens = generator.generate_multiple_tokens(3)
    
    print("\n🎫 Generated Tokens:")
    print("-" * 40)
    
    for i, token_data in enumerate(tokens, 1):
        print(f"\nToken {i}:")
        print(f"Member: {token_data['member']}")
        print(f"Token: {token_data['token']}")
        print(f"Created: {token_data['created']}")
    
    print("\n" + "=" * 40)
    print("💡 Instructions:")
    print("1. Share these tokens with your members")
    print("2. Members enter the token in the login form")
    print("3. Tokens are valid for 1 year")
    print("4. Keep the secret key secure!")
    
    # Save tokens to file
    with open('member_tokens.json', 'w') as f:
        json.dump(tokens, f, indent=2)
    
    print(f"\n💾 Tokens saved to: member_tokens.json")
    
    # Test token validation
    print("\n🧪 Testing token validation...")
    test_token = tokens[0]['token']
    validation = generator.validate_token(test_token)
    
    if validation:
        print("✅ Token validation successful!")
        print(f"   Member: {validation['payload']['member']}")
        print(f"   Expires: {datetime.fromtimestamp(validation['payload']['exp'])}")
    else:
        print("❌ Token validation failed!")

if __name__ == '__main__':
    main()
