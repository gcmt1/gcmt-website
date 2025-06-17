// encrypt-test.js
const crypto = require("crypto");

const workingKey = "1FF45E68BC61BF20EFF579F26AF80992"; // ⚠️ replace this
const plainText = "order_id=2e27d57b-0177-473e-9fcc-8f2fe6315f25&order_status=success&merchant_param1=c844c7fa-e593-4033-b68e-0eaec2570f0a";

// Generate MD5 key buffer (16 bytes)
const mKey = crypto.createHash("md5").update(workingKey).digest();
const iv = Buffer.alloc(16, 0); // 16 zero bytes

const cipher = crypto.createCipheriv("aes-128-cbc", mKey, iv);
cipher.setAutoPadding(true);

let encrypted = cipher.update(plainText, "utf8", "base64");
encrypted += cipher.final("base64");

console.log("🔐 encResp to test:", encrypted);
