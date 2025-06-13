// encrypt-test.js
const crypto = require("crypto");

const workingKey = "1FF45E68BC61BF20EFF579F26AF80992"; // ⚠️ replace this
const plainText = "order_id=6d0f6081-aa56-4e4f-b6e3-d5a3d945848f&order_status=Success&merchant_param1=6d0f6081-aa56-4e4f-b6e3-d5a3d945848f";

// Generate MD5 key buffer (16 bytes)
const mKey = crypto.createHash("md5").update(workingKey).digest();
const iv = Buffer.alloc(16, 0); // 16 zero bytes

const cipher = crypto.createCipheriv("aes-128-cbc", mKey, iv);
cipher.setAutoPadding(true);

let encrypted = cipher.update(plainText, "utf8", "base64");
encrypted += cipher.final("base64");

console.log("🔐 encResp to test:", encrypted);
