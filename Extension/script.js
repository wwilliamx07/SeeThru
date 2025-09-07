const url = "http://127.0.0.1:3000"

async function main(site, content) {
    const res = await fetch(url, {
        "method": "POST",
        "body": content,
        "headers": {
            "site": site
        }
    })
    return await res.text()
}

function generateSources(sources) {
    let result = ""
    for (const source of sources) {
        result += `<a href=${source} style="font-size:20px; color:#00d5ff">${source}</a>\n`
    }
    return result.trim()
}

function generateInner(element) {
    return `<div class="section">
                <span class="label">Key Claim:</span>
                <div class="placeholder-text">${element.key_claim}</div>
                <span class="label">Why?</span>
                <div class="placeholder-text">${element.why}</div>
                <span class="label">Sources:</span>
                ${generateSources(element.sources)}
            </div>`
}

function getBias(score) {
    if (score >= 80) {
        return "Far right"
    } else if (score > 60) {
        return "Right leaning"
    } else if (score >= 40) {
        return "Center"
    } else if (score > 20) {
        return "Left leaning"
    } else {
        return "Far left"
    }
}

function display(result) {
    if (result.left_bias.length > 0) {
        let leftInner = "<h2 style=\"margin: 0;\">Left bias:</h2>"
        for (const element of result.left_bias) {
            leftInner += generateInner(element)
        }
        document.getElementById("left-sections-container").innerHTML = leftInner
    }
    if (result.right_bias.length > 0) {
        let rightInner = "<h2 style=\"margin: 0;\">Right bias:</h2>"
        for (const element of result.right_bias) {
            rightInner += generateInner(element)
        }
        document.getElementById("right-sections-container").innerHTML = rightInner
    }
    document.getElementById("leaning").innerHTML = getBias(result.political_score)
    document.getElementById("center-line").style = `position: absolute; top: 0; left: ${result.political_score}%; width: 2px; height: 100%; background-color: #2e3238;`
}

(async () => {
    console.log("Started")
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true})

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: () => {
            let res = ""

            function visible(element) {
                // const style = getComputedStyle(element)
                // console.log(element.offsetWidth === 0,
                //         element.offsetHeight === 0,
                //         style.visibility === "hidden",
                //         style.display === "none",
                //         parseFloat(style.opacity) === 0)
                const style = getComputedStyle(element)
                if (element === document.body) {
                    return true
                }
                if (element.offsetWidth === 0 ||
                    element.offsetHeight === 0 ||
                    style.visibility === "hidden" ||
                    style.display === "none" ||
                    parseFloat(style.opacity) === 0) {
                    return false
                }
                return true
            }
            
            function getText(element) {
                if (element.nodeType === Node.TEXT_NODE) {
                    let text = element.textContent.trim()
                    if (text) {
                        res += text + "\n"
                    }
                } else if (element.nodeType === Node.ELEMENT_NODE && visible(element)) {
                    element.childNodes.forEach(getText)
                }
            }

            getText(document.body)

            return res
        }
    }, async (results) => {
        if (results && results[0]) {
            const res = await main(tab.url, results[0].result)
            // const res = `{ "political_score": 25, "left_bias": [ { "why": "The article's foundational premise, implied by its 2025 publication date, is that 'mass deportations' are occurring under a hypothetical 'President Donald Trump's second term.' This frames immigration enforcement as a severe humanitarian crisis explicitly linked to a conservative administration, characteristic of left-leaning critiques. Presenting this future scenario as current news implicitly criticizes policies not yet enacted.", "key_claim": "Amid mass deportations under President Donald Trump's second term, pediatricians across the US are working with families to prevent children from getting separated from their parents.", "sources": [ "https://www.cnn.com/2025/08/16/us/doctors-undocumented-immigrants-children" ] }, { "why": "This claim presents specific statistics, including a high '4% of all citizen children... at risk of losing both parents to deportation,' attributed to a '2025 Brookings Institution report.' Citing a future-dated report for such impactful figures amplifies the perceived scale of the problem. This use of statistics, even if projections, without immediate verifiability and focused on vulnerability, aligns with left-leaning narratives emphasizing the social costs of immigration enforcement.", "key_claim": "Briana’s son is one of an estimated 4.7 million US citizen children living with at least one undocumented parent, according to a 2025 Brookings Institution report. And about 4% of all citizen children in the US are at risk of losing both parents to deportation – sometimes without a chance to say goodbye.", "sources": [ "https://www.cnn.com/2025/08/16/us/doctors-undocumented-immigrants-children" ] }, { "why": "The statement describes an 'intensification' of ICE raids and graphically details parents being detained without goodbyes. This highlights the perceived harshness and human cost of enforcement actions, characteristic of left-leaning advocacy. By attributing this intensification to events 'since January' (of 2025), the article positions a hypothetical future policy as a present, impactful reality, further cementing a critical stance on immigration enforcement.", "key_claim": "ICE raids have intensified across the country since January: parents are being detained at home, at work, during routine traffic stops and in public places. Often, they have no chance to say goodbye to their children or arrange child care, pediatricians told CNN.", "sources": [ "https://www.cnn.com/2025/08/16/us/doctors-undocumented-immigrants-children" ] } ], "right_bias": [] }`
            display(JSON.parse(res))
            document.getElementById("loader").remove()
        }
    })
})()
