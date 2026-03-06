import json
import os

from app import get_dataset, get_description_label


OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'docs', 'data')
OUTPUT_PATH = os.path.join(OUTPUT_DIR, 'catalogs.json')


def serialize_dataset(mode):
    dataset = get_dataset(mode)
    songs = []
    for song in dataset['songs']:
        item = dict(song)
        item['description_label'] = get_description_label(song)
        songs.append(item)

    return {
        'mode': dataset['mode'],
        'name': dataset['name'],
        'count': dataset['count'],
        'note': dataset['note'],
        'songs': songs,
    }


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    payload = {
        'study': serialize_dataset('study'),
        'combined': serialize_dataset('combined'),
    }
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, separators=(',', ':'))

    print(f'Wrote {OUTPUT_PATH}')


if __name__ == '__main__':
    main()