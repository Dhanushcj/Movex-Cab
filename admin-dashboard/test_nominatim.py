import urllib.request, json, urllib.parse
query = urllib.parse.quote('krishnagiri')
url = f'https://nominatim.openstreetmap.org/search?q={query}&format=json&addressdetails=1&limit=5&countrycodes=in'
req = urllib.request.Request(url, headers={'User-Agent': 'MovexCab/1.0'})
try:
    res = urllib.request.urlopen(req)
    data = json.loads(res.read())
    for item in data:
        print(f"{item['display_name']} - {item['lat']},{item['lon']}")
except Exception as e:
    print(e)
