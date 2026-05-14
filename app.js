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
  Tenant: ["tenant-dashboard", "new-booking", "my-requests", "calendar", "settings"],
  Security: ["admin-approval", "calendar", "activity-log", "settings"],
  "Property Management": ["tenant-dashboard", "admin-approval", "calendar", "activity-log", "settings"],
  Operations: ["calendar", "activity-log", "settings"],
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
      resource: "Loading Dock 1 (LD1)",
      vendor: "Metro Freight",
      deliveryType: "Delivery",
      notes: "Palletized office supplies",
      attachments: 1,
      status: "Pending",
      route: "Dock Corridor A > Freight Vestibule",
      sizeCategory: "Roll on / Roll off",
      heavyArticles: "No",
      dockLevelerRequired: "No",
      acknowledgedPolicy: true,
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
  settings: ["Settings & Resources", "Landlord delivery rules, safety, resources, and operating constraints."],
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

    const requestedStart = Number((booking.startTime || "").replace(":", ""));
    const requestedEnd = Number((booking.endTime || "").replace(":", ""));
    const restrictedHours = requestedStart < 600 || requestedEnd > 1800;

    if (!booking.acknowledgedPolicy) {
      alert("You must acknowledge the delivery and loading dock policy before submitting.");
      return;
    }
    if (booking.resource === "Passenger Elevator") {
      alert("Large deliveries are not permitted in passenger elevators.");
      return;
    }
    if (restrictedHours && booking.prearranged !== "Yes") {
      alert("Bookings outside 6:00 AM – 6:00 PM require prearrangement with Property Management.");
      return;
    }
    if (booking.dockLevelerRequired === "Yes" && booking.resource !== "Loading Dock 3 (LD3 - Dock Leveler)") {
      alert("Dock leveler operations are only available at Loading Dock 3 (LD3).");
      return;
    }

    const overlapsExisting = state.bookings.some((existing) =>
      existing.requestedDate === booking.requestedDate &&
      existing.resource === booking.resource &&
      booking.startTime < existing.endTime && booking.endTime > existing.startTime &&
      existing.status !== "Denied" && existing.status !== "Cancelled" && existing.status !== "Completed"
    );

    if (overlapsExisting) {
      alert("That resource is already reserved for an overlapping time window. Please select a different time or resource.");
      return;
    }

    booking.id = `BKG-${1000 + state.bookings.length + 1}`;
    booking.status = "Pending";
    booking.attachments = form.getAll("attachments").filter((f) => f.name).length;
    booking.outsideBusinessHours = restrictedHours ? "Yes" : "No";

    state.bookings.unshift(booking);
    state.activity.unshift(`Booking ${booking.id} submitted by ${booking.tenantName}. Email notice sent.`);
    if (restrictedHours) state.activity.unshift(`Booking ${booking.id} flagged for after-hours prearrangement review.`);
    if (booking.heavyArticles === "Yes") state.activity.unshift(`Booking ${booking.id} includes heavy article movement and requires landlord consent.`);
    if (booking.dockLevelerRequired === "Yes") state.activity.unshift(`Booking ${booking.id} includes dock leveler use (LD3) and needs dock safety compliance review.`);

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
  <ul><li>Loading Dock 1 (LD1)</li><li>Loading Dock 2 (LD2)</li><li>Loading Dock 3 (LD3 - includes dock leveler)</li><li>Service Elevator (single shared freight elevator)</li></ul>
  <h3>Core Rules</h3>
  <ul>
    <li>Deliveries must only use routes designated by Landlord.</li>
    <li>Furniture, equipment, and substantial supplies must use loading dock + freight elevator under building staff supervision.</li>
    <li>No storage in common areas, pathways, dock, parking, or sidewalks.</li>
    <li>Tenant is responsible for delivery-caused damage repair costs.</li>
    <li>Delivery vehicles must use only Landlord-designated areas.</li>
  </ul>
  <h3>Dock & Freight Operations</h3>
  <ul>
    <li>Loading dock operating hours are 6:00 AM – 6:00 PM unless prearranged in writing.</li>
    <li>Large deliveries are prearranged and prohibited on passenger elevators.</li>
    <li>Only roll-on / roll-off deliveries are permitted during normal business hours unless preapproved otherwise.</li>
    <li>Maximum 60-minute dock occupancy unless approved by Property Management.</li>
    <li>Vehicles must be powered off during loading/unloading and follow posted signs and dock staff direction.</li>
  </ul>
  <h3>Safety & Equipment</h3>
  <ul>
    <li>Hand trucks/carts require non-damaging pneumatic rubber tires and side guards.</li>
    <li>Dock leveler is available only at LD3; safety signs, limits, post-use inspection, cleaning, and secured return position are mandatory.</li>
    <li>Heavy equipment, safes, UPS, batteries, and similar articles require Landlord consent and may require engineer-designated placement.</li>
  </ul>
  <h3>Email Notifications</h3><p>Automatic emails are sent on submission, approval, denial, and proposed alternatives.</p>
  <h3>Statuses</h3><p>Pending, Approved, Denied, Alternative Time Proposed, Cancelled, Completed.</p>
  </div>`;
}
