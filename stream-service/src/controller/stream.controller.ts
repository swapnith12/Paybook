import { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../config/prisma';
import kafka from '../config/kafka';
import { BookStreamEvent } from '../config/types';

export const streamBook = async (req: Request, res: Response) => {
  try {
    const id = req.params.id.toString();


    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const range = req.headers.range;

    if (!range) {
      return res.status(416).send('Range header required');
    }

    const cloudResponse = await axios.get(book.fileUrl, {
      responseType: 'stream',
      headers: {
        Range: range,
      },
    });

    res.status(206);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Accept-Ranges', 'bytes');

    if (cloudResponse.headers['content-range']) {
      res.setHeader('Content-Range', cloudResponse.headers['content-range']);
    }

    if (cloudResponse.headers['content-length']) {
      res.setHeader('Content-Length', cloudResponse.headers['content-length']);
    }

    const event: BookStreamEvent = {
      type: 'BOOK_STREAM',
      bookId: id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: Date.now(),
    };

    kafka.sendMessage('book-events', event);

    cloudResponse.data.pipe(res);
  } catch (error: any) {
    console.error('Streaming error:', error.message);
    res.status(500).json({ error: 'Streaming failed' });
  }
};
