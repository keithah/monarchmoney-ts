#!/usr/bin/env python3

import asyncio
import sys
sys.path.insert(0, '/home/keith/src/monarchmoney-enhanced')

from monarchmoney import MonarchMoney

async def test_auth():
    print('🐍 Testing Python MonarchMoney Authentication')
    print('==========================================')
    
    mm = MonarchMoney()
    
    try:
        print('Attempting login...')
        await mm.login(
            email='keith@hadm.net',
            password='FQC_rke_hca4ytw*pbk',
            mfa_secret_key='EOHHDCNGER4JTOZYAID5WUCWPFSNBMO4'
        )
        print('✅ Python login successful!')
        
        # Get accounts to verify it works
        print('\nFetching accounts...')
        accounts = await mm.get_accounts()
        print(f'✅ Retrieved {len(accounts)} accounts')
        
        if accounts:
            print('\nAccount details:')
            for i, account in enumerate(accounts[:5]):
                name = account.get('displayName', 'Unknown')
                balance = account.get('currentBalance', 0)
                acc_type = account.get('type', {}).get('name', 'Unknown')
                print(f'  {i+1}. {name}: ${balance:.2f} ({acc_type})')
                
        # Get user info
        print('\nGetting user info...')
        me = await mm.get_me()
        print(f'✅ User: {me.get("email")} - {me.get("name")}')
            
    except Exception as e:
        print(f'❌ Python error: {e}')
        import traceback
        traceback.print_exc()
    finally:
        await mm.close()

if __name__ == '__main__':
    asyncio.run(test_auth())