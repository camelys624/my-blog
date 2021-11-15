export function initCustomCard() {
  customElements.define("custom-card",
    class extends HTMLElement {
      constructor() {
        super()
        const template = `
        <div class="custom-card-container">
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
              <div class="img-box">
                <slot name="wechat-pic"></slot>
              </div>
              <figcaption>Wechat</figcaption>
            </figure>
            <figure>
              <div class="img-box">
                <slot name="twitter-pic"></slot>
              </div>
              <figcaption>Twitter</figcaption>
            </figure>
          </div>
        </div>
      `

        let style = document.createElement("style")
        style.textContent = `
          :host{
            width: calc(50% - 1em);
            height: 240px;
            background: radial-gradient(#2C3E50, #000000);
            max-width: 500px;
            color: white;
            display: block;
            cursor: pointer;
            overflow: hidden;
            border-radius: 4px;
            box-sizing: border-box;
            box-shadow: var(--system-radius);
          }
          @supports (background: paint(huiwen-border)) {
              :host {
                  --huiwen-line-width: 2px;
                  background-image: paint(huiwen-border);
              }
          }
          .custom-card-container {
            height: 100%;
            width: 100%;
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
            transition: transform 0.5s ease-in-out;
            transform: translateY(0);
            box-sizing: border-box;
          }
          .contact-info {
           display: flex;
           justify-content: space-between; 
           width: 100%;
           box-sizing: border-box;
          }
          .contact-info label {
            margin-right: 5px;
          }
          .black-info {
            background-color: rgba(0, 0, 0, .8);
            width: 100%;
            height: 100%;
            transition: transform 0.5s ease-in-out;
            transform: translateY(0);
            display: flex;
            align-items: center;
            justify-content: space-around;
          }
          .img-box {
            width: 100px;
            height: 100px;
          }
          figcaption {
            margin-top: 5px;
            text-align: center;
          }
          .custom-card-container:hover .front-info,
          .custom-card-container:hover .black-info {
            transform: translateY(-100%);
          }
        `
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
