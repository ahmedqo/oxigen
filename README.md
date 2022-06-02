# Oxigen

Oxigen is a JavaScript library for creating user interfaces.
With `oxigen`  you can create your own custom html elemnt

# Usage

    import Component, { sass, html } from "oxigen-core";
    
	const App = Component({
	    taged: "oxi-app",
	    props: {
			title: {
				type: "string",
				value: "OXIGEN"
			}
		},
	    styles() {
	        return sass /*css*/ `
	            *, :host {
	                box-sizing: border-box;
	                font-family: Arial, sans-serif;
	            }
	            :host {
	                display: flex;
	                width: 100%;
	                justify-content: center;
	            }
	            h1 {
					font-size: 2rem;
				}
	        `;
	    },
	    render() {
	        return html`
	            <h1>${this.title}</h1>
	        `;
	    },
	});
	
	App.define();

