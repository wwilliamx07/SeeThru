import "node-fetch"

(async () => {
    const t = await fetch("http://127.0.0.1:3000", {
        method: "GET",
        headers: {
            "text": "hello"
        }
    })
    t.text().then((a) => {
        console.log(a)
    })
})()