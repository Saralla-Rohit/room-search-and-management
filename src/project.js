$(function () {
    function loadView(url) {
        $.ajax({
            method: "get",
            url: url,
            success: (resp) => {
                $("section").html(resp);
            }
        });
    }

    loadView("../public/home.html");

    $(document).on("click", "#btnCreateAccount", () => {
        loadView("../public/register.html");
    });

    $(document).on("click", "#btnSignin", () => {
        loadView("../public/login.html");
    });

    $(document).on("click", "#btnCancel", () => {
        loadView("../public/home.html");
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
            url: "http://127.0.0.1:5000/register-user",
            data: user,
            success: () => {
                alert("Registered Successfully..");
                loadView("../public/user-login.html");
            }
        });
    });

    $(document).on("keyup", "#txtRUserId", (e) => {
        console.log("User Id Typed: ", e.target.value);
        $.ajax({
            method: "get",
            url: "http://127.0.0.1:5000/users",
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

    function GetRooms(UserId) {
        $.ajax({
            method: "get",
            url: `http://127.0.0.1:5000/get-rooms/${UserId}`,
            success: (rooms) => {
                $("#lblUserId").html($.cookie("username")); // Display the logged-in user's name
                $("#roomsContainer").empty(); // Clear the rooms container before appending new data

                rooms.map(room => {
                    const roomImage = room.image ? `http://127.0.0.1:5000/${room.image}` : 'https://via.placeholder.com/150';  // Fallback image if no image is available

                    const card = `
    <div class="col-12 col-md-4 col-lg-4 mb-4"> <!-- Change col-md-6 and col-lg-6 to col-md-4 and col-lg-4 -->
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


                    // Append the card to the rooms container
                    $("#roomsContainer").append(card);
                });

            }
        });
    }

    $(document).on("click", "#btnLogin", () => {
        var userid = $("#txtLUserId").val();
        var password = $("#txtLPassword").val();

        $.ajax({
            method: "get",
            url: "http://127.0.0.1:5000/users",
            success: (users) => {
                var user = users.find(rec => rec.UserId == userid);
                if (user) {
                    if (user.Password == password) {
                        $.cookie("userid", user.UserId);
                        $.cookie("username", user.UserName);
                        loadView("../public/user-dashboard.html");
                        GetRooms(user.UserId);
                    } else {
                        alert("Invalid password");
                    }
                } else {
                    alert("Invalid Login Credentials");
                }
            }
        });
    });

    $(document).on("click", "#btnSignout", () => {
        $.removeCookie("username");
        $.removeCookie("userid");
        loadView("../public/login.html");
    });

    $(document).on("click", "#btnNewRoom", () => {
        loadView("../public/add-room.html");
    });

    $(document).on("click", "#btnCancelRoom", () => {
        loadView("../public/user-dashboard.html");
        GetRooms($.cookie("userid"));
    });

    $(document).on("click", "#btnAddRoom", () => {
        var room = {
            RoomId: $("#txtRoomId").val(),
            Description: $("#txtDescription").val(),
            Price: $("#txtPrice").val(),
            Bedrooms: $("#txtBedrooms").val(),
            Furnished: $("#chkFurnished").prop('checked'),
            Bathrooms: $("#txtBathrooms").val(),
            Parking: $("#chkParking").prop('checked'),
            BachelorsAllowed: $("#chkBachelorsAllowed").prop('checked'),
            PropertyType: $("#selPropertyType").val(),
            UserId: $.cookie("userid")
        };

        var formData = new FormData();
        formData.append("RoomId", room.RoomId);
        formData.append("Description", room.Description);
        formData.append("Price", room.Price);
        formData.append("Bedrooms", room.Bedrooms);
        formData.append("Furnished", room.Furnished);
        formData.append("Bathrooms", room.Bathrooms);
        formData.append("Parking", room.Parking);
        formData.append("BachelorsAllowed", room.BachelorsAllowed);
        formData.append("PropertyType", room.PropertyType);
        formData.append("UserId", room.UserId);

        var fileInput = $("#fileRoomImage")[0].files[0];
        if (fileInput) {
            formData.append("image", fileInput); // Append image to FormData
        }

        $.ajax({
            method: "post",
            url: "http://127.0.0.1:5000/add-room",
            data: formData,
            processData: false, // Don't process the data as it's a FormData object
            contentType: false,
            success: () => {
                alert("Room Added successfully");
                loadView("../public/user-dashboard.html");
                GetRooms($.cookie("userid"));
            }
        });
    });

    $(document).on("click", "#btnEdit", (e) => {
        loadView("../public/edit-room.html");
        $.ajax({
            method: "get",
            url: `http://127.0.0.1:5000/get-room/${e.target.value}`,
            success: (room) => {
                // Populate the form fields with the room data
                $("#txtRoomId").val(room.RoomId);  // Room ID (could be hidden)
                $("#txtDescription").val(room.Description);  // Room Description
                $("#txtPrice").val(room.Price);  // Room Price
                $("#txtBedrooms").val(room.Bedrooms);  // Number of Bedrooms
                $("#txtBathrooms").val(room.Bathrooms);  // Number of Bathrooms
                $("#chkFurnished").prop('checked', room.Furnished); // Furnished checkbox
                $("#chkParking").prop('checked', room.Parking); // Parking checkbox
                $("#chkBachelorsAllowed").prop('checked', room.BachelorsAllowed); // Bachelors Allowed checkbox
                $("#selPropertyType").val(room.PropertyType); // Property Type dropdown

                if (room.image) {
                    const roomImage = `http://127.0.0.1:5000/${room.image}`;
                    $("#imgRoomPreview").attr("src", roomImage).show();  // Show the room image preview
                } else {
                    $("#imgRoomPreview").hide();  // Hide the image preview if there's no image
                }
            },
            error: (err) => {
                console.error("Error retrieving room data: ", err);
                alert("Failed to load room details.");
            }
        });
    });

    $(document).on("click", "#btnSave", () => {
        var room = {
            RoomId: $("#txtRoomId").val(),
            Description: $("#txtDescription").val(),
            Price: $("#txtPrice").val(),
            Bedrooms: $("#txtBedrooms").val(),
            Bathrooms: $("#txtBathrooms").val(),
            Furnished: $("#chkFurnished").prop('checked'),
            Parking: $("#chkParking").prop('checked'),
            BachelorsAllowed: $("#chkBachelorsAllowed").prop('checked'),
            PropertyType: $("#selPropertyType").val(),
            UserId: $.cookie("userid")
        };

        var formData = new FormData();
        formData.append("RoomId", room.RoomId);
        formData.append("Description", room.Description);
        formData.append("Price", room.Price);
        formData.append("Bedrooms", room.Bedrooms);
        formData.append("Bathrooms", room.Bathrooms);
        formData.append("Furnished", room.Furnished);
        formData.append("Parking", room.Parking);
        formData.append("BachelorsAllowed", room.BachelorsAllowed);
        formData.append("PropertyType", room.PropertyType);
        formData.append("UserId", room.UserId);

        var fileInput = $("#fileRoomImage")[0].files[0];
        if (fileInput) {
            formData.append("image", fileInput); // Append image to FormData
        }

        $.ajax({
            method: "put",
            url: `http://127.0.0.1:5000/edit-room/${room.RoomId}`,
            data: formData,
            processData: false,
            contentType: false,
            success: () => {
                alert("Room Updated Successfully");
                loadView("../public/user-dashboard.html");
                GetRooms($.cookie("userid"));
            },
            error: (err) => {
                console.error("Error updating room: ", err);
                alert("There was an error while updating the room. Please try again.");
            }
        });
    });

    $(document).on("click", "#btnDelete", (e) => {
        loadView("../public/delete-room.html");
        const roomId = e.target.value;

        $.ajax({
            method: "get",
            url: `http://127.0.0.1:5000/get-room/${roomId}`,
            success: (room) => {
                $("#txtDRoomId").val(room.RoomId);
                $("#lblDRoomTitle").text(room.Description);
                $("#lblDRoomDescription").text(room.Description);
                $("#lblDRoomPrice").text(`$${room.Price}`);
                $("#lblDRoomBedrooms").text(room.Bedrooms);
                $("#lblDRoomBathrooms").text(room.Bathrooms);
                $("#lblDRoomPropertyType").text(room.PropertyType);
            }
        });
    });

    $(document).on("click", "#btnConfirmDeleteRoom", () => {
        const roomId = $("#txtDRoomId").val();

        $.ajax({
            method: "delete",
            url: `http://127.0.0.1:5000/delete-room/${roomId}`,
            success: () => {
                alert("Room Deleted Successfully");
                loadView("../public/user-dashboard.html");
                GetRooms($.cookie("userid"));
            },
            error: (err) => {
                console.error("Error deleting room: ", err);
                alert("There was an error while deleting the room. Please try again.");
            }
        });
    });

    $(document).on("click", "#btnCancelDeleteRoom", () => {
        loadView("../public/user-dashboard.html");
        GetRooms($.cookie("userid"));
    });

    $(document).on("click", "#btnEditCancel", () => {
        loadView("../public/user-dashboard.html");
        GetRooms($.cookie("userid"));
    });
    $(document).on("click", "#showCard", (e) => {
        const roomId = $(e.target).data("room-id");  // Get the room ID from the clicked card

        loadView("../public/show-room.html"); // Load the show-room page

        // Now, make an AJAX request to fetch the room details
        $.ajax({
            method: "get",
            url: `http://127.0.0.1:5000/get-room/${roomId}`,
            success: (room) => {
                // Populate the page with room details
                $("#lblRoomId").text(room.RoomId);  // Room ID
                $("#lblRoomDescription").text(room.Description);  // Room Description
                $("#lblRoomPrice").text(`$${room.Price}`);  // Room Price
                $("#lblRoomBedrooms").text(room.Bedrooms);  // Number of Bedrooms
                $("#lblRoomBathrooms").text(room.Bathrooms);  // Number of Bathrooms
                $("#lblRoomPropertyType").text(room.PropertyType);  // Property Type

                // Display the image
                const roomImage = room.image ? `http://127.0.0.1:5000/${room.image}` : 'https://via.placeholder.com/150';
                $("#imgRoomPreview").attr("src", roomImage).show();  // Show the image in the img tag
            },
            error: (err) => {
                console.error("Error retrieving room details: ", err);
                alert("Failed to load room details.");
            }
        });
    });
    $(document).on("click", "#btnCloseRoomDetails", () => {
        loadView("../public/user-dashboard.html");
        GetRooms($.cookie("userid"));
    });

    $('#priceRange').on('input', function () {
        const price = $(this).val();
        $('#priceRangeValue').text(price);
        filters.price = price;
    });
    // ----------------------------------------------------------------------









});
