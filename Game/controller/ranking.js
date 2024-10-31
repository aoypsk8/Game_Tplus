var phoneNumberUser;
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Function to render users in the list
function renderUserList(users) {
    const userList = document.getElementById("userList");
    userList.innerHTML = "";

    users.forEach((user, index) => {
        const userItem = document.createElement("li");
        userItem.classList.add("flex", "items-center", "justify-between", "py-2", "border-b", "border-gray-300");
        userItem.innerHTML = `
            <div class="flex items-center">
                <span class="text-lg font-semibold mr-4">${index + 1}</span>
                <span class="text-gray-800 font-semibold">${user.phonenumber || 'User'}</span>
            </div>
            <span class="text-green-500 font-semibold">${user.point} Points</span>
        `;
        userList.appendChild(userItem);
    });
}
function displayCurrentRank(rankData) {
    const currentRankDiv = document.getElementById("currentRank");
    currentRankDiv.innerHTML = `
        <h3 class="text-lg font-semibold lao_font">ຄະແນນປັດຈຸບັນ</h3>
        <p class="lao_font">ອັນດັບທີ່ : <span class="font-semibold text-green-500 lao_font">${rankData.rank}</span></p>
    `;
}

function displayCurrentPoint(rankData) {
    const currentRankDiv = document.getElementById("currentPoint");
    currentRankDiv.innerHTML = `
        <h3 class="text-lg font-semibold lao_font">ຄະແນນປັດຈຸບັນ</h3>
        <p class="lao_font">ອັນດັບທີ່ : <span class="font-semibold text-green-500 lao_font">${rankData.point} ຄະແນນ</span></p>
    `;
}


async function loadRankings() {
    try {
        const response = await fetch(`${window.config.baseURL}/getRanking`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();
        const rankings = result.data;
        if (Array.isArray(rankings)) {
            renderUserList(rankings);
        } else {
            throw new Error("API response is not an array");
        }
    } catch (error) {
        console.error("Error loading rankings:", error);
        document.getElementById("userList").innerHTML = "<li class='text-red-500'>Failed to load rankings</li>";
    }
}

// Function to load current rank for a specific phone number
async function loadCurrentRank(phoneNumber) {
    try {
        const response = await fetch(`${window.config.baseURL}/rank/${phoneNumber}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const result = await response.json();
        const rankData = result.data; // Access the rank data from the response

        displayCurrentRank(rankData);
    } catch (error) {
        console.error("Error loading current rank:", error);
        document.getElementById("currentRank").innerHTML = "<p class='text-red-500'>Failed to load current rank</p>";
    }
}

// Load rankings and current rank on page load
document.addEventListener("DOMContentLoaded", () => {
    const phone = getQueryParam("phone");
    loadRankings();
    loadCurrentRank(phone); // Replace with the specific phone number as needed
});
