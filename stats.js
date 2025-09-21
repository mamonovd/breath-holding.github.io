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
    { "d": "2025-05-20", "1": 31, "2": 33, "3": 35, "4": 37, "5": 40 },
    { "d": "2025-05-21", "1": 31, "2": 34, "3": 34, "4": 36, "5": 35 },
    { "d": "2025-05-21", "1": 31, "2": 34, "3": 34, "4": 36, "5": 35 },
    { "d": "2025-05-22", "1": 32, "2": null, "3": null, "4": null, "5": null },
    { "d": "2025-05-23", "1": 34, "2": 34, "3": null, "4": null, "5": null },
    { "d": "2025-05-24", "1": 32, "2": 33, "3": 29, "4": 32, "5": 27 },
    { "d": "2025-05-25", "1": 31, "2": 33, "3": 35, "4": 36, "5": 41 },
    { "d": "2025-05-27", "1": 31, "2": 32, "3": 33, "4": 34, "5": 35 }
  ]
}
)});
}

async function init(ctx) {
  let labels = [];
  let datasets = [{
    label: "1",
    data: [],
    borderColor: '#00988e',
    backgroundColor: '#00988e',
    cubicInterpolationMode: 'monotone',
    tension: 0.4,
  },{
    label: "2",
    data: [],
    borderColor: '#4e6ce2',
    backgroundColor: '#4e6ce2',
    cubicInterpolationMode: 'monotone',
    tension: 0.4,
  },{
    label: "3",
    data: [],
    borderColor: '#e2ad00',
    backgroundColor: '#e2ad00',
    cubicInterpolationMode: 'monotone',
    tension: 0.4,
  },{
    label: "4",
    data: [],
    borderColor: '#582540',
    backgroundColor: '#582540',
    cubicInterpolationMode: 'monotone',
    tension: 0.4,
  },{
    label: "5",
    data: [],
    borderColor: '#8bb769',
    backgroundColor: '#8bb769',
    cubicInterpolationMode: 'monotone',
    tension: 0.4,
  }];
  (await get('data.json')).stats.forEach(s => {
    labels.push(s.d);
    datasets.forEach((d,i) => d.data.push(s[i+1]));
  });

  new Chart(ctx, config({labels, datasets}));
}

document.addEventListener("DOMContentLoaded", () => {
  init(document.getElementById('myChart'));
});

})();
