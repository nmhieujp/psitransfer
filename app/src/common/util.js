export async function httpGet(url, headers) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    if (headers) {
      Object.keys(headers).forEach(function (key) {
        xhr.setRequestHeader(key, headers[key]);
      });
    }
    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          resolve(JSON.parse(xhr.responseText))
        }
        catch (e) {
          reject(e);
        }
      } else {
        reject(new Error(`HTTP-GET error: ${ xhr.status } ${ xhr.statusText }`))
      }
    };
    xhr.send();
  });
}

export async function httpPost(url, data) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          resolve(JSON.parse(xhr.responseText))
        }
        catch (e) {
          reject(e);
        }
      } else {
        reject(new Error(`HTTP-GET error: ${ xhr.status } ${ xhr.statusText }`))
      }
    };
    xhr.send(JSON.stringify(data));
  });
}
