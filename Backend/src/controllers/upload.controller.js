export const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  // Assuming your express serves 'public' folder statically:
  const fileUrl = `/temp/${req.file.filename}`;
  res.status(200).json({ success: true, url: fileUrl, name:req.file.originalname });
};
