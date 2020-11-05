async function postRequest(uri, body) {
    return fetch(`${uri}`, {
        method: 'POST',
        body: JSON.stringify(body)
    })
        .then(formatResponse)
        .then(extractError)
}

async function getRequest(uri) {
    return fetch(`${uri}`, {
        method: 'GET'
    })
        .then(formatResponse)
        .then(extractError)
}

function formatResponse(response) {
    return response.json().then(
        data => {
            return {
                response: response,
                data: data
            }
        }
    )
}

function extractError(result) {
    if (result.data.error) {
        throw new Error(result.data.error)
    }
    if (!result.response.ok) {
        throw new Error(`${result.response.status} ${result.response.statusText}`)
    }
    return result
}

export async function getSnippet(id) {
    return getRequest(`/snippet?id=${id}`)
        .then(result => result.data.snippet)
}

export async function getVersions() {
    return getRequest(`/versions`)
        .then(result => result.data.versions)
}

export async function executeSnippet(snippet) {
    return postRequest('/execute', {
        snippet: snippet
    }).then(result => result.data.data)
}

export async function createSnippet(snippet) {
    return postRequest('/snippet', {
        snippet: snippet
    }).then(result => result.data.snippet)
}
