function fullName() {
  const user = JSON.parse(localStorage.getItem('user'));
  return `${user.lastName} ${user.firstName}`;
}

function fetchData(url, payload) {
  const response = fetch(url, {
    method: payload.method,
    headers: {
      Accept: 'application/json',
      'Content-type': 'application/json',
      'x-access-token': payload.token,
    },
    body: payload.body,
  })
    .then(res => res.json());
  return response;
}

function createRequest(request, link) {
  const token = localStorage.getItem('token');
  fetchData(link.url, {
    method: link.method,
    token,
    body: JSON.stringify(request),
  })
    .then((data) => {
      if (data.Error) {
        const err = document.getElementById('createError');
        const e = `
          <div class="form-section">
            <div class="danger">${data.Error}</div>
          </div>`;
        err.innerHTML = e;
      } else {
        localStorage.setItem('request', JSON.stringify(data));
        window.location.href = 'dashboard.html';
      }
    });
}

function updateRequest(request, link) {
  const token = localStorage.getItem('token');
  fetchData(link.url, {
    method: link.method,
    token,
    body: JSON.stringify(request),
  })
    .then((data) => {
      if (data.Error) {
        const error = data.Error;
        const err = document.getElementById('updateError');
        const e = `
          <div class="form-section">
            <div class="danger">${error}</div>
          </div>`;
        err.innerHTML = e;
      } else {
        localStorage.setItem('request', JSON.stringify(data));
        window.location.href = 'dashboard.html';
      }
    });
}

function showDetails() {
  const user = JSON.parse(localStorage.getItem('user'));
  const request = JSON.parse(localStorage.getItem('request'));
  const el = document.getElementById('requestDetail');
  let button = '';
  if (request.status === 'pending' || request.status === 'disapproved') {
    button = '<a href="update-request.html" class="button info">Update</a>';
  }
  const detail = `
    <div class="card-head">
      <h4>${request.title}</h4>
    </div>
        
    <div class="card-body">
      <div><strong>Requester's Name: </strong>${fullName()}</div>                 
      <div><strong>Department: </strong>${user.dept}</div>                 
      <div><strong>Date Created: </strong>${new Date(request.created_at).toDateString()}</div>                 
      <div><strong>Date Updated: </strong>${new Date(request.updated_at).toDateString()}</div>                 
      <div><strong>Status: </strong>${request.status}</div>                 
      <div><strong>Duration: </strong>${request.duration} day(s)</div>                 
      <div><strong>Description: </strong>${request.description}</div>
      ${button}
    </div>`;
  el.innerHTML = detail;
}

function adminReqDetails() {
  const el = document.getElementById('adminDetail');
  const request = JSON.parse(localStorage.getItem('request'));
  let button1 = '';
  let button2 = '';
  if (request.status === 'pending') {
    button1 = `<a href="#!" onclick="adminUpdate(${request.id}, 'approve')" class="button info">Approve</a>`;
    button2 = `<a href="#!" onclick="adminUpdate(${request.id}, 'disapprove')" class="button danger">Disapprove</a>`;
  } else if (request.status === 'approved') {
    button1 = `<a href="#!" onclick="adminUpdate(${request.id}, 'resolve')" class="button primary">Resolve</a>`;
    button2 = `<a href="#!" onclick="adminUpdate(${request.id}, 'disapprove')" class="button info">Disapprove</a>`;
  } else {
    button1 = `<a href="#!" onclick="adminUpdate(${request.id}, 'approve')" class="button info">Approve</a>`;
  }
  const detail = `
    <div class="card-head">
      <h4>${request.title}</h4>
    </div>

    <div class="card-body">
      <div><strong>Status: </strong>${request.status}</div>
      <div><strong>Date Created: </strong>${new Date(request.created_at).toDateString()}</div>
      <div><strong>Date Updated: </strong>${new Date(request.updated_at).toDateString()}</div>
      <div><strong>Duration: </strong>${request.duration} day(s)</div>
      <div><strong>Description: </strong>${request.description}</div>
      <div class="columns">
      ${button1}
      ${button2}
    </div>`;
  el.innerHTML = detail;
}

function adminReq(id) {
  const requests = JSON.parse(localStorage.getItem('adminRequests'));
  let request = {};
  requests.forEach((element) => {
    if (element.id === id) request = element;
  });
  localStorage.setItem('request', JSON.stringify(request));
  window.location.href = 'admin-request-details.html';
}

function getRequest(id) {
  const token = localStorage.getItem('token');
  fetchData(`http://localhost:4000/api/v1/users/requests/${id}`, {
    method: 'GET',
    token,
  })
    .then((request) => {
      localStorage.setItem('request', JSON.stringify(request));
      window.location.href = 'request-details.html';
    });
}

function logout() {
  localStorage.setItem('user', '');
  localStorage.setItem('token', '');
  window.location.href = 'index.html';
}

function displayRequests(request, id, type) {
  const el = document.getElementById(id);
  let rows = `
  <li class="columns">
    <h2 class="column"><strong>Requests</strong></h2>
    <div class="column columns">
      <h2><strong>Date</strong></h2>
      <h2><strong>Status</strong></h2>
    </div>
  </li>`;
  if (request.length === 0) {
    rows = `
    <li>
      <h2 class="centered">
        You do not  have any request at the moment. <a href="create-request.html">Create a Request</a>
      </h2>                    
    </li>`;
  } else if (request.Error) {
    rows = `
    <li>
      <h2 class="danger centered">
        ${request.Error}
      </h2>                    
    </li>`;
  } else {
    request.forEach((element) => {
      const createdAt = new Date(element.created_at).toDateString();
      let getReq = '';
      if (type === 'admin') {
        getReq = `adminReq(${element.id})`;
      } else {
        getReq = `getRequest(${element.id})`;
      }
      rows += `
    <li class="columns">
      <a class="column" href="#!" id="${element.id}" onclick="${getReq}">${element.title}</a>
      <div class="column columns">
        <div>${createdAt}</div>
        <div class="${element.status}">${element.status}</div>
      </div>                    
    </li>`;
    });
  }
  el.innerHTML = rows;
}

function getUserRequests() {
  const token = localStorage.getItem('token');
  fetchData('http://localhost:4000/api/v1/users/requests', {
    method: 'GET',
    token,
  })
    .then(data => displayRequests(data, 'userRequests', 'user'));
}

function showAdminReq(status) {
  const data = JSON.parse(localStorage.getItem('adminRequests'));
  const request = [];
  const pageId = `${status}Requests`;
  data.forEach((element) => {
    if (element.status === status) request.push(element);
  });
  displayRequests(request, pageId, 'admin');
}

function showAllAdminReq() {
  const data = JSON.parse(localStorage.getItem('adminRequests'));
  displayRequests(data, 'allRequests', 'admin');
}

function getAdminRequests() {
  const token = localStorage.getItem('token');
  fetchData('http://localhost:4000/api/v1/requests', {
    method: 'GET',
    token,
  })
    .then(data => localStorage.setItem('adminRequests', JSON.stringify(data)));
  showAdminReq('pending', 'pendingRequests');
}

function adminUpdate(requestId, action) {
  const token = localStorage.getItem('token');
  fetchData(`http://localhost:4000/api/v1/requests/${requestId}/${action}`, {
    method: 'PUT',
    token,
  })
    .then((data) => {
      if (data.Error) {
        const err = document.getElementById('updError');

        const e = `
          <div class="form-section">
            <div class="danger">${data.Error}</div>
          </div>`;
        err.innerHTML = e;
      } else {
        window.location.href = 'admin-pending-request.html';
      }
    });
}


function signUp(user, link) {
  fetchData(link.url, {
    method: link.method,
    body: JSON.stringify(user),
  })
    .then((data) => {
      if (data.Error) {
        let error = '';
        const err = document.getElementById('signupError');

        if (data.errors) {
          Object.entries(data.errors).forEach(([key, value]) => {
            error += `<li><small><span class="danger">${key}:</span> ${value}</small></li>`;
          });
        }
        const e = `
          <div class="form-section">
            <p class="danger">${data.Error}</p>
            <ul>
              ${error}
            </ul>
          </div>`;
        err.innerHTML = e;
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'dashboard.html';
      }
    });
}

function login(user, link) {
  fetchData(link.url, {
    method: link.method,
    body: JSON.stringify(user),
  })
    .then((data) => {
      if (data.Error) {
        const error = data.Error;
        const err = document.getElementById('loginError');

        const e = `
          <div class="form-section">
            <div class="danger">${error}</div>
          </div>`;
        err.innerHTML = e;
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'Admin') {
          getAdminRequests();
          window.location.href = 'admin-pending-request.html';
        } else {
          window.location.href = 'dashboard.html';
        }
      }
    });
}

