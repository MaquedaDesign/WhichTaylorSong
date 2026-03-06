const studyExplainer = {
  summary: '✦ How does this work? (Original study)',
  body: `
    <p>This tool is based on a project by astronomer <strong>Megan Mansfield</strong> (University of Chicago). Each of Taylor Swift's <strong>149 songs</strong> was manually scored on <strong>6 emotional dimensions</strong>, each using <strong>7 integer levels</strong> (-3 to 0 to +3):</p>
    <table class="dim-table">
      <tr><td>Feelings of self</td><td>How good the protagonist feels about themselves</td></tr>
      <tr><td>Emotional stage</td><td>Anger and depression to actively seeking happiness</td></tr>
      <tr><td>Relationship seriousness</td><td>Quality and depth of the relationship portrayed</td></tr>
      <tr><td>Future prospects</td><td>Outlook for the relationship's future</td></tr>
      <tr><td>Other person's feelings</td><td>How the other person feels about the protagonist</td></tr>
      <tr><td>Togetherness</td><td>How much time they spend together</td></tr>
    </table>
    <p>The sliders map directly onto that same scale, so your answers and the song scores are directly comparable. The algorithm then picks the 5 songs with the smallest Euclidean distance to your position in this 6-dimensional space.</p>
  `,
};

const combinedExplainer = {
  summary: '✦ How does this work? (Expanded catalog)',
  body: `
    <p>This mode keeps the original <strong>149 human-scored study songs</strong> and adds <strong>91 extra songs</strong> that were missing from the package dataset.</p>
    <table class="dim-table">
      <tr><td>Feelings of self</td><td>How good the protagonist feels about themselves</td></tr>
      <tr><td>Emotional stage</td><td>Anger and depression to actively seeking happiness</td></tr>
      <tr><td>Relationship seriousness</td><td>Quality and depth of the relationship portrayed</td></tr>
      <tr><td>Future prospects</td><td>Outlook for the relationship's future</td></tr>
      <tr><td>Other person's feelings</td><td>How the other person feels about the protagonist</td></tr>
      <tr><td>Togetherness</td><td>How much time they spend together</td></tr>
    </table>
    <p>The extra songs were scored on the same <strong>-3 to +3</strong> scale, but they are not part of the original study. Their scores were estimated by averaging 4 separate AI lyric analyses, then rounding back to the original discrete scale.</p>
    <div class="mode-note">Use this mode if you want broader coverage of the discography. Use <strong>Original study</strong> if you want to stay strictly within the published human-scored dataset.</div>
  `,
};

const loadingEl = document.getElementById('loading');
const appEl = document.getElementById('app');
const formEl = document.getElementById('quiz-form');
const resultsEl = document.getElementById('results');
const summaryEl = document.getElementById('explainer-summary');
const bodyEl = document.getElementById('explainer-body');
const datasetInputs = Array.from(document.querySelectorAll('input[name="dataset"]'));
const songListEl = document.getElementById('song-list');
const resultDatasetTitleEl = document.getElementById('result-dataset-title');
const resultDatasetNoteEl = document.getElementById('result-dataset-note');
const chartDescriptionEl = document.getElementById('chart-description');
const resetViewEl = document.getElementById('reset-view');

let catalogs = null;
let chart = null;
const FIXED_AXIS_TICKS = [-3, -2, -1, 0, 1, 2, 3];

function getSelectedDatasetMode() {
  return document.querySelector('input[name="dataset"]:checked')?.value || 'study';
}

function updateExplainer() {
  const content = getSelectedDatasetMode() === 'combined' ? combinedExplainer : studyExplainer;
  summaryEl.textContent = content.summary;
  bodyEl.innerHTML = content.body;
}

function sliderValue(name) {
  return Number(formEl.elements[name].value) - 4;
}

function computeTopFive(songs, values) {
  return songs
    .map((song, index) => ({
      song,
      index,
      distance:
        (song.selffeel - values.hap1) ** 2 +
        (song.stages - values.hap3) ** 2 +
        (song.seriousness - values.rel1) ** 2 +
        (song.future - values.rel2) ** 2 +
        (song.malefeel - values.rel3) ** 2 +
        (song.together - values.rel4) ** 2,
    }))
    .sort((left, right) => left.distance - right.distance || left.index - right.index)
    .slice(0, 5)
    .map((entry, index) => ({ ...entry.song, rank: index + 1 }));
}

function renderSongs(songs) {
  songListEl.innerHTML = songs
    .map((song) => {
      const quote = song.description && song.description_kind === 'quote';
      const desc = !song.description
        ? ''
        : `<div class="song-desc"><strong>${song.description_label}:</strong> ${quote ? `&quot;${song.description}&quot;` : song.description}</div>`;
      const video = song.url
        ? `<div class="song-link"><a href="${song.url}" target="_blank" rel="noopener">Video</a></div>`
        : '';
      const topBadge = song.rank === 1 ? '<span class="top-badge">✦ Best match</span>' : '';
      const sourceBadge = song.source === 'ai_average' ? '<span class="source-badge">AI averaged</span>' : '';

      return `
        <div class="song-card ${song.rank === 1 ? 'top-pick' : ''}">
          <div class="rank">#${song.rank}</div>
          <div class="song-info">
            <div class="song-header">
              <div class="song-title">${song.title}</div>
              ${topBadge}
              ${sourceBadge}
            </div>
            <div class="song-album">${song.album}</div>
            ${desc}
            ${video}
          </div>
        </div>
      `;
    })
    .join('');
}

function renderChart(dataset, topSongs, values) {
  const userX = Number(((values.rel1 + values.rel2 + values.rel3 + values.rel4) / 4).toFixed(2));
  const userY = Number(((values.hap1 + values.hap3) / 2).toFixed(2));
  const topTitles = new Set(topSongs.map((song) => song.title));
  const topTitleOrder = Object.fromEntries(topSongs.map((song) => [song.title, `#${song.rank} ${song.title}`]));
  const background = dataset.songs.filter((song) => !topTitles.has(song.title));
  const highlighted = dataset.songs.filter((song) => topTitles.has(song.title));

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(document.getElementById('songChart'), {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'All songs',
          data: background.map((song) => ({ x: song.cx, y: song.cy, title: song.title, album: song.album })),
          pointRadius: 4,
          pointHoverRadius: 6,
          backgroundColor: 'rgba(139, 92, 246, 0.3)',
          borderColor: 'rgba(167, 139, 250, 0.55)',
          borderWidth: 1,
          datalabels: { display: false },
        },
        {
          label: 'Your top 5',
          data: highlighted.map((song) => ({ x: song.cx, y: song.cy, title: song.title, album: song.album })),
          pointRadius: 9,
          pointHoverRadius: 12,
          backgroundColor: 'rgba(249, 168, 212, 0.9)',
          borderColor: '#e879f9',
          borderWidth: 2,
          datalabels: {
            display: true,
            color: '#f9a8d4',
            font: { size: 9, family: 'Georgia' },
            anchor: 'end',
            align: 'top',
            offset: 3,
            formatter: (value) => topTitleOrder[value.title] || value.title,
            clip: false,
          },
        },
        {
          label: 'You',
          data: [{ x: userX, y: userY, title: 'You', album: '' }],
          pointRadius: 13,
          pointStyle: 'star',
          pointHoverRadius: 16,
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderColor: '#f9a8d4',
          borderWidth: 2,
          datalabels: {
            display: true,
            color: '#ffffff',
            font: { size: 11, weight: 'bold', family: 'Georgia' },
            anchor: 'end',
            align: 'top',
            offset: 4,
            formatter: () => '★ You',
            clip: false,
          },
        },
      ],
    },
    options: {
      responsive: true,
      layout: { padding: { top: 24, right: 20 } },
      plugins: {
        legend: {
          labels: { color: '#d8b4fe', font: { family: 'Georgia', size: 12 } },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const item = context.raw;
              if (item.title === 'You') {
                return '★ You are here';
              }
              return `${item.title}  —  ${item.album}`;
            },
          },
          backgroundColor: 'rgba(20, 5, 45, 0.92)',
          titleColor: '#f9a8d4',
          bodyColor: '#d8b4fe',
          borderColor: '#7c3aed',
          borderWidth: 1,
          padding: 10,
        },
      },
      maintainAspectRatio: false,
      scales: {
        x: {
          min: -3,
          max: 3,
          bounds: 'ticks',
          afterBuildTicks: (axis) => {
            axis.ticks = FIXED_AXIS_TICKS.map((value) => ({ value }));
          },
          title: {
            display: true,
            text: '← Painful / Distant relationship ··· Committed / Together →',
            color: '#a78bfa',
            font: { family: 'Georgia', size: 11 },
          },
          ticks: {
            color: '#7c3aed88',
            stepSize: 1,
            autoSkip: false,
            padding: 10,
            font: { size: 12 },
          },
          grid: { color: 'rgba(124, 58, 237, 0.12)' },
        },
        y: {
          min: -3,
          max: 3,
          bounds: 'ticks',
          afterBuildTicks: (axis) => {
            axis.ticks = FIXED_AXIS_TICKS.map((value) => ({ value }));
          },
          title: {
            display: true,
            text: '↑ Happy & Positive mood ··· Sad & Troubled ↓',
            color: '#a78bfa',
            font: { family: 'Georgia', size: 11 },
          },
          ticks: {
            color: '#7c3aed88',
            stepSize: 1,
            autoSkip: false,
            padding: 14,
            font: { size: 13 },
          },
          grid: { color: 'rgba(124, 58, 237, 0.12)' },
        },
      },
    },
  });
}

function showResults(dataset, topSongs, values) {
  resultDatasetTitleEl.textContent = `${dataset.name} · ${dataset.count} songs`;
  resultDatasetNoteEl.textContent = dataset.note;
  chartDescriptionEl.innerHTML = `Each dot is one of the ${dataset.count} songs, projected onto two composite emotional dimensions. Pink ● = your top 5 matches · ★ = you.`;
  renderSongs(topSongs);
  renderChart(dataset, topSongs, values);
  resultsEl.classList.remove('hidden');
  resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function collectAnswers() {
  return {
    rel1: sliderValue('rel1'),
    rel2: sliderValue('rel2'),
    rel3: sliderValue('rel3'),
    rel4: sliderValue('rel4'),
    hap1: sliderValue('hap1'),
    hap3: sliderValue('hap3'),
  };
}

function updateBubble(input) {
  const bubble = input.nextElementSibling;
  if (bubble) {
    bubble.textContent = input.value;
  }
}

async function loadCatalogs() {
  const response = await fetch('./data/catalogs.json');
  if (!response.ok) {
    throw new Error(`Failed to load catalogs: ${response.status}`);
  }
  return response.json();
}

function showLoadError(error) {
  loadingEl.innerHTML = `
    <div class="section-label">✦ Error</div>
    <p>Could not load the static catalog.</p>
    <p>${error.message}</p>
  `;
}

document.addEventListener('DOMContentLoaded', async () => {
  if (window.ChartDataLabels) {
    Chart.register(ChartDataLabels);
  }

  datasetInputs.forEach((input) => input.addEventListener('change', updateExplainer));
  Array.from(document.querySelectorAll('input[type="range"]')).forEach((input) => {
    updateBubble(input);
    input.addEventListener('input', () => updateBubble(input));
  });

  resetViewEl.addEventListener('click', () => {
    resultsEl.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  formEl.addEventListener('submit', (event) => {
    event.preventDefault();
    const mode = getSelectedDatasetMode();
    const dataset = catalogs[mode];
    const values = collectAnswers();
    const topSongs = computeTopFive(dataset.songs, values);
    showResults(dataset, topSongs, values);
  });

  updateExplainer();

  try {
    catalogs = await loadCatalogs();
    loadingEl.classList.add('hidden');
    appEl.classList.remove('hidden');
  } catch (error) {
    showLoadError(error);
  }
});