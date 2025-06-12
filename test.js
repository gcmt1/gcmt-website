const crypto = require("crypto");

const workingKey = "1FF45E68BC61BF20EFF579F26AF80992"; // your actual working key
const plainText = "order_id=ORD123456&order_status=Success&merchant_param1=14c4e989-2d78-47b3-a97f-29a4e0fe83c1";

// Correct key generation: MD5 hash as binary buffer (16 bytes)
const mKey = crypto.createHash("md5").update(workingKey).digest(); // NOT digest("hex")
const iv = Buffer.alloc(16, 0); // 16 zero bytes

const cipher = crypto.createCipheriv("aes-128-cbc", mKey, iv);
cipher.setAutoPadding(true);

let encrypted = cipher.update(plainText, "utf8", "base64");
encrypted += cipher.final("base64");

console.log("encResp:", encrypted);
