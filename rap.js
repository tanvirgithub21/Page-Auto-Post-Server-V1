// {

//     "page_name": "Viral VIP",
//     "page_id": "456940277498316",
//     "short_lived_token": "EAARmtJMMrPgBO7EZA8JdDz9WKcZBP70F3p36IYE4LBYYgNPWQquXL2OZCZBH6IT8iYZBx…",
//     "long_lived_user_token": "EAARmtJMMrPgBOzWjtC0BKZBbhdeo3LDrVPsXXxMJRZBGLdS2PUiHAlEvExSq1WicZAopT…",
//     "long_lived_page_token": "EAARmtJMMrPgBO4hi9F13sfvVZCn3lLkBsmjMobcftqIpZA30EMJY13Rx6PzzbtaYhSANc…",
//     "app_id": "1238825654070520",
//     "app_secret": "fdbb34657a03a052467040dc49908266",
//     "token_expiry" :"1970-01-01T00:00:00.000+00:00",
//     "last_updated":"2024-12-02T23:13:58.066+00:00",
//     "__v": 0
//     }

const data = {
  page_name: "Viral VIP",
  page_id: "456940277498316",
  success: true,
  message: "Upload successful",
};

const data2 = [
  {
    page_name: "Viral VIP",
    page_id: "456940277498316",
    success: true,
    public_id: "reelsvideo/r80oqkdjstduhalolqdi",
    content_id: new ObjectId("67505fd636b742d9c3739b2a"),
    message: "Upload successful",
  },
  {
    page_name: "m16t",
    page_id: "4569402774983236",
    success: false,
    public_id: false,
    content_id: false,
    message: "Upload faild",
  },
];



const { MongoClient } = require("mongodb");

async function processArrayForDeleteOperation(array) {
    // MongoDB connection URI
    const uri = "mongodb://localhost:27017"; // আপনার MongoDB URI
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db("YourDatabaseName"); // আপনার ডাটাবেসের নাম দিন
        const collection = database.collection("Content"); // "Content" সংগ্রহের নাম
        
        // Iterate over the array and process each object
        const processedArray = await Promise.all(
            array.map(async (item) => {
                if (item.success === true && item.public_id === true) {
                    try {
                        // Attempt to delete the content
                        const result = await collection.deleteOne({ _id: item.content_id });
                        if (result.deletedCount > 0) {
                            return {
                                ...item,
                                content_id: true,
                                delete_message: "Content deleted successfully",
                            };
                        } else {
                            return {
                                ...item,
                                delete_message: "Content deletion failed: Not found in database",
                            };
                        }
                    } catch (error) {
                        return {
                            ...item,
                            delete_message: `Content deletion failed: ${error.message}`,
                        };
                    }
                }
                return item; // If conditions are not met, return the item as is
            })
        );

        return processedArray; // Return the final processed array
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    } finally {
        await client.close(); // Close the connection
    }
}

// Example usage
(async () => {
    const inputArray = [
        {
            page_name: "Viral VIP",
            page_id: "456940277498316",
            success: true,
            public_id: true,
            content_id: "67505fd636b742d9c3739b2a", // MongoDB ObjectId string
            message: "Upload successful",
        },
        {
            page_name: "Cool Content",
            page_id: "123456789012345",
            success: true,
            public_id: false,
            content_id: "67505fd636b742d9c3739b2b", // MongoDB ObjectId string
            message: "Upload successful",
        },
        {
            page_name: "m16t",
            page_id: "4569402774983236",
            success: false,
            public_id: false,
            content_id: false,
            message: "Upload failed",
        },
        {
            page_name: "Trending Topics",
            page_id: "123987654321987",
            success: true,
            public_id: true,
            content_id: "67505fd636b742d9c3739b2c", // MongoDB ObjectId string
            message: "Upload successful",
        },
    ];

    const result = await processArrayForDeleteOperation(inputArray);
    console.log(result);
})();

