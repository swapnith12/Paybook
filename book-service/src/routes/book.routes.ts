import { Router } from 'express';
import cloudinary from '../config';
import { prisma } from '../config/prisma';
import multer from 'multer';
import streamifier from "streamifier";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });


router.get("/allBooks",async(req,res)=>{
  const books = await prisma.book.findMany({
    orderBy:{
      createdAt:"desc"
    }
  })
  res.send(books)
})


router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "File required" });
    }

    // Convert buffer to stream
    const uploadFromBuffer = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "books",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file!.buffer).pipe(stream);
      });
    };

    const result: any = await uploadFromBuffer();

    const book = await prisma.book.create({
      data: {
        title,
        cloudinaryId: result.public_id,
        fileUrl: result.secure_url,
        TotalPages:result.pages
      },
    });

    res.status(201).json(book);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
});

router.put('update/:id', upload.single('file'), async (req, res) => {
  try {
    const  id  = req.params.id.toString();
    const { title } = req.body;
    if (id ) {
      const existing = await prisma.book.findUnique({
        where: { id, title },
      });

      if (!existing) {
        return res.status(404).json({ message: 'Book not found' });
      }

      let updatedData: any = { title };

      if (req.file) {
        // delete old file
        await cloudinary.uploader.destroy(existing.cloudinaryId);

        // upload new file
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'books',
          resource_type: 'auto',
        });

        updatedData.cloudinaryId = result.public_id;
        updatedData.fileUrl = result.secure_url;
        updatedData.format = result.format;
        updatedData.size = result.bytes;
      }

      const updatedBook = await prisma.book.update({
        where: { id },
        data: updatedData,
      });

      res.json(updatedBook);
    }
    else{
       res.status(500).json({ message: 'Provided book details not correct' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Update failed' });
  }
});

router.delete('delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await cloudinary.uploader.destroy(book.cloudinaryId);

    await prisma.book.delete({
      where: { id },
    });

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Delete failed' });
  }
});

export default router;
