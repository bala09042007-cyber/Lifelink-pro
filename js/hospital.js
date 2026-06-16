// ===============================
// LOGIN FUNCTION (GLOBAL)
// ===============================
function login() {
    var id = document.getElementById("hospitalId").value;
    var pwd = document.getElementById("password").value;

    if (id === "hosp00" && pwd === "0000") {
        localStorage.setItem("hospitalLoggedIn", "true");
        window.location.href = "donor-entry.html";
    } else {
        alert("Invalid login details");
    }
}

// ===============================
// MASKING FUNCTIONS
// ===============================

// Aadhaar masking -> XXXXXXXX1234
function maskAadhaar(aadhaar) {
    if (!aadhaar) return "";
    return aadhaar.replace(/^(\d{8})(\d{4})$/, "XXXXXXXX$2");
}

// PAN masking -> XXXXX1234X
function maskPAN(pan) {
    if (!pan) return "";
    return pan.replace(/^(.{5})(.{4})(.{1})$/, "XXXXX$2X");
}

// Phone masking -> XXXX XXX XXXX
function maskPhone(phone) {
    if (!phone) return "";
    return phone.replace(/^(\d{4})(\d{3})(\d{3,4})$/, "XXXX $2 $3");
}


// ===============================
// DONOR FORM HANDLING
// ===============================
document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("donorForm");

    if (form) {

        form.addEventListener("submit", function (event) {
            event.preventDefault();

           const donorData = {
    name: document.getElementById("name").value,
    age: document.getElementById("age").value,
    phone: maskPhone(document.getElementById("phone").value),
    address: document.getElementById("address").value,
    pincode: document.getElementById("pincode").value,
    aadhaar: maskAadhaar(document.getElementById("aadhaar").value),
    pan: maskPAN(document.getElementById("pan").value),
    organType: document.getElementById("organType").value,
    bloodGroup: document.getElementById("bloodGroup").value
            };
            
            // Save for search page (localStorage)
var donors = JSON.parse(localStorage.getItem("donors")) || [];

donors.push({
    name: donorData.name,
    bloodGroup: donorData.bloodGroup,
    organ: donorData.organType
});

localStorage.setItem("donors", JSON.stringify(donors));
            fetch("http://localhost:5000/submit-donor", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(donorData)
            })
            .then(() => {
                window.location.href = "thankyou.html";
            })
            .catch(() => {
                window.location.href = "thankyou.html";
            });

        });
    }
});

function searchDonor() {

    var type = document.getElementById("type").value;
    var bloodGroup = document.getElementById("bloodGroup").value;
    var organ = document.getElementById("organ").value;

    var donors = JSON.parse(localStorage.getItem("donors")) || [];
    var resultsDiv = document.getElementById("results");

    resultsDiv.innerHTML = "";

    var filtered = donors.filter(function(donor) {

        if (type === "blood" && bloodGroup) {
            return donor.bloodGroup === bloodGroup;
        }

        if (type === "organ" && organ) {
            return donor.organ === organ;
        }

        return false;
    });

    if (filtered.length === 0) {
        resultsDiv.innerHTML = "<p>No donors found.</p>";
        return;
    }

    filtered.forEach(function(donor) {
        resultsDiv.innerHTML += `
            <div class="card">
                <p><strong>Name:</strong> ${donor.name}</p>
                <p><strong>Blood Group:</strong> ${donor.bloodGroup}</p>
                <p><strong>Organ:</strong> ${donor.organ}</p>
                <p><strong>City:</strong> ${donor.city}</p>
            </div>
        `;
    });
}   
