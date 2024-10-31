// package.js
let userPoints = 0; // Variable to store the user's current points

// Function to get query parameters from the URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Function to display current points
function displayCurrentPoint(rankData) {
    userPoints = rankData.point; // Set user's points for later checking
    const currentRankDiv = document.getElementById("currentPoint");
    currentRankDiv.innerHTML = `
        <h3 class="text-lg font-semibold lao_font">ຄະແນນປັດຈຸບັນ</h3>
        <p class="lao_font"><span class="font-semibold text-green-500 lao_font">${formatNumber(userPoints)} ຄະແນນ</span></p>
    `;
}

// Function to load current rank for a specific phone number
async function loadCurrentRank(phoneNumber) {
    try {
        const response = await fetch(`${window.config.baseURL}/rank/${phoneNumber}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const result = await response.json();
        const rankData = result.data;
        displayCurrentPoint(rankData);
    } catch (error) {
        console.error("Error loading current rank:", error);
        document.getElementById("currentPoint").innerHTML = "<p class='text-red-500'>Failed to load current rank</p>";
    }
}

// Load rankings and current rank on page load
document.addEventListener("DOMContentLoaded", () => {
    const phone = getQueryParam("phone");
    loadCurrentRank(phone);
    renderCards(); // Call the function to render cards
});

// Number formatting function
function formatNumber(number) {
    return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0
    }).format(number);
}
// In your package.js file
async function fetchCardData() {
    try {
        const response = await fetch(`${window.config.baseURL}/getPackage`); // Adjust baseURL accordingly
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        if (data.status === "success") {
            renderCards(data.data);
        } else {
            console.error("Failed to fetch card data:", data.message);
        }
    } catch (error) {
        console.error("Error fetching card data:", error);
    }
}

function renderCards(cardData) {
    const cardContainer = document.getElementById("card-container");
    cardContainer.innerHTML = ""; // Clear existing cards to avoid duplication
    cardData.forEach((data) => {
        const card = document.createElement("div");
        card.classList = "bg-white shadow-md rounded-lg overflow-hidden";
        card.innerHTML = `
            <div class="md:p-6 p-4 lao_font">
                <h2 class="text-xl font-bold text-gray-800 mb-2">${data.title}</h2>
                <p class="text-gray-600">${data.detail}</p>
                <button class="mt-4 bg-yellow-200 text-black px-4 py-2 rounded w-full">
                    ${formatNumber(data.points)} ຄະແນນ
                </button>
            </div>
        `;
        // Add event listener for button clicks
        card.querySelector("button").addEventListener("click", () => handleButtonClick(data));
        cardContainer.appendChild(card);
    });
}

function handleButtonClick(data) {
    const phone = getQueryParam("phone"); // Assuming this function retrieves the phone number
    const requiredPoints = data.points;
    if (userPoints >= data.points) {
        Swal.fire({
            title: '<span class="font-semibold lao_font ">ທ່ານຕ້ອງການແລກຄະແນນ?</span>',
            html: `<p class="lao_font ">ເຈົ້າຕ້ອງການແລກ ${data.title} ສຳຫລັບ ${formatNumber(data.points)} ຄະແນນ?</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '<span class="lao_font">ຕົກລົງ!</span>',
            cancelButtonText: '<span class="lao_font">ຍົກເລີກ</span>'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Step 1: Generate Token
                    const tokenResponse = await fetch('https://172.28.26.72:9443/tplusapp/genToken', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ msisdn: phone })
                    });
                    if (!tokenResponse.ok) throw new Error(`Token generation failed with status: ${tokenResponse.status}`);
                    const tokenResult = await tokenResponse.json();
                    const token = tokenResult.accessToken;

                    // Step 2: Register
                    const registerResponse = await fetch('https://172.28.26.72:9443/tplusapp/RegisterPackageForgame', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ point: data.points })
                    });

                    const registerData = await registerResponse.json();
                    const detail = registerData; // No need to call json() again

                    if (detail.resultCode == 200) {
                        Swal.fire({
                            title: '<span class="font-semibold lao_font">ແລກສຳເລັດ!</span>',
                            html: `<p class="lao_font">${data.title} ທີ່ທ່ານເລືອກ.</p>`,
                            icon: 'success'
                        }).then(() => {
                            window.location.reload();
                        });
                    }
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: error,
                    });
                    console.log(error);
                }


            }
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: '<span class="font-semibold lao_font ">ຄະແນນບໍ່ພຽງພໍ</span>',
            html: `<p class="lao_font ">ທ່ານຕ້ອງການ ${formatNumber(data.points)} ຍອດຍັງເຫລືອ${formatNumber(userPoints)} ຄະແນນ.</p>`,
        });
    }
}

// Load data on page load
document.addEventListener("DOMContentLoaded", () => {
    fetchCardData(); // Fetch and render card data
});