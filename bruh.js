const key = "IELIwhXZJPE85ky58ovi"

document.getElementById("meow").addEventListener("click", async () => {
    console.log("Clicked")

    let [tab] = await chrome.tabs.query({active: true, currentWindow: true})

    // chrome.scripting.executeScript({
    //     target: {tabId: tab.id},
    //     func: () => document.documentElement.outerHTML
    // }, (results) => {
    //     if (results && results[0]) {
    //         console.log(results[0].result)
    //     }
    // })
    chrome.tabs.captureVisibleTab(tab.windowId, {format: "png"}, async (dataUrl) => {
        document.getElementById("screenshot").src = dataUrl
        const response = await fetch("https://serverless.roboflow.com/infer/workflows/test-ozfhq/custom-workflow", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                api_key: key,
                inputs: {
                    "image": {"type": "url", "value": dataUrl}
                }
            })
        })

        const result = await response.json()
        console.log(result)

    })
})