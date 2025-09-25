#!/usr/bin/env python3

import asyncio
import sys
import os
from dotenv import load_dotenv
sys.path.append('/home/keith/src/monarchmoney-enhanced')

# Load environment variables from the TypeScript project's .env file
load_dotenv('/home/keith/src/monarchmoney-ts/.env')

from monarchmoney import MonarchMoney

async def test_python_auth():
    print("🐍 Testing Python MonarchMoney Library")
    print("=====================================")
    
    mm = MonarchMoney()
    
    try:
        email = os.getenv('MONARCH_EMAIL')
        password = os.getenv('MONARCH_PASSWORD')
        mfa_secret = os.getenv('MONARCH_MFA_SECRET')
        
        print(f"📧 Email: {email}")
        print(f"🔒 Has MFA Secret: {bool(mfa_secret)}")
        
        print("\n🚀 Attempting login...")
        await mm.login(
            email=email,
            password=password,
            mfa_secret_key=mfa_secret,
            save_session=False
        )
        
        print("✅ Python library login successful!")
        
        # Get user profile
        me = await mm.get_me()
        print(f"👤 User: {me['email']}")
        
        # Get accounts
        accounts = await mm.get_accounts()
        print(f"🏦 Accounts: {len(accounts)}")
        
    except Exception as e:
        print(f"❌ Python library failed: {e}")
        print(f"Error type: {type(e).__name__}")

if __name__ == "__main__":
    asyncio.run(test_python_auth())