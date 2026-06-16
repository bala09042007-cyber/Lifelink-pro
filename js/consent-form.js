(function () {
  'use strict';

  var FORM_STORAGE_KEY = 'lifelink_donors';

  function getStoredDonors() {
    try {
      var raw = localStorage.getItem(FORM_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveDonor(donor) {
    var list = getStoredDonors();
    donor.id = 'local_' + Date.now();
    donor.registeredDate = new Date().toISOString().slice(0, 10);
    list.push(donor);
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(list));
  }

  var form = document.getElementById('consent-form');
  var formContainer = document.getElementById('form-container');
  var thankYou = document.getElementById('thank-you');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (document.getElementById('name') && document.getElementById('name').value) || '';
      var bloodGroup = (document.getElementById('bloodGroup') && document.getElementById('bloodGroup').value) || '';
      var organ = (document.getElementById('organ') && document.getElementById('organ').value) || '';
      var hospital = (document.getElementById('hospital') && document.getElementById('hospital').value) || '';
      var contact = (document.getElementById('contact') && document.getElementById('contact').value) || '';
      var conditions = (document.getElementById('conditions') && document.getElementById('conditions').value) || '';
      var medications = (document.getElementById('medications') && document.getElementById('medications').value) || '';
      var allergies = (document.getElementById('allergies') && document.getElementById('allergies').value) || '';
      var bloodPressure = (document.getElementById('bloodPressure') && document.getElementById('bloodPressure').value) || '';
      var previousSurgeries = (document.getElementById('previousSurgeries') && document.getElementById('previousSurgeries').value) || '';
      var healthNotes = (document.getElementById('healthNotes') && document.getElementById('healthNotes').value) || '';

      var donor = {
        name: name,
        bloodGroup: bloodGroup,
        organ: organ,
        hospitalName: hospital,
        contact: contact,
        health: {
          conditions: conditions,
          medications: medications,
          allergies: allergies,
          bloodPressure: bloodPressure,
          previousSurgeries: previousSurgeries,
          notes: healthNotes
        },
        contactViaHospital: true
      };

      saveDonor(donor);

      if (formContainer) formContainer.style.display = 'none';
      if (thankYou) thankYou.style.display = 'block';
    });
  }
})();
