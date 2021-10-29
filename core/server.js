const express = require("express")
const app = express()
app.use(express.static("core/static"))
app.listen(5000, () => {
    console.log("development server listen port:5000")
})