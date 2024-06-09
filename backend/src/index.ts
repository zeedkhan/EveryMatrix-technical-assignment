import dotenv from 'dotenv';
import app from './app.js';


dotenv.config();

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});