function cmtpass(idx) {
  fetch('/cmts').then(res => res.json()).then(data => {
    fetch('/cmtpass', {
      method: 'post',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "username": data[idx].username,
        "submit_time": data[idx].submit_time,
      })
    })
  }).then(e => {
    location.reload(true)
  })
}
function cmtdel(idx) {
  fetch('/cmts').then(res => res.json()).then(data => {
    fetch('/cmtdel', {
      method: 'post',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "username": data[idx].username,
        "submit_time": data[idx].submit_time,
      })
    })
  }).then(e => {
    location.reload(true)
  })
}