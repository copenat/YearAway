#!/usr/bin/env python3
"""
Simple YearAway Token Generator
Generate easy-to-distinguish member tokens
"""

import secrets
import string
from datetime import datetime, timedelta

class SimpleTokenGenerator:
    def __init__(self):
        self.prefix = "YEARAWAY"
    
    def generate_simple_token(self, member_name="Member"):
        """
        Generate a simple, visually distinct token
        
        Args:
            member_name (str): Name of the member
        
        Returns:
            str: Simple token in format YEARAWAY-XXXX-XXXX-XXXX
        """
        # Generate 3 groups of 4 random characters
        token_parts = []
        for _ in range(3):
            # Use uppercase letters and numbers
            part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(4))
            token_parts.append(part)
        
        # Create token with prefix
        token = f"{self.prefix}-{'-'.join(token_parts)}"
        
        return token
    
    def generate_multiple_tokens(self, count=5):
        """
        Generate multiple simple tokens
        
        Args:
            count (int): Number of tokens to generate
        
        Returns:
            list: List of token dictionaries
        """
        tokens = []
        for i in range(count):
            token = self.generate_simple_token(f"Member_{i+1}")
            tokens.append({
                "token": token,
                "member": f"Member_{i+1}",
                "created": datetime.now().isoformat(),
                "expires": (datetime.now() + timedelta(days=365)).isoformat()
            })
        
        return tokens

def main():
    """Main function to generate simple tokens"""
    print("🔐 YearAway Simple Token Generator")
    print("=" * 50)
    
    generator = SimpleTokenGenerator()
    
    # Generate sample tokens
    print("\n📝 Generating simple member tokens...")
    tokens = generator.generate_multiple_tokens(5)
    
    print("\n🎫 Generated Tokens:")
    print("-" * 50)
    
    for i, token_data in enumerate(tokens, 1):
        print(f"\nToken {i}:")
        print(f"Member: {token_data['member']}")
        print(f"Token: {token_data['token']}")
        print(f"Created: {token_data['created']}")
        print(f"Expires: {token_data['expires']}")
    
    print("\n" + "=" * 50)
    print("💡 Instructions:")
    print("1. Share these tokens with your members")
    print("2. Members enter the token in the login form")
    print("3. Tokens are valid for 1 year")
    print("4. Each token is visually distinct and easy to share")
    
    # Save tokens to file
    import json
    with open('simple_member_tokens.json', 'w') as f:
        json.dump(tokens, f, indent=2)
    
    print(f"\n💾 Tokens saved to: simple_member_tokens.json")
    
    # Show example usage
    print("\n🧪 Example Usage:")
    print("Member enters: YEARAWAY-A1B2-C3D4-E5F6")
    print("System validates and grants access to member-only content")

if __name__ == '__main__':
    main()
