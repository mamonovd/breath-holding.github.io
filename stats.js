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

async function init(ctx) {
  let labels = [];
  let datasets = [{
    label: "1",
    data: [],
    borderColor: '#00988e',
    backgroundColor: '#00988e',
  },{
    label: "2",
    data: [],
    borderColor: '#4e6ce2',
    backgroundColor: '#4e6ce2',
  },{
    label: "3",
    data: [],
    borderColor: '#e2ad00',
    backgroundColor: '#e2ad00',
  },{
    label: "4",
    data: [],
    borderColor: '#582540',
    backgroundColor: '#582540',
  },{
    label: "5",
    data: [],
    borderColor: '#8bb769',
    backgroundColor: '#8bb769',
  }];
  (await get('data.json')).stats.forEach(s => {
    labels.push(s.d);
    datasets.forEach((d,i) => d.data.push(s[i+1]));
  });

  new Chart(ctx, config({labels, datasets}));
}

init(document.getElementById('myChart'));
})();
