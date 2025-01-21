# Roomify

A modern web application for property listing and room rentals. Roomify helps connect property owners with potential tenants through an intuitive and user-friendly platform.

https://github.com/user-attachments/assets/31fb7d6a-ae0a-4cb4-aef5-9bcfac2013e9

## Features

- **User Authentication**: Secure user registration and login system
- **Property Listings**:
  - Add, edit, and delete room listings
  - Upload room images
  - Specify details like price, bedrooms, bathrooms, and amenities
- **Search & Filters**:
  - Price range filter
  - Property type filter
  - Amenities filters (Furnished, Parking, Bachelors Allowed)
- **User Dashboard**: Manage your property listings and view responses
- **Responsive Design**: Works seamlessly on desktop and mobile devices


## Tech Stack

- **Frontend**: HTML, JavaScript, jQuery, Bootstrap 5
- **Backend**: Node.js, Express.js
- **Database**: MongoDB

### Additional Libraries:

- `cors`
- `multer` (for file uploads)
- `dotenv` (for environment variables)
- `bootstrap-icons`
- `jquery.cookie`

## Getting Started

### Prerequisites

- Node.js (v20.11.1)
- MongoDB

### Installation

```bash
# Clone the repository
git clone [your-repo-url]

# Install dependencies
npm install

# Create .env file and configure environment variables
# Example:
# MONGODB_URI=your_mongodb_connection_string
# PORT=3000

# Start the application
npm run api

#Folder Structure
├── node_modules/           # Dependencies
├── public/                 # Frontend files
│   ├── css/                # CSS files
│   ├── images/             # Image assets
│   ├── js/                 # Client-side JavaScript
│   ├── add-room.html       # Add room page
│   ├── delete-room.html    # Delete room confirmation
│   ├── edit-room.html      # Edit room page
│   ├── home.html           # Home page
│   ├── index.html          # Landing page
│   ├── login.html          # Login page
│   ├── register.html       # Registration page
│   ├── show-room.html      # Room details page
│   └── user-dashboard.html # User dashboard
├── server/                 # Backend files
│   └── api.js              # API endpoints and server logic
├── src/                    # Source files
│   ├── filter.js           # Filtering functionality
│   ├── project.css         # Main project styles
│   └── project.js          # Main project JavaScript
├── uploads/                # Directory for uploaded files
├── .env                    # Environment variables
├── .gitignore              # Git ignore file
├── package.json            # Project configuration and dependencies
└── package-lock.json       # Dependency lock file
