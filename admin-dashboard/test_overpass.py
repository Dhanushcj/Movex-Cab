import urllib.request, json
query = '[out:json];node(around:2000,12.533704,78.207424,12.533582,78.273397,12.542583,78.356717)["place"~"town|village|city"];out;'
url = 'https://overpass-api.de/api/interpreter'
req = urllib.request.Request(url, data=query.encode('utf-8'), method='POST')
req.add_header('User-Agent', 'MovexCab-Admin')
try:
    res = urllib.request.urlopen(req)
    data = json.loads(res.read())
    print([n.get('tags', {}).get('name') for n in data.get('elements', [])])
except Exception as e:
    print(e)
