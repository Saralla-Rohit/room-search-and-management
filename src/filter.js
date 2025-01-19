// Define API URL based on environment
const API_URL = window.location.hostname === 'room-search-and-management.onrender.com' 
    ? 'https://roomify-backend.onrender.com'  // Production backend URL
    : 'http://127.0.0.1:5000';               // Local development backend URL

$(function () {
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

        // Construct the query parameters
        let queryParams = new URLSearchParams();

        // Add price filter if defined
        if (price && price !== '') {
            queryParams.append('price', price);
        }

        // Add bedrooms filter if defined
        if (bedrooms && bedrooms !== '') {
            queryParams.append('bedrooms', bedrooms);
        }

        // Add bathrooms filter if defined
        if (bathrooms && bathrooms !== '') {
            queryParams.append('bathrooms', bathrooms);
        }

        // Add propertyType filter if defined
        if (propertyType && propertyType !== '') {
            queryParams.append('propertyType', propertyType);
        }

        // Add bachelorsAllowed filter if defined
        if (bachelorsAllowed && bachelorsAllowed !== '') {
            queryParams.append('bachelorsAllowed', bachelorsAllowed);
        }

        // Add furnished filter if defined
        if (furnished && furnished !== '') {
            queryParams.append('furnished', furnished);
        }

        // Add parking filter if defined
        if (parking && parking !== '') {
            queryParams.append('parking', parking);
        }

        // Send AJAX request with the constructed query parameters
        $.ajax({
            url: `${API_URL}/get-filtered-rooms?${queryParams.toString()}`,
            type: "GET",
            success: function (rooms) {
                // Clear the existing rooms in the container
                $("#roomsContainer").empty();

                // Check if there are any rooms returned
                if (rooms.length === 0) {
                    // If no rooms found, show a message
                    $("#roomsContainer").append('<p class="text-center w-100">No rooms found matching your criteria.</p>');
                } else {
                    // Loop through the rooms and render them
                    rooms.forEach(function (room) {
                        const roomImage = room.image ? `${API_URL}/${room.image}` : 'https://via.placeholder.com/150';

                        const card = `
    <div class="col-12 col-md-4 col-lg-4 mb-4"> 
        <div class="card room-card" style="max-width: 300px; margin: 0px auto 5px auto; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            
            <!-- Card Header -->
            <div class="card-header p-0" style="height: 200px; border-bottom: 1px solid #ddd;">
                <img src="${roomImage}" class="card-img-top room-card-img showCard" alt="Room Image" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" data-room-id="${room.RoomId}">
            </div>
            
            <!-- Card Body -->
            <div class="card-body" style="height: 120px; overflow: hidden; padding: 10px;">
                <h6 class="card-title" style="font-size: 14px; font-weight: 500; margin-bottom: 10px; margin-left: 5px">${room.Description}</h6>
                
                <!-- Row for Price, Property Type, Bedrooms, and Bathrooms -->
                <div class="row">
                    <div class="col-6" style="font-size: 12px; text-align: center;">
                        <p class="card-text" style="margin-bottom: 0px;">Price</p> 
                        <p class="card-text" style="font-weight: 500; margin-top: -2px; margin-bottom: 7px;">₹${room.Price}</p> 
                    </div>
                    <div class="col-6" style="font-size: 12px; text-align: center;">
                        <p class="card-text" style="margin-bottom: 0px;">Property Type</p> 
                        <p class="card-text" style="font-weight: 500; margin-top: -2px; margin-bottom: 7px;">${room.PropertyType}</p> 
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-6" style="font-size: 12px; text-align: center;">
                        <p class="card-text" style="margin-bottom: 0px;margin-top: 5px">Bedrooms</p> 
                        <p class="card-text" style="font-weight: 500; margin-top: -2px; margin-bottom: 0px">${room.Bedrooms}</p> 
                    </div>
                    <div class="col-6" style="font-size: 12px; text-align: center;">
                        <p class="card-text" style="margin-bottom: 0px; margin-top: 5px">Bathrooms</p> 
                        <p class="card-text" style="font-weight: 500; margin-top: -2px;">${room.Bathrooms}</p> 
                    </div>
                </div>
            </div>
            
            <!-- Card Footer -->
            <div class="card-footer d-flex justify-content-between" style="border-top: 1px solid #ddd; padding: 5px 10px; height: 50px;">
                <button value="${room.RoomId}" class="btn btn-warning w-50 bi bi-pen-fill" id="btnEdit" style="margin-right: 5px; padding: 5px 10px;">Edit</button>
                <button value="${room.RoomId}" class="btn btn-danger w-50 bi bi-trash-fill" id="btnDelete" style="padding: 5px 10px;">Delete</button>
            </div>
    
        </div>
    </div>`;

                        // Append the generated card to the rooms container
                        $("#roomsContainer").append(card);
                    });
                }
            },
            error: function (xhr, status, error) {
                console.error('Error fetching filtered rooms:', error);
                $("#roomsContainer").empty().append('<p class="text-center w-100 text-danger">Error fetching rooms. Please try again.</p>');
            }
        });
    });

    // Update hourly rate when slider changes
    $(document).on('change', "#hourlyRate", function () {
        const price = $(this).val();
        $('#currentHourlyRate').text(price);
    });
});
