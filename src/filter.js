// Using the API_BASE_URL from project.js
$(function () {
    const API_BASE_URL = 'http://localhost:5000';  // Updated to use local server

    // When the price range slider is changed
    $(document).on("input", "#priceRange", function (e) {
        const priceValue = e.target.value;
        // Update the current price displayed in the label and span
        $("#currentPrice").text("₹" + priceValue); // Update the label for the price
    });

    // When the "Apply Filters" button is clicked
    $(document).on("click", "#btnApplyFilters", function () {
        // Get the filter values from the form
        const price = $("#priceRange").val();
        const bedrooms = $("#bedrooms").val();
        const bathrooms = $("#bathrooms").val();
        const propertyType = $("#propertyType").val();
        const bachelorsAllowed = $("#bachelorsAllowed").val();
        const furnished = $("#furnished").val();
        const parking = $("#parking").val();

        // Show loading state
        $("#roomsContainer").html('<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>');

        // Construct the query parameters
        let queryParams = new URLSearchParams();
        
        if (price) queryParams.append('price', price);
        if (bedrooms && bedrooms !== 'any') queryParams.append('bedrooms', bedrooms);
        if (bathrooms && bathrooms !== 'any') queryParams.append('bathrooms', bathrooms);
        if (propertyType && propertyType !== 'any') queryParams.append('propertyType', propertyType);
        if (bachelorsAllowed && bachelorsAllowed !== 'any') queryParams.append('bachelorsAllowed', bachelorsAllowed);
        if (furnished && furnished !== 'any') queryParams.append('furnished', furnished);
        if (parking && parking !== 'any') queryParams.append('parking', parking);

        // Send AJAX request
        $.ajax({
            url: `${API_BASE_URL}/get-filtered-rooms?${queryParams.toString()}`,
            type: "GET",
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            success: function (rooms) {
                // Clear the existing rooms
                $("#roomsContainer").empty();

                if (rooms.length === 0) {
                    $("#roomsContainer").append(`
                        <div class="alert alert-info text-center" role="alert">
                            <i class="bi bi-info-circle me-2"></i>
                            No rooms found matching your criteria. Try adjusting your filters.
                        </div>
                    `);
                    return;
                }

                // Loop through the rooms and render them
                rooms.forEach(function (room) {
                    const roomImage = room.image ? `${API_BASE_URL}/${room.image}` : 'https://via.placeholder.com/150';
                    const card = `
    <div class="col-12 col-md-4 col-lg-4 mb-4"> 
        <div class="card room-card" style="max-width: 300px; margin: 0px auto 5px auto; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <!-- Card Header -->
            <div class="card-header p-0" style="height: 200px; border-bottom: 1px solid #ddd;">
                <img src="${roomImage}" class="card-img-top room-card-img showCard" alt="Room Image" 
                     style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" 
                     data-room-id="${room.RoomId}"
                     onerror="this.src='https://via.placeholder.com/150'">
            </div>
            
            <!-- Card Body -->
            <div class="card-body" style="height: 120px; overflow: hidden; padding: 10px;">
                <h6 class="card-title" style="font-size: 14px; font-weight: 500; margin-bottom: 10px; margin-left: 5px">${room.Description}</h6>
                
                <!-- Room Details -->
                <div class="row">
                    <div class="col-6" style="font-size: 12px; text-align: center;">
                        <p class="card-text mb-0">Price</p> 
                        <p class="card-text fw-bold mt-0 mb-2">₹${room.Price}</p> 
                    </div>
                    <div class="col-6" style="font-size: 12px; text-align: center;">
                        <p class="card-text mb-0">Property Type</p> 
                        <p class="card-text fw-bold mt-0 mb-2">${room.PropertyType}</p> 
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-6" style="font-size: 12px; text-align: center;">
                        <p class="card-text mb-0">Bedrooms</p>
                        <p class="card-text fw-bold mt-0">${room.Bedrooms}</p>
                    </div>
                    <div class="col-6" style="font-size: 12px; text-align: center;">
                        <p class="card-text mb-0">Bathrooms</p>
                        <p class="card-text fw-bold mt-0">${room.Bathrooms}</p>
                    </div>
                </div>
            </div>
            
            <div class="card-footer d-flex justify-content-between" style="border-top: 1px solid #ddd; padding: 5px 10px; height: 50px;">
                <button value="${room.RoomId}" class="btn btn-warning w-50 bi bi-pen-fill" id="btnEdit" style="margin-right: 5px; padding: 5px 10px;">Edit</button>
                <button value="${room.RoomId}" class="btn btn-danger w-50 bi bi-trash-fill" id="btnDelete" style="padding: 5px 10px;">Delete</button>
            </div>
        </div>
    </div>`;
                    $("#roomsContainer").append(card);
                });
            },
            error: function(xhr, status, error) {
                console.error('Error fetching filtered rooms:', {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseText: xhr.responseText
                });
                $("#roomsContainer").html(`
                    <div class="alert alert-danger" role="alert">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Error loading rooms. Please try again later.
                    </div>
                `);
            }
        });
    });

    // Update hourly rate when slider changes
    $(document).on('change', "#hourlyRate", function () {
        const price = $(this).val();
        $('#currentHourlyRate').text(price);
    });
});
