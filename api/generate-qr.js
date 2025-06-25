import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import qr from "qr-image";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Route: Generate QR and send as base64 (no local save)
app.post("/generate-qr", (req, res) => {
  const { productCode, materialDesc } = req.body;

  if (!productCode || !materialDesc) {
    return res.status(400).send("Missing required fields.");
  }


  try {
    const qrData = JSON.stringify({ productCode, materialDesc });

    // Generate QR code as PNG buffer
    const qrBuffer = qr.imageSync(qrData, { type: "png" });
    // console.log("QrBuffer: ",qrBuffer);
    // Convert to base64 and send
    const base64Image = `data:image/png;base64,${qrBuffer.toString("base64")}`;
    // console.log("Base64 Image:", base64Image);
    res.status(200).json({
      message: "QR code generated.",
      qrImage: base64Image,
    });

  } catch (err) {
    console.error("QR generation failed:", err);
    res.status(500).send("Failed to generate QR.");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at {PORT}`);
});

// import express from "express";
// import bodyParser from "body-parser";
// import cors from "cors";
// import fs from "fs";
// import qr from "qr-image";
// import path from "path";
// import { db } from "./firebase";

// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(bodyParser.json());

// // Ensure directories exist
// const qrDir = "./qr_codes";
// const dataDir = "./product_data";
// if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir);
// if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// // Route: Generate QR and save product info
// app.post("/generate-qr", (req, res) => {
//   const { productCode, materialDesc, imageUrl } = req.body;

//   if (!productCode || !materialDesc || !imageUrl) {
//     return res.status(400).send("Missing required fields.");
//   }

//   const sanitizedCode = productCode.replace(/[^a-zA-Z0-9-_]/g, "_");
//   const qrData = JSON.stringify({ productCode, materialDesc, imageUrl });
//   const qrImagePath = path.join(qrDir, `${sanitizedCode}_qr.png`);
//   const textPath = path.join(dataDir, `${sanitizedCode}.json`);

//   try {
//     const qr_png = qr.image(qrData, { type: "png" });

//     const qrWriteStream = fs.createWriteStream(qrImagePath);
//     qr_png.pipe(qrWriteStream);

//     qrWriteStream.on("finish", () => {
//       // Save metadata file
//       fs.writeFile(textPath, qrData, (err) => {
//         if (err) {
//           console.error("Failed to save product data:", err);
//           return res.status(500).send("QR created, but saving product failed.");
//         }

//         // Read image and convert to base64
//         fs.readFile(qrImagePath, (err, imageBuffer) => {
//           if (err) {
//             console.error("Failed to read QR image:", err);
//             return res.status(500).send("QR created, but failed to read image.");
//           }

//           const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`;
//           res.status(200).json({
//             message: "QR code generated and product info saved.",
//             qrImage: base64Image,
//           });
//         });
//       });
//     });

//     qrWriteStream.on("error", (err) => {
//       console.error("Failed to write QR image:", err);
//       res.status(500).send("Failed to write QR image.");
//     });

//   } catch (err) {
//     console.error("QR generation failed:", err);
//     res.status(500).send("Failed to generate QR.");
//   }
// });


// // Route: Fetch product details by productCode
// app.post("/fetch-product", (req, res) => {
//   const { productCode } = req.body;

//   if (!productCode) {
//     return res.status(400).send("Product code required.");
//   }

//   const sanitizedCode = productCode.replace(/[^a-zA-Z0-9-_]/g, "_");
//   const textPath = path.join(dataDir, `${sanitizedCode}.json`);

//   fs.readFile(textPath, "utf8", (err, data) => {
//     if (err) {
//       console.error("Product not found:", err);
//       return res.status(404).send("Product not found.");
//     }

//     try {
//       const productInfo = JSON.parse(data);
//       res.status(200).json(productInfo);
//     } catch (parseErr) {
//       console.error("Error parsing product data:", parseErr);
//       res.status(500).send("Error reading product data.");
//     }
//   });
// });



/* 
1. Use the inquirer npm package to get user input.
2. Use the qr-image npm package to turn the user entered URL into a QR code image.
3. Create a txt file to save the user input using the native fs node module.
*/

// class Solution {
//     public int isvowel(char c)
//     {
//         String d="aeiouAEIOU";
//         return d.indexOf(c);
//     }

//     public String reverseVowels(String s) {
//         int l=0;
//         int h=s.length()-1;
//         String sb="";
//         while(l<=h)
//         {
//             if(isvowel(s.charAt(l)) !=-1 && isvowel(s.charAt(h))!=-1)
//             {
//                 // char c;
//                 // c=s.chartAt(l);
//                 // s.charAt(l)=sb.charAt(h);
//                 // sb.charAt(h)=c;
//                 sb=s.charAt(h)+sb;
//                 sb=sb+s.charAt(l);
//                 l++;
//                 h--;
//             }

//             else if(isvowel(s.charAt(l))!=-1)
//             {
//                 sb+=s.charAt(h);
//                 h--;
                
//             }

//             else if(isvowel(s.charAt(h))!=-1)
//             {
//                 sb=s.charAt(l)+sb;
//                 l++;
//             }

//             else
//             {
                
//                 sb=sb+s.charAt(h);
//                 sb=s.charAt(l)+sb;
//                 l++;
//                 h--;
//             }
//         }
//         System.out.println(sb);
//         int n = sb.length();
//         String part1 ="";
//         String part2="";
//         if(s.length()!=n)
//         {
//             n=n-1;
//             part1= sb.substring(0, (n / 2)+1);
//             part2 = sb.substring((n / 2)+1, n);
//         }
//         else{
//             part1= sb.substring(0, (n / 2));
//             part2 = sb.substring((n / 2), n);
//         }
        
//         // if(s.length() %2==1)
//         // {
//         //     part2 = sb.substring((n / 2), n-1);
//         // }

//         // else{
//         //     part2 = sb.substring((n / 2), n);
//         // }
//         // part2 = sb.substring((n / 2), n);
//         String r1 = "";
//         for (int i = part1.length() - 1; i >= 0; i--) {
//             r1 += part1.charAt(i);
//         }

//         String r2 = "";
//         for (int i = part2.length() - 1; i >= 0; i--) {
//             r2 += part2.charAt(i);
//         }

//         sb = r1 + r2;

//         return sb;
//     }
// }