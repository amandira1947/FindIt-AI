
// ==========================================
// FINDIT AI - COMPLETE FRONTEND JAVASCRIPT
// ==========================================

const API_URL = "http://127.0.0.1:8001";

// ==========================================
// HELPER FUNCTIONS
// ==========================================

async function getAPIResponse(response) {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "API request failed");
    }

    return data;
}

function getImageURL(item) {
    const image = item.image_url || item.image_filename;

    if (!image) return null;

    if (image.startsWith("http")) return image;

    if (image.startsWith("/")) return API_URL + image;

    return API_URL + "/uploads/" + image;
}

// ==========================================
// 1. IMAGE PREVIEW
// ==========================================

const imageInput = document.getElementById("item_image");
const imagePreview = document.getElementById("imagePreview");

if (imageInput && imagePreview) {

    imageInput.addEventListener("change", function () {

        const file = this.files[0];

        if (file) {

            if (!file.type.startsWith("image/")) {
                alert("Please select a valid image.");
                this.value = "";
                imagePreview.style.display = "none";
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert("Image must be smaller than 5 MB.");
                this.value = "";
                imagePreview.style.display = "none";
                return;
            }

            imagePreview.src = URL.createObjectURL(file);
            imagePreview.style.display = "block";

        } else {

            imagePreview.style.display = "none";

        }

    });

}

// ==========================================
// 2. SUBMIT LOST OR FOUND ITEM
// ==========================================

const itemForm = document.getElementById("itemForm");

if (itemForm) {

    itemForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const message = document.getElementById("message");
        const submitButton = itemForm.querySelector(
            'button[type="submit"]'
        );

        const formData = new FormData();

        formData.append(
            "item_type",
            document.getElementById("item_type").value
        );

        formData.append(
            "item_name",
            document.getElementById("item_name").value.trim()
        );

        formData.append(
            "category",
            document.getElementById("category").value
        );

        formData.append(
            "description",
            document.getElementById("description").value.trim()
        );

        formData.append(
            "location",
            document.getElementById("location").value.trim()
        );

        formData.append(
            "item_date",
            document.getElementById("item_date").value
        );

        formData.append(
            "contact",
            document.getElementById("contact").value
        );

        const imageFile = imageInput?.files[0];

        if (imageFile) {

            // IMPORTANT: Backend expects item_image
            formData.append("item_image", imageFile);

        }

        message.textContent = "Submitting your report...";
        message.style.color = "blue";

        submitButton.disabled = true;

        try {

            const response = await fetch(
                `${API_URL}/api/items`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const result = await getAPIResponse(response);

            message.textContent =
                result.message || "Item reported successfully!";

            message.style.color = "green";

            itemForm.reset();

            if (imagePreview) {
                imagePreview.src = "";
                imagePreview.style.display = "none";
            }

            await loadItems();

        } catch (error) {

            message.textContent = "Error: " + error.message;
            message.style.color = "red";

            console.error("Submission error:", error);

        } finally {

            submitButton.disabled = false;

        }

    });

}

// ==========================================
// 3. DISPLAY ALL REPORTED ITEMS
// ==========================================

async function loadItems() {

    const itemsList = document.getElementById("itemsList");

    if (!itemsList) return;

    itemsList.textContent = "Loading items...";

    try {

        const response = await fetch(`${API_URL}/api/items`);

        const result = await getAPIResponse(response);

        itemsList.innerHTML = "";

        const items = result.items || [];

        if (items.length === 0) {

            itemsList.textContent = "No items reported yet.";

            return;

        }

        items.forEach(item => {

            const card = document.createElement("div");
            card.className = "item-card";

            const status = document.createElement("span");
            status.className = "status";
            status.textContent =
                (item.item_type || "Unknown").toUpperCase();

            const title = document.createElement("h3");
            title.textContent = item.item_name || "Unnamed Item";

            card.append(status, title);

            // Item image
            const imageURL = getImageURL(item);

            if (imageURL) {

                const image = document.createElement("img");

                image.src = imageURL;
                image.alt = item.item_name || "Item image";
                image.style.width = "100%";
                image.style.maxWidth = "220px";
                image.style.borderRadius = "12px";
                image.style.margin = "10px 0";

                card.appendChild(image);

            }

            const category = document.createElement("p");
            category.textContent =
                "Category: " + (item.category || "Not specified");

            const description = document.createElement("p");
            description.textContent =
                item.description || "No description";

            const location = document.createElement("p");
            location.textContent =
                "Location: " + (item.location || "Not specified");

            const date = document.createElement("p");
            date.textContent =
                "Date: " + (item.item_date || "Not specified");

            card.append(
                category,
                description,
                location,
                date
            );

            itemsList.appendChild(card);

        });

    } catch (error) {

        itemsList.textContent =
            "Unable to load items. Check your backend server.";

        console.error("Loading items error:", error);

    }

}

// ==========================================
// 4. AI MATCHING RESULTS
// ==========================================

async function loadMatches() {

    const matchesList = document.getElementById("matchesList");

    if (!matchesList) return;

    matchesList.textContent = "Finding possible matches...";

    try {

        const response = await fetch(`${API_URL}/api/matches`);

        const result = await getAPIResponse(response);

        matchesList.innerHTML = "";

        const matches = result.matches || [];

        if (matches.length === 0) {

            matchesList.textContent =
                "No possible matches found yet.";

            return;

        }

        matches.forEach(match => {

            const card = document.createElement("div");
            card.className = "item-card";

            const title = document.createElement("h3");

            title.textContent =
                (match.lost_item?.item_name || "Lost Item") +
                " ↔ " +
                (match.found_item?.item_name || "Found Item");

            const score = document.createElement("h2");

            const matchScore = Number(match.match_score || 0);

            score.textContent =
                matchScore.toFixed(2) + "% Similarity";

            card.append(title, score);

            [match.lost_item, match.found_item].forEach(item => {

                if (!item) return;

                const itemTitle = document.createElement("h4");

                itemTitle.textContent =
                    (item.item_type || "ITEM").toUpperCase();

                const description = document.createElement("p");

                description.textContent =
                    item.description || "No description";

                card.append(itemTitle, description);

                const imageURL = getImageURL(item);

                if (imageURL) {

                    const image = document.createElement("img");

                    image.src = imageURL;
                    image.alt = item.item_name || "Matching item";
                    image.style.width = "100%";
                    image.style.maxWidth = "180px";
                    image.style.borderRadius = "12px";

                    card.appendChild(image);

                }

            });

            const text = document.createElement("p");

            text.textContent =
                "Text similarity: " +
                (match.text_score ?? "N/A") + "%";

            const category = document.createElement("p");

            category.textContent =
                "Category similarity: " +
                (match.category_score ?? "N/A") + "%";

            const location = document.createElement("p");

            location.textContent =
                "Location similarity: " +
                (match.location_score ?? "N/A") + "%";

            const notice = document.createElement("p");

            notice.textContent =
                "Possible match only. Verify ownership before collection.";

            card.append(text, category, location, notice);

            matchesList.appendChild(card);

        });

    } catch (error) {

        matchesList.textContent =
            "Error finding matches. Check the backend.";

        console.error("Matching error:", error);

    }

}

// ==========================================
// 5. CHECK BACKEND CONNECTION
// ==========================================

async function checkBackend() {

    try {

        const response = await fetch(`${API_URL}/api/health`);

        const result = await getAPIResponse(response);

        console.log("FindIt AI Backend:", result.message);

    } catch (error) {

        console.error("Backend connection failed:", error);

    }

}

// ==========================================
// 6. LOAD DATA WHEN WEBSITE OPENS
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    checkBackend();

    loadItems();

});
