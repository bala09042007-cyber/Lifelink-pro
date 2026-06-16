console.log("Live Organ JS Loaded");
(function () {
  'use strict';

  var HOSPITAL_PIN = 'hospital123';
  var STORAGE_KEY = 'lifelink_hospital_verified';
  var donors = [];
  var hospitals = [];
  var userPosition = null;
  var userMarker = null;

  function haversineKm(lat1, lng1, lat2, lng2) {
    var R = 6371;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLng = (lng2 - lng1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
             Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function sortHospitalsByDistance(lat, lng) {
    return hospitals.slice().map(function (h) {
      return { hospital: h, distance: haversineKm(lat, lng, h.lat, h.lng) };
    }).sort(function (a, b) { return a.distance - b.distance; });
  }

  function renderNearbyPanel(sortedWithDistance) {
    var panel = document.getElementById('nearby-hospitals-panel');
    var listEl = document.getElementById('nearby-hospitals-list');
    if (!panel || !listEl) return;
    if (!sortedWithDistance || !sortedWithDistance.length) {
      panel.style.display = 'none';
      return;
    }
    var html = '<ul style="margin: 0; padding-left: 1.25rem;">';
    sortedWithDistance.forEach(function (item) {
      var h = item.hospital;
      var dist = item.distance.toFixed(1);
      html += '<li><strong>' + escapeHtml(h.name) + '</strong> — ' + dist + ' km away<br/>' + escapeHtml((h.organsInStock || []).join(', ')) + ' in stock<br/><span style="color: var(--color-text-muted);">' + escapeHtml(h.address || '') + '</span></li>';
    });
    html += '</ul>';
    listEl.innerHTML = html;
    panel.style.display = 'block';
  }

  function isHospitalVerified() {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  }

  function setHospitalVerified(ok) {
    if (ok) sessionStorage.setItem(STORAGE_KEY, '1');
    else sessionStorage.removeItem(STORAGE_KEY);
  }

  function renderHospitalGate() {
    var gate = document.getElementById('hospital-gate');
    var content = document.getElementById('hospital-only-content');
    if (isHospitalVerified()) {
      if (gate) gate.style.display = 'none';
      if (content) {
        content.classList.add('is-visible');
        renderOrganDonorList();
      }
    } else {
      if (gate) gate.style.display = 'block';
      if (content) content.classList.remove('is-visible');
    }
  }

  function initHospitalLogin() {
    var btn = document.getElementById('btn-hospital-login');
    var input = document.getElementById('hospital-pin');
    if (!btn || !input) return;
    btn.addEventListener('click', function () {
      var pin = (input.value || '').trim();
      if (pin === HOSPITAL_PIN) {
        setHospitalVerified(true);
        renderHospitalGate();
        input.value = '';
      } else {
        alert('Invalid PIN. Use demo PIN: hospital123');
      }
    });
  }

  function loadData() {
    return Promise.all([
      fetch('data/donors.json').then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }),
      fetch('data/hospitals.json').then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; })
    ]).then(function (results) {
      donors = results[0];
      hospitals = results[1];
      var fromStorage = [];
      try {
        var raw = localStorage.getItem('lifelink_donors');
        if (raw) fromStorage = JSON.parse(raw);
      } catch (e) {}
      donors = donors.concat(fromStorage);
      return { donors: donors, hospitals: hospitals };
    });
  }

  function initLeafletMap() {
    var mapEl = document.getElementById('map');
    if (!mapEl || !hospitals.length || typeof L === 'undefined') return;
    var centerLat = userPosition ? userPosition.lat : hospitals[0].lat;
    var centerLng = userPosition ? userPosition.lng : hospitals[0].lng;
    var zoom = 11;
    if (userPosition) {
      centerLat = userPosition.lat;
      centerLng = userPosition.lng;
    }
    var map = L.map('map').setView([centerLat, centerLng], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    hospitals.forEach(function (h) {
      var popupHtml = '<strong>' + escapeHtml(h.name) + '</strong><br/>' + escapeHtml(h.address || '') + '<br/>Organs in stock: ' + escapeHtml((h.organsInStock || []).join(', '));
      if (userPosition) {
        var dist = haversineKm(userPosition.lat, userPosition.lng, h.lat, h.lng);
        popupHtml += '<br/><strong>' + dist.toFixed(1) + ' km</strong> from your location';
      }
      L.marker([h.lat, h.lng])
        .addTo(map)
        .bindPopup(popupHtml);
    });
    if (userPosition) {
      addUserMarkerLeaflet(map);
      fitLeafletBounds(map);
    } else if (hospitals.length === 1) {
      map.setZoom(13);
    } else {
      var bounds = L.latLngBounds(hospitals.map(function (h) { return [h.lat, h.lng]; }));
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    }
    window.lifelinkMap = map;
  }

  function addUserMarkerLeaflet(map) {
    if (!userPosition || !map) return;
    if (userMarker) {
      map.removeLayer(userMarker);
      userMarker = null;
    }
    userMarker = L.circleMarker([userPosition.lat, userPosition.lng], {
      radius: 10,
      fillColor: '#0ea5e9',
      color: '#0284c7',
      weight: 2,
      fillOpacity: 1
    }).addTo(map).bindPopup('<strong>You are here</strong><br/>Your exact location');
  }

  function fitLeafletBounds(map) {
    if (!map || !userPosition || !hospitals.length) return;
    var bounds = L.latLngBounds([[userPosition.lat, userPosition.lng]]);
    hospitals.forEach(function (h) {
      bounds.extend([h.lat, h.lng]);
    });
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }

  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function renderOrganDonorSummary() {
    var el = document.getElementById('organ-donor-summary');
    if (!el) return;
    var byOrgan = {};
    donors.forEach(function (d) {
      var o = d.organ || 'Other';
      byOrgan[o] = (byOrgan[o] || 0) + 1;
    });
    var html = '<p>Registered donors by organ (summary):</p><ul style="margin: 0; padding-left: 1.25rem;">';
    Object.keys(byOrgan).forEach(function (o) { html += '<li>' + escapeHtml(o) + ': ' + byOrgan[o] + '</li>'; });
    html += '</ul>';
    el.innerHTML = html;
  }

  function renderOrganDonorList() {
    var el = document.getElementById('organ-donor-list');
    if (!el || !isHospitalVerified()) return;
    var html = '<ul style="margin: 0; padding-left: 1.25rem;">';
    donors.forEach(function (d) {
      html += '<li><strong>' + escapeHtml(d.organ) + '</strong> — ' + escapeHtml(d.bloodGroup || '') + ', Hospital: ' + escapeHtml(d.hospitalName || '') + ' <button type="button" class="btn btn-secondary" data-donor-id="' + d.id + '" style="margin-left: 0.5rem;">View details</button></li>';
    });
    html += '</ul>';
    el.innerHTML = html;
    el.querySelectorAll('[data-donor-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-donor-id');
        var donor = donors.find(function (d) { return String(d.id) === String(id); });
        if (donor) showDonorDetail(donor);
      });
    });
  }

  function showDonorDetail(donor) {
    var health = donor.health || {};
    var msg = 'Donor: ' + (donor.name || 'N/A') + '\nOrgan: ' + (donor.organ || '') + '\nBlood group: ' + (donor.bloodGroup || '') + '\nHospital: ' + (donor.hospitalName || '') + '\n\nHealth:\n- Conditions: ' + (health.conditions || '') + '\n- Medications: ' + (health.medications || '') + '\n- Allergies: ' + (health.allergies || '') + '\n- BP: ' + (health.bloodPressure || '') + '\n- Previous surgeries: ' + (health.previousSurgeries || '') + '\n- Notes: ' + (health.notes || '');
    alert(msg);
  }

  function initCheckAvailability() {
    var btn = document.getElementById('btn-check-availability');
    var result = document.getElementById('availability-result');
    if (!btn || !result) return;
    btn.addEventListener('click', function () {
      result.style.display = 'block';
      result.innerHTML = '<p>Availability (from registry): ' + donors.length + ' donor(s) registered. Use "View details" above to see full health info and availability status per donor.</p>';
    });
  }

  function initNearMe() {
    var btn = document.getElementById('btn-near-me');
    var statusEl = document.getElementById('near-me-status');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
      }
      btn.disabled = true;
      btn.textContent = 'Locating…';
      if (statusEl) statusEl.textContent = 'Getting your location…';
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          var lat = pos.coords.latitude;
          var lng = pos.coords.longitude;
          userPosition = { lat: lat, lng: lng };
          btn.disabled = false;
          btn.textContent = 'Track my location & show nearby hospitals';
          if (statusEl) statusEl.textContent = 'Showing hospitals nearest to you.';

          var sortedWithDistance = sortHospitalsByDistance(lat, lng);
          renderNearbyPanel(sortedWithDistance);

          if (window.lifelinkMap) {
          window.lifelinkMap.setView([lat, lng], 13);
          addUserMarkerLeaflet(window.lifelinkMap);
        } 
        },
        function (err) {
          btn.disabled = false;
          btn.textContent = 'Track my location & show nearby hospitals';
          if (statusEl) statusEl.textContent = '';
          var msg = 'Could not get your location.';
          if (err.code === 1) msg = 'Location permission denied.';
          else if (err.code === 2) msg = 'Location unavailable.';
          else if (err.code === 3) msg = 'Location request timed out.';
          alert(msg);
        }
      );
    });
  }

function runPage() {
  loadData().then(function () {
    window.lifelinkHospitals = hospitals;

    renderOrganDonorSummary();
    renderHospitalGate();
    initHospitalLogin();
    renderOrganDonorList();
    initCheckAvailability();
    initNearMe();

    initLeafletMap();
  });
}

// Run when DOM is ready
document.addEventListener("DOMContentLoaded", runPage);

})();