$(function () {
    // Define API base URL
    const API_BASE_URL = 'http://localhost:5000';  // Updated to use local server

    function loadView(url) {
        $.ajax({
            method: "get",
            url: url,
            success: (resp) => {
                $("section").html(resp);
            },
            error: (err) => {
                console.error('Error loading view:', err);
            }
        });
    }

    function GetRooms(UserId) {
        if (!UserId) {
            console.error('No user ID provided');
            return;
        }
        $.ajax({
            method: "get",
            url: `${API_BASE_URL}/get-rooms/${UserId}`,
            success: (rooms) => {
                if (!Array.isArray(rooms)) {
                    console.error('Expected array of rooms, got:', rooms);
                    return;
                }
                $("#lblUserId").html($.cookie("username")); // Display the logged-in user's name
                $("#roomsContainer").empty(); // Clear the rooms container before appending new data

                rooms.forEach(room => {
                    const roomImage = room.image ? `${API_BASE_URL}/${room.image}` : 'https://via.placeholder.com/150';  // Fallback image if no image is available
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

                    $("#roomsContainer").append(card);
                });
            },
            error: (err) => {
                console.error('Error fetching rooms:', err);
            }
        });
    }

    // Check if user is logged in
    const UserId = $.cookie("UserId");
    if (UserId) {
        loadView("user-dashboard.html");
        GetRooms(UserId);
    } else {
        loadView("home.html");
    }

    $(document).on("click", "#btnCreateAccount", () => {
        loadView("register.html");
    });

    $(document).on("click", "#btnSignin", () => {
        loadView("login.html");
    });

    $(document).on("click", "#btnCancel", () => {
        loadView("home.html");
    });

    $(document).on("click", "#btnRegister", () => {
        var user = {
            UserId: $("#txtRUserId").val(),
            UserName: $("#txtRUserName").val(),
            Password: $("#txtRPassword").val(),
            Email: $("#txtREmail").val(),
            Mobile: $("#txtRMobile").val()
        };

        $.ajax({
            method: "post",
            url: `${API_BASE_URL}/register-user`,
            data: user,
            success: () => {
                alert("Registered Successfully..");
                loadView("user-login.html");
            }
        });
    });

    $(document).on("keyup", "#txtRUserId", (e) => {
        console.log("User Id Typed: ", e.target.value);
        $.ajax({
            method: "get",
            url: `${API_BASE_URL}/users`,
            success: (users) => {
                for (var user of users) {
                    if (user.UserId == e.target.value) {
                        $("#lblUserIdError")
                            .html("User Id already exist - try another")
                            .addClass("text-danger");
                        break;
                    } else {
                        $("#lblUserIdError")
                            .html("User Id available")
                            .removeClass("text-danger")
                            .addClass("text-success");
                    }
                }
            }
        });
    });

    $(document).on("click", "#btnLogin", () => {
        var UserId = $("#txtLUserId").val();
        var password = $("#txtLPassword").val();

        $.ajax({
            method: "get",
            url: `${API_BASE_URL}/users`,
            success: (users) => {
                var user = users.find(rec => rec.UserId == UserId);
                if (user) {
                    if (user.Password == password) {
                        $.cookie("UserId", user.UserId);
                        $.cookie("username", user.UserName);
                        loadView("user-dashboard.html");
                        GetRooms(user.UserId);
                    } else {
                        alert("Invalid password");
                    }
                } else {
                    alert("User not found");
                }
            },
            error: function(xhr, status, error) {
                console.error("API Error:", {status, error, response: xhr.responseText});
                if (xhr.status === 404) {
                    alert("Error: The user service is currently unavailable. Please try again later.");
                } else if (xhr.status === 0) {
                    alert("Error: Cannot connect to the server. Please check if the server is running.");
                } else {
                    alert("Error: " + (xhr.responseJSON?.message || error || "An unexpected error occurred"));
                }
            }
        });
    });

    $(document).on("click", "#btnSignout", () => {
        $.removeCookie("username");
        $.removeCookie("UserId");
        loadView("login.html");
    });

    $(document).on("click", "#btnNewRoom", () => {
        loadView("add-room.html");
    });

    $(document).on("click", "#btnCancelRoom", () => {
        loadView("user-dashboard.html");
        GetRooms($.cookie("UserId"));
    });

    // Prevent any form submissions globally
    $(document).on('submit', 'form', function (e) {
        e.preventDefault();
        return false;
    });

    // Handle room addition
    $(document).on('click', '#btnAddRoom', function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Create FormData object
        const formData = new FormData();

        // Get file input
        const fileInput = $('#fileRoomImage')[0];
        if (fileInput && fileInput.files[0]) {
            formData.append('image', fileInput.files[0]);
        }

        // Add form data
        formData.append('RoomId', $('#txtRoomId').val());
        formData.append('Description', $('#txtDescription').val());
        formData.append('Price', $('#txtPrice').val());
        formData.append('Bedrooms', $('#txtBedrooms').val());
        formData.append('Bathrooms', $('#txtBathrooms').val());
        formData.append('Furnished', $('#chkFurnished').prop('checked').toString());
        formData.append('Parking', $('#chkParking').prop('checked').toString());
        formData.append('BachelorsAllowed', $('#chkBachelorsAllowed').prop('checked').toString());
        formData.append('PropertyType', $('#selPropertyType').val() || null);
        formData.append('Contact', $('#txtContact').val() || null);
        formData.append('UserId', $.cookie('UserId'));

        // Log the form data for debugging
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        // Send AJAX request
        $.ajax({
            url: `${API_BASE_URL}/add-room`,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                console.log('Room added successfully:', response);
                alert('Room Added Successfully');
                loadView("user-dashboard.html");
                GetRooms($.cookie('UserId'));
            },
            error: function (xhr, status, error) {
                console.error('Error adding room:', error);
                console.error('Server response:', xhr.responseText);
                alert('Error adding room. Please try again.');
            }
        });

        return false;
    });

    $(document).on("click", "#btnEdit", (e) => {
        const roomId = e.target.value;
        if (!roomId) {
            console.error("No room ID found");
            return;
        }

        loadView("edit-room.html");
        $.ajax({
            method: "get",
            url: `${API_BASE_URL}/get-room/${roomId}`,
            success: (room) => {
                if (!room) {
                    console.error("No room data received");
                    return;
                }

                try {
                    // Populate the form fields with the room data
                    $("#txtRoomId").val(room.RoomId);
                    $("#txtDescription").val(room.Description);
                    $("#txtPrice").val(room.Price);
                    $("#txtBedrooms").val(room.Bedrooms);
                    $("#txtBathrooms").val(room.Bathrooms);
                    $("#chkFurnished").prop('checked', room.Furnished === "Yes");
                    $("#chkParking").prop('checked', room.Parking === "Yes");
                    $("#chkBachelorsAllowed").prop('checked', room.BachelorsAllowed === "Yes");
                    $("#selPropertyType").val(room.PropertyType);
                    $("#txtContact").val(room.Contact);

                    if (room.image) {
                        const roomImage = `${API_BASE_URL}/${room.image}`;
                        $("#imgRoomPreview").attr("src", roomImage).show();
                    } else {
                        $("#imgRoomPreview").hide();
                    }
                } catch (error) {
                    console.error("Error populating form:", error);
                    alert("Error loading room details. Please try again.");
                }
            },
            error: (err) => {
                console.error("Error retrieving room data:", err);
                alert("Failed to load room details.");
            }
        });
    });

    $(document).on("click", "#btnSave", () => {
        const roomId = $("#txtRoomId").val();
        if (!roomId) {
            console.error("No room ID found");
            return;
        }

        const formData = new FormData();
        formData.append("RoomId", roomId);
        formData.append("Description", $("#txtDescription").val());
        formData.append("Price", $("#txtPrice").val());
        formData.append("Bedrooms", $("#txtBedrooms").val());
        formData.append("Bathrooms", $("#txtBathrooms").val());
        formData.append("Furnished", $("#chkFurnished").prop('checked')); // Boolean value
        formData.append("Parking", $("#chkParking").prop('checked')); // Boolean value
        formData.append("BachelorsAllowed", $("#chkBachelorsAllowed").prop('checked')); // Boolean value
        formData.append("PropertyType", $("#selPropertyType").val());
        formData.append("Contact", $("#txtContact").val());
        formData.append("UserId", $.cookie("UserId"));

        const fileInput = $("#fileRoomImage")[0].files[0];
        if (fileInput) {
            formData.append("image", fileInput);
        }

        $.ajax({
            method: "put",
            url: `${API_BASE_URL}/edit-room/${roomId}`,
            data: formData,
            processData: false,
            contentType: false,
            success: () => {
                alert("Room Updated Successfully");
                loadView("user-dashboard.html");
                GetRooms($.cookie("UserId"));
            },
            error: (err) => {
                console.error("Error updating room:", err);
                alert("Error updating room. Please try again.");
            }
        });
    });

    $(document).on("click", "#btnDelete", (e) => {
        loadView("delete-room.html");
        const roomId = e.target.value;

        $.ajax({
            method: "get",
            url: `${API_BASE_URL}/get-room/${roomId}`,
            success: (room) => {
                $("#txtDRoomId").val(room.RoomId);
                $("#lblDRoomTitle").text(room.Description);
                $("#lblDRoomDescription").text(room.Description);
                $("#lblDRoomPrice").text(`₹${room.Price}`);
                $("#lblDRoomBedrooms").text(room.Bedrooms);
                $("#lblDRoomBathrooms").text(room.Bathrooms);
                $("#lblDRoomPropertyType").text(room.PropertyType);
                $("#lblDContact").text(room.Contact);
            }
        });
    });

    $(document).on("click", "#btnConfirmDeleteRoom", () => {
        const roomId = $("#txtDRoomId").val();

        $.ajax({
            method: "delete",
            url: `${API_BASE_URL}/delete-room/${roomId}`,
            success: () => {
                alert("Room Deleted Successfully");
                loadView("user-dashboard.html");
                GetRooms($.cookie("UserId"));
            },
            error: (err) => {
                console.error("Error deleting room:", err);
                alert("There was an error while deleting the room. Please try again.");
            }
        });
    });

    $(document).on("click", "#btnCancelDeleteRoom", () => {
        loadView("user-dashboard.html");
        GetRooms($.cookie("UserId"));
    });

    $(document).on("click", "#btnEditCancel", () => {
        loadView("user-dashboard.html");
        GetRooms($.cookie("UserId"));
    });
    $(document).on("click", ".showCard", (e) => {
        const roomId = $(e.target).data("room-id");  // Get the room ID directly from the clicked image

        if (!roomId) {
            console.error("No room ID found on clicked element");
            return;
        }

        // Load the show-room page and wait for it to complete before making the AJAX request
        $.ajax({
            method: "get",
            url: "show-room.html",
            success: (resp) => {
                $("section").html(resp);

                // Now that the page is loaded, make the AJAX request for room details
                $.ajax({
                    method: "get",
                    url: `${API_BASE_URL}/get-room/${roomId}`,
                    success: (room) => {
                        if (!room) {
                            console.error("No room data received");
                            alert("Failed to load room details. Please try again.");
                            return;
                        }

                        try {
                            // Populate the page with room details
                            $("#lblRoomId").text(room.RoomId || '');  // Room ID
                            $("#lblRoomDescription").text(room.Description || '');  // Room Description
                            $("#lblRoomPrice").text(room.Price ? `₹${room.Price}` : '');  // Room Price
                            $("#lblRoomBedrooms").text(room.Bedrooms ? `${room.Bedrooms} Bedrooms` : '');  // Number of Bedrooms
                            $("#lblRoomBathrooms").text(room.Bathrooms ? `${room.Bathrooms} Bathrooms` : '');  // Number of Bathrooms
                            $("#lblRoomPropertyType").text(room.PropertyType || '');  // Property Type
                            $("#lblRoomFurnished").text(room.Furnished ? 'Yes' : 'No');  // Furnished status
                            $("#lblRoomParking").text(room.Parking ? 'Yes' : 'No');  // Parking status
                            $("#lblRoomBachelors").text(room.BachelorsAllowed ? 'Yes' : 'No');  // Bachelors Allowed status
                            $("#lblContact").text(room.Contact || '');  // Contact Info

                            // Display the image
                            const roomImage = room.image ? `${API_BASE_URL}/${room.image}` : 'https://via.placeholder.com/150';
                            $("#imgRoomPreview").attr("src", roomImage).show();  // Show the image in the img tag
                        } catch (error) {
                            console.error("Error populating room details:", error);
                            alert("Error displaying room details. Please try again.");
                        }
                    },
                    error: (err) => {
                        console.error("Error fetching room details:", err);
                        alert("Failed to load room details. Please try again.");
                    }
                });
            },
            error: (err) => {
                console.error("Error loading show room page:", err);
                alert("Failed to load room view page. Please try again.");
            }
        });
    });

    $(document).on("click", "#btnCloseRoomDetails", () => {
        loadView("user-dashboard.html");
        GetRooms($.cookie("UserId"));
    });

    $('#priceRange').on('input', function () {
        const price = $(this).val();
        $('#priceRangeValue').text(price);
        filters.price = price;
    });
    // ----------------------------------------------------------------------
});
