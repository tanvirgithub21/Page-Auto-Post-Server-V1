
# **Express.js Server for Content Management System**

This project is a content management system built with **Express.js**, **MongoDB**, and integrated with **Cloudinary** for content storage and management. The server handles **user management**, **content operations**, and **page management**, with scheduled tasks for automation.

---

## **Features**

### **1. User Management**
- Add users.
- Retrieve all users.

### **2. Content Management**
- Add content (e.g., videos, images).
- Fetch all content by page name.
- Fetch specific content by page name.
- Delete content by ID.
- Check Cloudinary storage availability.

### **3. Page Management**
- Add pages with associated details.
- Retrieve all pages.
- Fetch a specific page by its name.
- Delete a page by its ID.
- Refresh tokens for pages (scheduled every 5 days).

### **4. Automation**
- **Token Refresh**: Automatically refreshes tokens every 5 days.
- **Content Upload**: Uploads content to Facebook and sends an email notification at scheduled times.

---

## **Technologies Used**

- **Backend Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **Cloudinary Integration**: For media storage and management.
- **Task Scheduler**: [node-schedule](https://www.npmjs.com/package/node-schedule)

---

## **Installation**

### **1. Clone the repository**
```bash
git clone https://github.com/your-repo/content-management-system.git
cd content-management-system
```

### **2. Install dependencies**
```bash
npm install
```

### **3. Configure environment variables**
Create a `.env` file in the root directory and include the following variables:
```plaintext
PORT=5000
MONGO_URI=your_mongo_database_uri
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email_user
EMAIL_PASSWORD=your_email_password
```

### **4. Run the server**
```bash
npm start
```

The server will run at `http://localhost:5000`.

---

## **API Endpoints**

### **User Routes**
| Method | Endpoint          | Description            |
|--------|-------------------|------------------------|
| GET    | `/api/v1/users`   | Fetch all users.       |
| POST   | `/api/v1/users`   | Add a new user.        |

### **Content Routes**
| Method   | Endpoint                       | Description                            |
|----------|--------------------------------|----------------------------------------|
| POST     | `/api/v1/content/add`          | Add content.                           |
| GET      | `/api/v1/content/find-all/:page_name` | Fetch all content by page name.        |
| GET      | `/api/v1/content/find-one/:page_name` | Fetch a specific content by page name. |
| DELETE   | `/api/v1/content/delete/:id`   | Delete content by ID.                  |
| GET      | `/api/v1/content/check-storage` | Check Cloudinary storage availability. |

### **Page Routes**
| Method   | Endpoint                   | Description                            |
|----------|----------------------------|----------------------------------------|
| POST     | `/api/v1/page/add`         | Add a new page.                        |
| POST     | `/api/v1/page/refresh-tokens` | Refresh all tokens.                    |
| GET      | `/api/v1/page/all`         | Fetch all pages.                       |
| GET      | `/api/v1/page/find-one/:page_name` | Fetch a specific page by its name.     |
| DELETE   | `/api/v1/page/delete/:id`  | Delete a page by its ID.               |

---

## **Scheduled Jobs**

### **1. Token Refresh**
Automatically refreshes tokens every 5 days at midnight:
```plaintext
Schedule: 0 0 */5 * *
```

### **2. Content Upload**
Uploads content to Facebook and sends email notifications at specific times:
```plaintext
Schedule Times: 16:00, 18:00, 20:00, 21:00, 22:00 (Bangladesh time)
```

---

## **Project Structure**

```
content-management-system/
├── config/
│   ├── db.js                  # MongoDB connection setup
├── controllers/
│   ├── userController.js      # User operations
│   ├── contentController.js   # Content operations
│   ├── pageController.js      # Page operations
├── helpers/
│   ├── cloudinary.js          # Cloudinary helper functions
│   ├── tokenHelpers.js        # Token management helpers
│   ├── contentUploadHelpers.js # Facebook upload and email helpers
├── models/
│   ├── User.js                # User schema
│   ├── Content.js             # Content schema
│   ├── Page.js                # Page schema
├── routes/
│   ├── userRoutes.js          # User routes
│   ├── contentRoutes.js       # Content routes
│   ├── pageRoutes.js          # Page routes
├── app.js                     # Main app configuration
├── server.js                  # Entry point
├── package.json               # Project metadata and dependencies
```

---

## **Contributing**

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch-name`.
3. Commit your changes: `git commit -m "Added some feature"`.
4. Push to the branch: `git push origin feature-branch-name`.
5. Open a pull request.

---

## **License**

This project is licensed under the MIT License. See the LICENSE file for details.

---

### **Contact**
For queries, contact: **tanvir.bd.global@gmail.com**  
Developed by: **Md Tanvir Ahmed**  
