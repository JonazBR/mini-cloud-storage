const express = require('express')
const app = express()
const fs = require('fs-extra')
const { fromBuffer } = require('file-type')
const crypto = require('crypto')
const bodyParser = require('body-parser')

app.use(express.json({limit: '500mb'}));
app.use(express.urlencoded({limit: '500mb'}));
app.use(bodyParser.urlencoded({  extended: true }))
app.use(bodyParser.json())

function parserUrl(req, ...args) {
    return `${req.protocol}://${req.get('host')}/${args}`
}



app.get('/', (req, res) => {
    res.status(200).json({
        endpoints: [
            {
                method: 'GET',
                name: 'all',
                url: parserUrl(req, 'all'),
                description: 'Get all files'
            },
            {
                method: 'GET',
                name: 'file',
                url: parserUrl(req, 'file?id=<fileId>'),
                description: 'Get file by id'
            },
            {
                method: 'POST',
                name: 'upload',
                url: parserUrl(req, 'upload'),
                description: 'Upload file'
            }
        ]
    })
})

app.get('/file', async(req, res) => {
    var filepath = `./files/${req.query.fileId}`
    let file = await fs.readFile(filepath)
    const fileType = await fromBuffer(file)
    res.setHeader('Content-Type', fileType.mime);
    res.setHeader("Content-Disposition", 'attachment;\ filename='+ req.query.fileId );
    res.send(file)
})
app.get('/all', async(req, res) => {
    const files = await fs.readdir('./files')
    res.status(200).json(files)
})
app.post('/upload', async(req, res) => {
    const id = crypto.randomBytes(10).toString('hex')
    const buffer = Buffer.from(req?.body?.body.buffer.data)
    const fileType = await fromBuffer(buffer)
    const fileName = `${id}.${fileType.ext}`
    await fs.writeFile(`./files/${fileName}`, buffer)
    res.status(200).json({
        status: 'success',
        url: parserUrl(req, `file?fileId=${fileName}`),
    })
})




const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
})
