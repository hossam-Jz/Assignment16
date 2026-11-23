import crypto from "crypto"; 

const IV_LENGTH = 16;
const ENCRYTION_KEY: Buffer = Buffer.from(
  process.env.ENCRYPTION_SECRET_KEY || "",
  "utf-8",
);
//Buffer، وهو شكل من البيانات الثنائية اللي بتتعامل معاها مكتبة crypto.
export const encrypt = (text: string): string => {
  const iv: Buffer = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("AES-256-GCM", ENCRYTION_KEY, iv);
  let encryptedData: string = cipher.update(text, "utf8", "hex");
  encryptedData += cipher.final("hex");
  return `${iv.toString("hex")}:${encryptedData}`;
};

export const decrypt = (encryptedData: string): string => {
  const [ivHex, encryptedText] = encryptedData.split(":");
  if (!ivHex || !encryptedText) {
    throw new Error("Invalid encrypted data");
  }
  const ivBuffer = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    "AES-256-GCM",
    ENCRYTION_KEY,
    ivBuffer,
  );
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
