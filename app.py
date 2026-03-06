from flask import Flask, render_template, request
import numpy as np
import csv
import json
import os
from functools import lru_cache
from taylorswift import PACKAGEDIR

app = Flask(__name__)

WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
COMBINED_SONGS_PATH = os.path.join(WORKSPACE_DIR, 'all_songs_combined_ai_avg.csv')
AI_HIGHLIGHTS_PATH = os.path.join(WORKSPACE_DIR, 'ai_song_highlights.json')


def parse_text(raw):
    """Split 'quote text ... https://url' into (quote, url|None)."""
    import re
    m = re.search(r'(https?://\S+)$', raw)
    if m:
        quote = raw[:raw.rfind('If you want')].strip()
        return quote, m.group(1)
    return raw, None


def build_song(title, album, sf, st, ser, fut, mal, tog, description='', url=None, source='study', description_kind='quote'):
    return {
        'title': title,
        'album': album,
        'selffeel': sf,
        'stages': st,
        'seriousness': ser,
        'future': fut,
        'malefeel': mal,
        'together': tog,
        'description': description,
        'description_kind': description_kind,
        'url': url,
        'source': source,
        # 2-D coords for the scatter chart
        # X = relationship dimension (avg of 4 rel scores)
        # Y = mood dimension (avg of 2 mood scores)
        'cx': round((ser + fut + mal + tog) / 4, 2),
        'cy': round((sf + st) / 2, 2),
    }


@lru_cache(maxsize=1)
def load_study_songs():
    """Load the original 149-song study dataset."""
    data = []
    with open(os.path.join(PACKAGEDIR, 'Grades.csv'), 'rt') as f:
        data = [row for row in csv.reader(f, delimiter=',')]

    song_rows = [row for row in data[2:] if len(row) > 4 and row[0].strip()]

    with open(os.path.join(PACKAGEDIR, 'answertext.txt'), 'r', encoding='utf-8', errors='replace') as tf:
        texts = [line.rstrip('\n').rstrip('#').strip() for line in tf.readlines()]

    songs = []
    for i, row in enumerate(song_rows):
        sf = float(row[4])
        st = float(row[6])
        ser = float(row[8])
        fut = float(row[9])
        mal = float(row[10])
        tog = float(row[11])
        raw_text = texts[i] if i < len(texts) else ''
        quote, url = parse_text(raw_text)
        songs.append(build_song(row[0], row[1], sf, st, ser, fut, mal, tog, quote, url, 'study', 'quote'))
    return songs


@lru_cache(maxsize=1)
def load_ai_highlights():
    with open(AI_HIGHLIGHTS_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def get_description_label(song):
    if song['description_kind'] == 'quote':
        return 'Lyric quote'
    if song['source'] == 'ai_average':
        return 'Interpretive note'
    return 'Note'


@lru_cache(maxsize=1)
def load_combined_songs():
    """Load the extended 240-song dataset: study songs + AI-averaged additions."""
    study_lookup = {
        (song['title'], song['album']): song
        for song in load_study_songs()
    }
    ai_highlights = load_ai_highlights()

    songs = []
    with open(COMBINED_SONGS_PATH, 'r', encoding='utf-8', newline='') as f:
        for row in csv.DictReader(f):
            title = row['Title']
            album = row['Album']
            study_song = study_lookup.get((title, album))
            highlight_key = f'{album}::{title}'
            description = study_song['description'] if study_song else ai_highlights.get(highlight_key, '')
            url = study_song['url'] if study_song else None
            description_kind = study_song['description_kind'] if study_song else 'summary'
            songs.append(
                build_song(
                    title,
                    album,
                    float(row['SelfFeel']),
                    float(row['Stages']),
                    float(row['Seriousness']),
                    float(row['FutureProspects']),
                    float(row['MaleFeel']),
                    float(row['Togetherness']),
                    description,
                    url,
                    row.get('Source', 'ai_average'),
                    description_kind,
                )
            )
    return songs


def get_dataset(mode):
    if mode == 'combined':
        songs = load_combined_songs()
        return {
            'mode': 'combined',
            'songs': songs,
            'name': 'Expanded catalog',
            'count': len(songs),
            'note': '149 original study songs plus 91 added songs scored by averaging 4 separate AI lyric evaluations. This extended dataset does not belong to the original study.',
        }

    songs = load_study_songs()
    return {
        'mode': 'study',
        'songs': songs,
        'name': 'Original study',
        'count': len(songs),
        'note': 'This mode uses only the 149 songs from the original human-scored study dataset.',
    }


def get_top5(songs, hap1, hap3, rel1, rel2, rel3, rel4):
    selffeel    = np.array([s['selffeel']    for s in songs])
    stages      = np.array([s['stages']      for s in songs])
    seriousness = np.array([s['seriousness'] for s in songs])
    future      = np.array([s['future']      for s in songs])
    malefeel    = np.array([s['malefeel']    for s in songs])
    together    = np.array([s['together']    for s in songs])

    neterr = (
        (selffeel    - hap1) ** 2 +
        (stages      - hap3) ** 2 +
        (seriousness - rel1) ** 2 +
        (future      - rel2) ** 2 +
        (malefeel    - rel3) ** 2 +
        (together    - rel4) ** 2
    )
    return np.argsort(neterr)[:5].tolist()


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/result', methods=['POST'])
def result():
    def q(name):
        return int(float(request.form[name])) - 4

    hap1, hap3 = q('hap1'), q('hap3')
    rel1, rel2, rel3, rel4 = q('rel1'), q('rel2'), q('rel3'), q('rel4')

    dataset = get_dataset(request.form.get('dataset', 'study'))
    songs = dataset['songs']
    top5_idx = get_top5(songs, hap1, hap3, rel1, rel2, rel3, rel4)

    result_songs = [
        {
            **songs[idx],
            'rank': i + 1,
            'description_label': get_description_label(songs[idx]),
        }
        for i, idx in enumerate(top5_idx)
    ]

    top5_titles  = [songs[i]['title'] for i in top5_idx]

    # Compact chart payload: {x, y, t=title, a=album}
    chart_songs = [{'x': s['cx'], 'y': s['cy'], 't': s['title'], 'a': s['album']}
                   for s in songs]

    user_x = round((rel1 + rel2 + rel3 + rel4) / 4, 2)
    user_y = round((hap1 + hap3) / 2, 2)

    return render_template(
        'results.html',
        songs=result_songs,
        chart_songs=json.dumps(chart_songs),
        top5_titles=json.dumps(top5_titles),
        user_x=user_x,
        user_y=user_y,
        dataset_name=dataset['name'],
        dataset_note=dataset['note'],
        dataset_mode=dataset['mode'],
        song_count=dataset['count'],
    )


if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
