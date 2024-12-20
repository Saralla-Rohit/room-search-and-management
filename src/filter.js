$(function () {
    $(document).on("input", "#priceRange", function (e) {
        const priceValue = e.target.value;
        // Update the current price displayed in the label and span
        $("#currentPrice").text("$" + priceValue); // Update the label for the price
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
        const query = {
            price: price,
            bedrooms: bedrooms,
            bathrooms: bathrooms,
            propertyType: propertyType,
            bachelorsAllowed: bachelorsAllowed,
            furnished: furnished,
            parking: parking
        };

        // Send an AJAX request to the backend to get the filtered rooms
        $.ajax({
            url: "http://127.0.0.1:5000/get-filtered-rooms",  // Corrected API endpoint
            type: "GET",
            data: query,
            success: function (rooms) {
                // Clear the existing rooms in the container
                $("#roomsContainer").empty();

                // Check if there are any rooms returned
                if (rooms.length === 0) {
                    // If no rooms found, show a message
                    $("#roomsContainer").append('<p>No rooms found matching the filters.</p>');
                } else {
                    // Loop through the rooms and render them
                    rooms.forEach(function (room) {
                        const roomImage = room.image ? `http://127.0.0.1:5000/${room.image}` : 'https://via.placeholder.com/150';  // Fallback image if no image is available

                        const card = `
    <div class="col-12 col-md-6 col-lg-6 mb-4">
        <div class="card room-card" style="max-width: 300px; margin: 0px auto 5px auto; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            
            <!-- Card Header -->
            <div class="card-header p-0" style="height: 200px; border-bottom: 1px solid #ddd;" id="showCard">
                <img src="${roomImage}" class="card-img-top room-card-img" alt="Room Image" style="width: 100%; height: 100%; object-fit: cover;" data-room-id="${room.RoomId}">
            </div>
            
            <!-- Card Body -->
            <div class="card-body" style="height: 120px; overflow: hidden; padding: 10px;">
                <h6 class="card-title" style="font-size: 14px; font-weight: 500; margin-bottom: 10px; margin-left: 5px">${room.Description}</h6>
                
                <!-- Row for Price, Property Type, Bedrooms, and Bathrooms -->
                <div class="row">
                    <!-- Price -->
                    <div class="col-6" style="font-size: 12px; text-align: center;">
                        <p class="card-text" style="margin-bottom: 0px;">Price</p> <!-- Reduced margin-bottom -->
                        <p class="card-text" style="font-weight: 500; margin-top: -2px margin-bottom: 7px;">$${room.Price}</p> <!-- Removed top margin -->
                    </div>
                    <!-- Property Type -->
                    <div class="col-6" style="font-size: 12px; text-align: center;">
                        <p class="card-text" style="margin-bottom: 0px;">Property Type</p> <!-- Reduced margin-bottom -->
                        <p class="card-text" style="font-weight: 500; margin-top: -2px; margin-bottom: 7px;">${room.PropertyType}</p> <!-- Removed top margin -->
                    </div>
                </div>
                
                <div class="row">
                    <!-- Bedrooms -->
                    <div class="col-6" style="font-size: 12px; text-align: center;">
                        <p class="card-text" style="margin-bottom: 0px;margin-top: 5px">Bedrooms</p> <!-- Reduced margin-bottom -->
                        <p class="card-text" style="font-weight: 500; margin-top: -2px; margin-bottom: 0px">${room.Bedrooms}</p> <!-- Removed top margin -->
                    </div>
                    <!-- Bathrooms -->
                    <div class="col-6" style="font-size: 12px; text-align: center;">
                        <p class="card-text" style="margin-bottom: 0px; margin-top: 5px">Bathrooms</p> <!-- Reduced margin-bottom -->
                        <p class="card-text" style="font-weight: 500; margin-top: -2px;">${room.Bathrooms}</p> <!-- Removed top margin -->
                    </div>
                </div>
            </div>
            
            <!-- Card Footer -->
            <div class="card-footer d-flex justify-content-between" style="border-top: 1px solid #ddd; padding: 5px 10px; height: 50px;">
                <button value="${room.RoomId}" class="btn btn-warning w-50 bi bi-pen-fill" id="btnEdit" style="margin-right: 5px; padding: 5px 10px;">Edit</button>
                <button value="${room.RoomId}" class="btn btn-danger w-50 bi bi-trash-fill" id="btnDelete" style="padding: 5px 10px;">Delete</button>
            </div>
    
        </div>
    </div>
`;


                        $("#roomsContainer").append(card);
                    });
                }
            },
            error: function (err) {
                console.error("Error fetching rooms:", err);
            }
        });

    });

})