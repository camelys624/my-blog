export function initCustomCard() {
  customElements.define("custom-card",
    class extends HTMLElement {
      constructor() {
        super()
        const template = `
        <div class="front-info">
          <slot name="person-name" class="person-name">Camel</slot>
          <div class="contact-info">
            <div class="contact-info-item">
              <label>Phone:</label>
              <slot name="phone"></slot>
            </div>
            <div class="contact-info-item">
              <label>Email:</label>
              <slot name="email"></slot>
            </div>
          </div>
        </div>
        <div class="black-info">
          <figure>
            <slot name="wechat-pic"></slot>
            <figcaption>Wechat</figcaption>
          </figure>
          <figure>
            <slot name="twitter-pic"></slot>
            <figcaption>Twitter</figcaption>
          </figure>
        </div>
      `

        let style = document.createElement("style")
        style.textContent = `
          :host{ 
            padding: 28px 10px;
            margin: 0 -1em;
            height: 184px;
            background: radial-gradient(#2C3E50, #000000);
            max-width: 500px;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          @supports (background: paint(huiwen-border)) {
              :host {
                  --huiwen-line-width: 2px;
                  background-image: paint(huiwen-border);
              }
          }
          .front-info {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            background-color: transparent;
            width: 100%;
            height: 100%;
            padding: 1em 2em;
            position: relative;
            transition: transform 0.5s easy-in-out;
            transform: translateY(0);
          }
          .front-info .person-name {
            position: relative;
            margin-bottom: 1em;
          }
          .front-info .person-name::after {
            content: ${this.getAttribute('job')};
            font-size: 14px;
            margin-left: 1em;
          }
          .contact-info {
           display: flex;
           justify-content: space-between; 
          }
          .contact-info label {
            margin-right: 5px;
          }
          .black-info {
            background-color: rgba(0, 0, 0, .6);
            width: 100%;
            height: 100%;
            transition: transform 0.5s easy-in-out;
            transform: translateY(0);
          }
          :host:hover .front-info,
          :host:hover .black-info {
            transform: translateY(-100%);
          }
        `
        console.log(this.getAttribute('job'));
        const shadowRoot = this.attachShadow({ mode: "open" })
        shadowRoot.appendChild(style)
        shadowRoot.append(parseHTML(template))

      }
    }
  )
}

function parseHTML(string) {
  const context = document.implementation.createHTMLDocument()

  // Set the base href for the created document so any parsed elements with URLs
  // are based on the document's URL
  const base = context.createElement("base")
  base.href = document.location.href
  context.head.appendChild(base)

  context.body.innerHTML = string

  return context.body.firstElementChild
}
