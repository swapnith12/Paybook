import express from "express"
import cors from 'cors'
import router from "./routes/book.routes"
const PORT = 3002

const app = express()
app.use(express.json())
app.use(cors())
app.use("/api/v1/books",router)

app.listen(PORT,()=>{
    console.log(`Server now listening at http://localhost:${PORT}`)
})