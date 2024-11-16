import express, { Request, Response } from 'express';
import path from 'path';

const app = express();
app.use(express.static(path.join(__dirname, '../public')));

const port = 3001;


app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../src/views/index.html'));
});

app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
});