import json
import csv

db = {
    'data': []
}

with open('data/example.csv') as f:
    reader = csv.reader(f, delimiter=',')
    header = next(reader)
    for row in reader:
        record = {'meta': {}}
        for key, val in zip(header, row):
            if key in ['artwork_name', 'artist_full_name', 'creation_year']:
                record['meta'][key] = val
            if key == 'image_url':
                record[key] = val
        db['data'].append(record)

with open('data/example.json', 'w') as f:
    json.dump(db, f)