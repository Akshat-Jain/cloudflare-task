const givenUrl = 'https://cfw-takehome.developers.workers.dev/api/variants';

addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request))
})

/**
 * Respond with text changes according to the selected url
 * @param {Request} request
 */
async function handleRequest(request) {
	
	let variant = '';
	let response = await fetch(givenUrl)
	let finalUrl = ''
	if (response.ok) {
		let json = await response.json();
		let variants = json.variants;
		
		// Extra Credit Task: Persisting the chosen variant in a cookie
		const cookie = request.headers.get('cookie')
		const cookieKey = 'cookieKey'
		if (cookie && cookie.includes(`${cookieKey}=v1`)) {
			variant = "v1"
			finalUrl = variants[0]
		}
		else if (cookie && cookie.includes(`${cookieKey}=v2`)) {
			variant = "v2"
			finalUrl = variants[1]
		}
		else {
			let randomNumber = Math.floor(Math.random() * 2);
			if(randomNumber==0){
			  variant = 'v1'
			  finalUrl = variants[0]
			}
			else{
			  variant = 'v2'
			  finalUrl = variants[1]
			}
		}

		let response2 = await fetch(finalUrl)
		if (response2.ok) {
			let text = await response2.text();
			response = new Response(text, {
				headers: {
					'content-type': 'text/html'
				},
			});
			response.headers.append('Set-Cookie', `${cookieKey}=${variant}; path=/`)
			return new HTMLRewriter()
				.on('*', new AttributeRewriter(variant))
				.transform(response);
		} else {
			return new Response('Unable to access site', {
				headers: {
					'content-type': 'text/html'
				},
			});
		}
	} else {
		return new Response(`Unable to fetch URLs`, {
			headers: {
				'content-type': 'text/plain'
			},
		})
	}
}

// Extra Credit Task: Changing copy/URLs
// An element handler to respond to any incoming elements
// Reference Used: https://developers.cloudflare.com/workers/reference/apis/html-rewriter/
class AttributeRewriter {

	constructor(variant) {
		this.variant = variant
	}
	
	element(element) {
		
		if (element.tagName == 'title') {
			if (this.variant == 'v1') {
				element.setInnerContent('Variant 1: Internship Task')
			} else {
				element.setInnerContent('Variant 2: Internship Task')
			}
		}

		if (element.tagName == 'h1' && element.getAttribute('id') == 'title') {
			if (this.variant == 'v1') {
				element.setInnerContent("Portfolio Website")
			} else {
				element.setInnerContent("LinkedIn Profile")
			}
		}

		if (element.tagName == 'p' && element.getAttribute('id') == 'description') {
			if (this.variant == 'v1') {
				element.setInnerContent("Check out my Portfolio Website! :)")
			} else {
				element.setInnerContent("Check out my LinkedIn Profile! :)")
			}
		}

		if (element.tagName == 'a' && element.getAttribute('id') == 'url') {
			if (this.variant == 'v1') {
				element.setInnerContent("Take me there!")
				element.setAttribute('href', "https://www.akjn.dev/")
				element.setAttribute('target', "_blank")
			} else {
				element.setInnerContent("Let's go!")
				element.setAttribute('href', "https://www.linkedin.com/in/akjn99")
				element.setAttribute('target', "_blank")
			}
		}
	}
}