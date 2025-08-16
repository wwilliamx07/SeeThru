import {createServer} from "node:http"
import {GoogleGenAI} from "@google/genai"
import {readFileSync} from "fs"

const apiKey = "AIzaSyBP41LaMoZgb2VU_3mSkL4zPwNDC0SDrok"

const gemini = new GoogleGenAI({"apiKey": apiKey})
const prompt = readFileSync("prompt2.txt").toString()

const server = createServer((req, res) => {
    res.writeHead(200, {"Content-Type": "text/plain"})
    console.log("request", req.method, req.headers)
    if (req.method == "POST" && req.headers.site) {
        let body = ""
        req.on("data", (data) => {
            body += data
        })
        req.on("end", async () => {
            const finalPrompt = prompt.replace("BODY_TEXT", body).replace("SITE_LINK", req.headers.site)
            console.log(finalPrompt)
            console.log(body)
            const response = await gemini.models.generateContent({
                model: "gemini-2.5-flash",
                contents: finalPrompt
            })
            const finalResponse = response.text.replace("```json", "").replace("```", "")
            console.log(finalResponse)
            res.end(finalResponse)
        })
    } else {
        res.end("bruh")
    }
})

server.listen(3000, "127.0.0.1", () => {
  console.log("Listening on 127.0.0.1:3000")
})