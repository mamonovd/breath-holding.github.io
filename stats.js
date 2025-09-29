(function(){
async function http0(path, config) {
    try {
        const request = new Request(path, config);
        const response = await fetch(request);
        if (!response.ok) {
            throw new Error(response.status.toString() + ': ' + response.statusText);
        }
        const result = await response.json().catch(() => ({}));
        if (response.headers.get('Content-Type').includes('application/json')) {
            return result;
        } else {
            // console.error('Not authenticated');
            window.location.replace(window.location.href.substring(0, window.location.href.indexOf('#')));
        }
    } catch (e) {
        return Promise.reject(e);
    }
}

async function http(path, config) {
    return new Promise((resolve, reject) => {
        fetch(new Request(path, config))
            .then((response) => {
                if (!response.ok) {
                    throw response;
                } else {
                    if (response.headers.get('Content-Type').includes('application/json')) {
                        return response.json().catch(() => ({}));
                    } else if (response.headers.get('Content-Type').includes('text/html')) {
                        response.text().then((text) => {
                            if (text.indexOf('<html>') !== -1) {
                                throw response;
                            } else {
                                reject(text);
                            }
                        });
                    } else {
                        throw response;
                    }
                }
            })
            .then((data) => {
                resolve(data);
            })
            .catch((error) => {
                if (typeof error.json === 'function') {
                    error
                        .json()
                        .then((jsonError) => {
                            // console.debug('Json error from API');
                            reject(jsonError);
                        })
                        .catch(() => {
                            // console.debug('Generic error from API');
                            reject(error.statusText);
                        });
                } else {
                    // console.debug('Fetch error');
                    reject(error);
                }
            });
    });
}

async function get(path, config) {
    const init = { method: 'get', ...config };
    return http(path, init);
}

async function post(path, body, config) {
    const init = { method: 'post', body: JSON.stringify(body), ...config };
    return http(path, init);
}

async function put(path, body, config) {
    const init = { method: 'put', body: JSON.stringify(body), ...config };
    return http(path, init);
}

async function postForm(path, formData, config) {
    const init = { method: 'post', body: new URLSearchParams([...formData]), ...config };
    return http(path, init);
}

const config = (data) => ({
  type: 'line',
  data: data,
  options: {
    responsive: true,
    pointRadius: 1,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    layout: {
        padding: 40,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Статистика задержки дыхания на выдохе'
      }
    }
  },
});

function getData() {
    return new Promise(resolve => { resolve({
  "stats": [
    { "d": "2025-04-30", "t": [26, 30, 34, 32, 46] },
    { "d": "2025-05-01", "t": [26, 38, 34, 36, 48] },
    { "d": "2025-05-04", "t": [26, 40, 42, 45, 55] },
    { "d": "2025-05-05", "t": [10, 41, 40, 55, 40] },
    { "d": "2025-05-06", "t": [30, 31, 35, 31, 40] },
    { "d": "2025-05-07", "t": [30, 35, 40, 50, 50] },
    { "d": "2025-05-08", "t": [26, 31, 35, 32, 35] },
    { "d": "2025-05-10", "t": [30, 35, 41, 46, 40] },
    { "d": "2025-05-11", "t": [31, 31, 30, 35, 36] },
    { "d": "2025-05-14", "t": [30, 35, 41, 46, 40] },
    { "d": "2025-05-15", "t": [30, 31, 36, 36, 41] },
    { "d": "2025-05-16", "t": [31, 36, 36, 43, 37] }
  ]
}
)});
}

class StatsChart {
  constructor(ctx) {
    this.ctx = ctx;
    this.agg = false;
    this.src = true;
    this.init();
    this.load();
  }

  init() {
    const self = this;
    document.getElementById('src').addEventListener("change", function() {
      self.src = this.checked
    });
    document.getElementById('agg').addEventListener("change", function() {
      self.agg = this.checked
    });
    document.getElementById('reload').addEventListener("click", function() {
      self.chart.destroy();
      self.load();
    });
  }

  async load() {
    const labels = [];
    const datasets = [];
    const agg = this.agg, src = this.src;
    if (src) {
        datasets.push({
        label: "1",
        data: [],
        borderColor: '#00988e66',
        backgroundColor: '#00988e66',
        cubicInterpolationMode: 'monotone',
        tension: 0.4,
      },{
        label: "2",
        data: [],
        borderColor: '#4e6ce266',
        backgroundColor: '#4e6ce266',
        cubicInterpolationMode: 'monotone',
        tension: 0.4,
      },{
        label: "3",
        data: [],
        borderColor: '#e2ad0066',
        backgroundColor: '#e2ad0066',
        cubicInterpolationMode: 'monotone',
        tension: 0.4,
      },{
        label: "4",
        data: [],
        borderColor: '#58254066',
        backgroundColor: '#58254066',
        cubicInterpolationMode: 'monotone',
        tension: 0.4,
      },{
        label: "5",
        data: [],
        borderColor: '#8bb76966',
        backgroundColor: '#8bb76966',
        cubicInterpolationMode: 'monotone',
        tension: 0.4,
      });
    }

    if (agg) {
      datasets.push({
        label: "min",
        data: [],
        borderColor: '#fd4131',
        backgroundColor: '#fd4131',
        cubicInterpolationMode: 'monotone',
        tension: 0.4,
      },{
        label: "avg",
        data: [],
        borderColor: '#30fc91',
        backgroundColor: '#30fc91',
        cubicInterpolationMode: 'monotone',
        tension: 0.4,
      },{
        label: "max",
        data: [],
        borderColor: '#3374fd',
        backgroundColor: '#3374fd',
        cubicInterpolationMode: 'monotone',
        tension: 0.4,
      });
    }

    (await get('data.json')).stats.forEach(s => {
      labels.push(s.d);
      let min = Infinity, max = -Infinity, avg = 0;
      s.t.forEach((v,i) => {
        if (src) {
          datasets[i].data.push(v);
        }
        if (agg) {
          min = Math.min(min, v);
          max = Math.max(max, v);
          avg += v;
        }
      });
      const offset = src ? 5 : 0;
      if (agg) {
        datasets[offset].data.push(min);
        datasets[offset + 1].data.push(avg/5);
        datasets[offset + 2].data.push(max);
      }
    });

    this.chart = new Chart(this.ctx, config({labels, datasets}));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new StatsChart(document.getElementById('myChart'));
});

})();
