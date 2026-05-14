const views = [
  "login",
  "tenant-dashboard",
  "new-booking",
  "my-requests",
  "admin-approval",
  "calendar",
  "activity-log",
  "settings",
];

const navByRole = {
  Tenant: ["tenant-dashboard", "new-booking", "my-requests", "calendar"],
  Security: ["admin-approval", "calendar", "activity-log", "settings"],
  "Property Management": ["tenant-dashboard", "admin-approval", "calendar", "activity-log", "settings"],
  Operations: ["calendar", "activity-log"],
};

const state = {
  role: null,
  email: "",
  bookings: [
    {
      id: "BKG-1001",
      tenantName: "Alex Martin",
      company: "Blue Peak Law",
      email: "alex@bluepeak.com",
      phone: "555-0134",
      requestedDate: "2026-05-15",
      startTime: "09:00",
      endTime: "10:00",
      resource: "Loading Dock 1",
      vendor: "Metro Freight",
      deliveryType: "Delivery",
      notes: "Palletized office supplies",
      attachments: 1,
      status: "Pending",
    },
  ],
  activity: ["System initialized."],
};

const titleMap = {
  "tenant-dashboard": ["Tenant Dashboard", "Overview of requests and actions."],
  "new-booking": ["New Booking Form", "Submit a loading dock or elevator request."],
  "my-requests": ["My Requests", "Track your submitted booking requests."],
  "admin-approval": ["Admin Approval Dashboard", "Review and process incoming requests."],
  calendar: ["Calendar View", "Shared operations calendar for all booking activity."],
  "activity-log": ["Activity Log", "Chronological audit of booking actions."],
  settings: ["Settings & Resources", "Manage building resources and notification defaults."],
  login: ["Login", "Secure access for tenants and operations teams."],
};

const app = document.getElementById("app");
const nav = document.getElementById("main-nav");
const logoutBtn = document.getElementById("logout-btn");

document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  state.role = document.getElementById("login-role").value;
  state.email = document.getElementById("login-email").value;
  document.getElementById("active-role-badge").textContent = state.role;
  logoutBtn.hidden = false;
  renderNav();
  renderAll();
  goTo(navByRole[state.role][0]);
});

logoutBtn.addEventListener("click", () => {
  state.role = null;
  nav.innerHTML = "";
  logoutBtn.hidden = true;
  document.getElementById("active-role-badge").textContent = "Guest";
  goTo("login");
});

function renderNav() {
  nav.innerHTML = "";
  navByRole[state.role].forEach((view) => {
    const b = document.createElement("button");
    b.textContent = titleMap[view][0];
    b.onclick = () => goTo(view);
    b.dataset.view = view;
    nav.appendChild(b);
  });
}

function goTo(view) {
  views.forEach((v) => document.getElementById(`view-${v}`).classList.remove("active-view"));
  document.getElementById(`view-${view}`).classList.add("active-view");
  document.getElementById("page-title").textContent = titleMap[view][0];
  document.getElementById("page-subtitle").textContent = titleMap[view][1];
  document.querySelectorAll(".nav button").forEach((btn) => btn.classList.toggle("active", btn.dataset.view === view));
}

function renderAll() {
  renderTenantDashboard();
  renderNewBooking();
  renderMyRequests();
  renderAdmin();
  renderCalendar();
  renderActivity();
  renderSettings();
}

function renderTenantDashboard() {
  const pending = state.bookings.filter((b) => b.status === "Pending").length;
  const approved = state.bookings.filter((b) => b.status === "Approved").length;
  const denied = state.bookings.filter((b) => b.status === "Denied").length;
  document.getElementById("view-tenant-dashboard").innerHTML = `
    <div class="kpis">
      <div class="card"><h4>Total Requests</h4><p>${state.bookings.length}</p></div>
      <div class="card"><h4>Pending</h4><p>${pending}</p></div>
      <div class="card"><h4>Approved</h4><p>${approved}</p></div>
      <div class="card"><h4>Denied</h4><p>${denied}</p></div>
    </div>`;
}

function renderNewBooking() {
  const c = document.getElementById("view-new-booking");
  c.innerHTML = document.getElementById("new-booking-template").innerHTML;
  c.querySelector("#booking-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const booking = Object.fromEntries(form.entries());
    booking.id = `BKG-${1000 + state.bookings.length + 1}`;
    booking.status = "Pending";
    booking.attachments = form.getAll("attachments").filter((f) => f.name).length;
    state.bookings.unshift(booking);
    state.activity.unshift(`Booking ${booking.id} submitted by ${booking.tenantName}. Email notice sent.`);
    e.target.reset();
    renderAll();
    goTo("my-requests");
  });
}

function renderBookingsTable(rows, includeActions = false) {
  return `<div class="table-wrap"><table>
    <thead><tr><th>ID</th><th>Tenant</th><th>Date</th><th>Time</th><th>Resource</th><th>Status</th>${includeActions ? "<th>Actions</th>" : ""}</tr></thead>
    <tbody>
      ${rows
        .map(
          (b) => `<tr>
          <td>${b.id}</td><td>${b.tenantName}<br><small>${b.company}</small></td>
          <td>${b.requestedDate}</td><td>${b.startTime} - ${b.endTime}</td><td>${b.resource}</td>
          <td><span class="status status-${b.status}">${b.status}</span></td>
          ${
            includeActions
              ? `<td>
                <button class="btn" onclick="updateStatus('${b.id}','Approved')">Approve</button>
                <button class="btn btn-secondary" onclick="updateStatus('${b.id}','Denied')">Deny</button>
                <button class="btn btn-secondary" onclick="updateStatus('${b.id}','Alternative Time Proposed')">Propose New</button>
              </td>`
              : ""
          }
        </tr>`
        )
        .join("")}
    </tbody></table></div>`;
}

window.updateStatus = function updateStatus(id, status) {
  const booking = state.bookings.find((b) => b.id === id);
  booking.status = status;
  state.activity.unshift(`Booking ${id} updated to ${status}. Email notice sent to ${booking.email}.`);
  renderAll();
};

function renderMyRequests() {
  const mine = state.role === "Tenant" ? state.bookings.filter((b) => b.email === state.email) : state.bookings;
  document.getElementById("view-my-requests").innerHTML = `<div class="card"><h3>Requests</h3>${renderBookingsTable(mine)}</div>`;
}

function renderAdmin() {
  document.getElementById("view-admin-approval").innerHTML = `
  <div class="card">
    <h3>Pending and Active Requests</h3>
    <div class="filters">
      <span class="badge">Pending</span><span class="badge">Approved</span><span class="badge">Alternative Time Proposed</span>
    </div>
    ${renderBookingsTable(state.bookings, true)}
  </div>`;
}

function renderCalendar() {
  const groups = state.bookings.reduce((acc, b) => {
    (acc[b.requestedDate] ||= []).push(b);
    return acc;
  }, {});
  document.getElementById("view-calendar").innerHTML = `<div class="card"><h3>Booking Calendar</h3>
    <div class="calendar">${Object.entries(groups)
      .map(
        ([day, bookings]) => `<article class="day"><strong>${day}</strong>
        ${bookings.map((b) => `<p>${b.startTime} ${b.resource}<br><small>${b.tenantName}</small></p>`).join("")}
        </article>`
      )
      .join("")}</div></div>`;
}

function renderActivity() {
  document.getElementById("view-activity-log").innerHTML = `<div class="card"><h3>Activity Log</h3>
    <ul class="activity">${state.activity.map((item) => `<li>${item}</li>`).join("")}</ul>
  </div>`;
}

function renderSettings() {
  document.getElementById("view-settings").innerHTML = `<div class="card"><h3>Resources</h3>
  <ul><li>Loading Dock 1</li><li>Loading Dock 2</li><li>Loading Dock 3</li><li>Service Elevator</li></ul>
  <h3>Email Notifications</h3><p>Automatic emails are sent on submission, approval, denial, and proposed alternatives.</p>
  <h3>Statuses</h3><p>Pending, Approved, Denied, Alternative Time Proposed, Cancelled, Completed.</p>
  </div>`;
}
