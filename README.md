
# Facebook Page Token Management and Video Upload System

এটি একটি ফেসবুক পেজ টোকেন ম্যানেজমেন্ট এবং ভিডিও আপলোড সিস্টেম, যা Express.js, MongoDB, এবং Node.js ব্যবহার করে তৈরি করা হয়েছে। এই সিস্টেমটি ফেসবুক পেজের টোকেন রিফ্রেশ, কন্টেন্ট আপলোড এবং ইমেইল পাঠানোর কাজ করে।

## প্রজেক্টের ফিচার:

- **ফেসবুক পেজ টোকেন রিফ্রেশ**: একটি সিস্টেম যেটি পেজের টোকেন রিফ্রেশ করে, যাতে তা সবসময় কার্যকর থাকে।
- **ভিডিও আপলোড**: ফেসবুকে ভিডিও আপলোড করা এবং সফলভাবে আপলোড হলে ইমেইল পাঠানো।
- **স্কেজিউল টাস্ক**: প্রতি ৫ দিনে একবার টোকেন রিফ্রেশ এবং নির্দিষ্ট সময়ে ভিডিও আপলোডের জন্য স্কেজিউল টাস্ক তৈরি করা।
- **MongoDB**: পেজ এবং কন্টেন্ট সম্পর্কিত ডেটা MongoDB ডাটাবেজে সংরক্ষিত থাকে।

## প্রয়োজনীয় ডিপেনডেন্সি:

এই প্রজেক্টটি চালাতে কিছু Node.js প্যাকেজ প্রয়োজন হবে। নিচে সমস্ত ডিপেনডেন্সি দেওয়া হলো:

```bash
npm install express mongoose cors node-schedule axios dotenv nodemailer
```

- `express`: ওয়েব সার্ভিস তৈরি করার জন্য।
- `mongoose`: MongoDB এর সাথে ইন্টারঅ্যাক্ট করার জন্য।
- `cors`: CORS হ্যান্ডলিং।
- `node-schedule`: নির্দিষ্ট সময়ে কাজ করার জন্য।
- `axios`: HTTP রিকোয়েস্ট পাঠানোর জন্য।
- `dotenv`: .env ফাইল থেকে পরিবেশ ভেরিয়েবল লোড করার জন্য।
- `nodemailer`: ইমেইল পাঠানোর জন্য।

## ইনস্টলেশন:

1. **প্রজেক্ট কপি করুন**:
   ```bash
   git clone https://github.com/yourusername/facebook-page-token-management.git
   ```

2. **ডিপেনডেন্সি ইনস্টল করুন**:
   প্রজেক্ট ফোল্ডারে গিয়ে নিম্নলিখিত কমান্ড চালান:
   ```bash
   npm install
   ```

3. **.env ফাইল তৈরি করুন**:
   আপনার প্রজেক্টের রুট ফোল্ডারে একটি `.env` ফাইল তৈরি করুন এবং এতে আপনার ফেসবুক অ্যাপের তথ্য যোগ করুন:
   ```env
   PORT=5000
   MONGO_URI=your_mongo_db_connection_string
   APP_ID=your_facebook_app_id
   APP_SECRET=your_facebook_app_secret
   ```

4. **অ্যাপ চালান**:
   ```bash
   npm start
   ```

## স্কেজিউল টাস্ক:

- **টোকেন রিফ্রেশ**: প্রতি ৫ দিনে একবার ফেসবুক পেজের টোকেন রিফ্রেশ করা হবে।
- **ভিডিও আপলোড**: নির্দিষ্ট সময়গুলোতে (16:00, 18:00, 20:00, 21:00, 22:00) ভিডিও আপলোডের জন্য স্কেজিউল করা হয়েছে।

### টোকেন রিফ্রেশ (প্রতি ৫ দিনে একবার):

```js
scheduleJob("0 0 */5 * *", () => {
  console.log("Scheduled token refresh initiated (every 5 days).");
  refreshAllTokens();
});
```

### ভিডিও আপলোড (নির্দিষ্ট সময়গুলোতে):

```js
const scheduleTimes = [
  "0 16 * * *", // 16:00
  "0 18 * * *", // 18:00
  "0 20 * * *", // 20:00
  "0 21 * * *", // 21:00
  "0 22 * * *", // 22:00
];

scheduleTimes.forEach((time) => scheduleJob(time, () => console.log("Video upload triggered.")));
```

## রুট পয়েন্ট:

### **/api/v1/users**
- **POST `/add`**: নতুন ইউজার অ্যাড করা।

### **/api/v1/content**
- **POST `/add`**: নতুন কন্টেন্ট (ভিডিও) অ্যাড করা।
- **GET `/find-all/:page_name`**: নির্দিষ্ট পেজের সকল কন্টেন্ট দেখানো।
- **GET `/find-one/:page_name`**: নির্দিষ্ট পেজের একটি কন্টেন্ট দেখানো।
- **DELETE `/delete/:id`**: কন্টেন্ট মুছে ফেলা।

### **/api/v1/page**
- **POST `/add`**: নতুন পেজ অ্যাড করা।
- **POST `/refresh-tokens`**: সব পেজের টোকেন রিফ্রেশ করা।
- **GET `/all`**: সকল পেজের তালিকা দেখানো।
- **GET `/find-one/:page_name`**: নির্দিষ্ট পেজের তথ্য দেখানো।
- **DELETE `/delete/:id`**: পেজ মুছে ফেলা।

## ডাটাবেস স্কিমা:

### Page Schema:
```js
const pageSchema = new mongoose.Schema({
  page_name: String,
  page_id: String,
  short_lived_token: String,
  long_lived_user_token: String,
  long_lived_page_token: String,
  app_id: String,
  app_secret: String,
  token_expiry: mongoose.Schema.Types.Mixed,
});
```

### Content Schema:
```js
const contentSchema = new mongoose.Schema({
  content_type: String,
  duration: Number,
  page_id: String,
  page_name: String,
  description: String,
  playback_url: String,
  public_id: String,
  secure_url: String,
  thumbnail_url: String,
});
```

## কনট্রিবিউট করা:

আপনি যদি এই প্রজেক্টে অবদান রাখতে চান, তাহলে একটি Pull Request পাঠান অথবা Issues সৃজন করুন।

## লাইসেন্স:

এই প্রজেক্টটি MIT লাইসেন্সের অধীনে প্রকাশিত। বিস্তারিত জানার জন্য LICENSE ফাইলটি দেখুন।
