import requests, json, sys

BASE='http://127.0.0.1:3010'
LOGIN={'email':'admin@proquelec.sn','password':'Password123!'}

print('Logging in...')
resp=requests.post(BASE+'/api/auth/login',json=LOGIN)
print('LOGIN',resp.status_code)
try:
    token=resp.json().get('access_token')
except Exception as e:
    print('LOGIN BODY',resp.text)
    sys.exit(1)
if not token:
    print('No token returned')
    sys.exit(1)
headers={'Authorization':'Bearer '+token}

# Create page
page={'title':'Automated test page','slug':'automated-test-page-2026-05-31','content':'<p>automated</p>','is_published':False}
print('\nCreating page...')
resp2=requests.post(BASE+'/api/pages',json=page,headers={**headers,'Content-Type':'application/json'})
print('POST /api/pages',resp2.status_code)
print(resp2.text)

# Upload file
print('\nUploading file...')
files={'file':('test.txt',b'hello from automated test','text/plain')}
data={'project_id':'cli-test'}
resp3=requests.post(BASE+'/api/storage/upload',headers=headers,files=files,data=data)
print('POST /api/storage/upload',resp3.status_code)
print(resp3.text)
