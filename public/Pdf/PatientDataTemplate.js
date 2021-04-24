

const patinetDataTemplate = (title, image, name) => {
    return (
        `<div>
        <h1>${name}<h1/>
            <p>${title}</p>
            <embed 
  frameborder="0" scrolling="no" 
  id="RefFrame"
  
  onload="AdjustIFrame('RefFrame');" class="RefFrame"
  src='${image}' frameBorder="0"
    width="100%"></embed>

            <img src='${image}'/>
        </div>`
    )
}

module.exports = patinetDataTemplate;