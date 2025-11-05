
// Helper to compute total per year
function totalsPerYear(yearIndex) {
  const platforms = DATA.platforms;
  const keys = Object.keys(platforms);
  const totals = keys.map(k => platforms[k][yearIndex]);
  return { keys: keys, values: totals };
}

// Populate year dropdown
const yearSelect = document.getElementById('yearSelect');
DATA.years.forEach((y, i) => {
  const opt = document.createElement('option');
  opt.value = i; // index
  opt.text = y;
  yearSelect.appendChild(opt);
});
// default to latest year
yearSelect.value = DATA.years.length - 1;

// Create charts
const lineCtx = document.getElementById('lineChart').getContext('2d');
const barCtx = document.getElementById('barChart').getContext('2d');
const pieCtx = document.getElementById('pieChart').getContext('2d');

// Prepare initial datasets for line chart (total all platforms per year)
const totalPerYear = DATA.years.map((y, idx) => {
  let sum = 0;
  for (const p of Object.keys(DATA.platforms)) {
    sum += DATA.platforms[p][idx];
  }
  return sum;
});

const lineChart = new Chart(lineCtx, {
  type: 'line',
  data: {
    labels: DATA.years,
    datasets: [{
      label: 'Total Pengguna (juta)',
      data: totalPerYear,
      borderColor: '#1a73e8',
      backgroundColor: 'rgba(26,115,232,0.15)',
      fill: true,
      tension: 0.3
    }]
  },
  options: {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.parsed.y + ' juta pengguna';
          }
        }
      },
      title: { display: true, text: 'Pertumbuhan Total Pengguna Media Sosial (2015–2024)' }
    },
    scales: { y: { beginAtZero: true } }
  }
});

// Bar and Pie initial for latest year
function createBarData(yearIndex) {
  const info = totalsPerYear(yearIndex);
  return { labels: info.keys, data: info.values };
}

let barData = createBarData(DATA.years.length - 1);

const barChart = new Chart(barCtx, {
  type: 'bar',
  data: {
    labels: barData.labels,
    datasets: [{
      label: 'Juta Pengguna',
      data: barData.data,
      backgroundColor: ['#E1306C', '#69C9D0', '#1877F2', '#1DA1F2', '#0A66C2']
    }]
  },
  options: {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.parsed.y + ' juta pengguna (' + DATA.years[yearSelect.value] + ')';
          }
        }
      },
      title: { display: true, text: 'Jumlah Pengguna per Platform (tahun terpilih)' },
      legend: { display: false }
    },
    scales: { y: { beginAtZero: true } }
  }
});

let pieChart = new Chart(pieCtx, {
  type: 'pie',
  data: {
    labels: barData.labels,
    datasets: [{
      data: barData.data,
      backgroundColor: ['#E1306C', '#69C9D0', '#1877F2', '#1DA1F2', '#0A66C2']
    }]
  },
  options: {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.chart._metasets[context.datasetIndex].total || 0;
            const pct = total ? ((value/total)*100).toFixed(1) : 0;
            return label + ': ' + value + ' juta (' + pct + '%) - ' + DATA.years[yearSelect.value];
          }
        }
      },
      title: { display: true, text: 'Proporsi Pengguna Global per Platform (tahun terpilih)' },
      legend: { position: 'right' }
    }
  }
});

// Update function when year changes
function updateCharts(yearIndex) {
  // Line: show data up to selected year (slice)
  const sliceLabels = DATA.years.slice(0, yearIndex+1);
  lineChart.data.labels = sliceLabels;
  lineChart.data.datasets[0].data = totalPerYear.slice(0, yearIndex+1);
  lineChart.update();

  // Bar & Pie: update to selected year values
  const info = totalsPerYear(yearIndex);
  barChart.data.labels = info.keys;
  barChart.data.datasets[0].data = info.values;
  barChart.update();

  pieChart.data.labels = info.keys;
  pieChart.data.datasets[0].data = info.values;
  pieChart.update();
}

// initial update
updateCharts(parseInt(yearSelect.value));

// event listener
yearSelect.addEventListener('change', (e) => {
  const idx = parseInt(e.target.value);
  updateCharts(idx);
});
