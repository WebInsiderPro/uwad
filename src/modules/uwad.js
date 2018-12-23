exports.declension = (num, ...words) => {
    // Ex: el.innerHtml = declension(parseInt(comments_count), 'comment', 'comments')
    // => 0 comments | 1 comment | 2 comments | etc...
    let _default = 'no_word'

    words[0] = words[0] || _default
    words[1] = words[1] || words[0]
    words[2] = words[2] || words[1]

    let keys = [2, 0, 1, 1, 1, 2]
    let mod = num % 100
    let index = 7 < mod && mod < 20 ? 2 : keys[Math.min(mod % 10, 5)]
    return words[index]
}

exports.autoExpandTextarea = () => {
    // Ex: <textarea data-auto-expand data-max-heigh="200"></textarea>
    // data-max-height is optional
    document.querySelectorAll('textarea[data-auto-expand]').forEach((el) => {

        if (el.dataset.maxHeight) {
            el.style.maxHeight =
                parseInt(el.dataset.maxHeight) + 'px'
            el.style.overflow = 'auto'
        } else el.style.overflow = 'hidden'

        delete el.dataset.autoExpand
        delete el.dataset.maxHeight

        let expand = () => {
            el.style.height = 'auto'

            let computed = window.getComputedStyle(el)

            let height =
                parseInt(computed.getPropertyValue('border-top-width'), 10)
                + parseInt(computed.getPropertyValue('border-bottom-width'), 10)
                + el.scrollHeight

            el.style.height = height + 'px'
        }

        expand()

        el.addEventListener('input', () => expand())
    })
}

exports.YTGetID = (url) => {
    let id
    url = url.replace(/([><])/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)
    if (url[2] !== undefined) {
        id = url[2].split(/[^0-9a-z_\-]/i)
        id = id[0]
    }
    else id = url
    return id
}

exports.YTGetImage = (url) => {
    let id = module.exports.YTGetID(url)
    if (!id) return
    return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`
}

exports.YTGetEmbed = (url) => {
    let id = module.exports.YTGetID(url)
    if (!id) return
    return `https://www.youtube.com/embed/${id}`
}

exports.YTGetInfo = (url, api_key, callback = () => {}) => {
    let id = module.exports.YTGetID(url)
    if (!id) return
    url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${api_key}`

    let request = new XMLHttpRequest()
    request.open('GET', url, true)

    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            callback(JSON.parse(request.responseText))
        } else {
            // We reached our target server, but it returned an error
        }
    }

    request.onerror = function() {
        // There was a connection error of some sort
    }

    request.send()
}

exports.Ripple = (selector) => {
    // Using: Ripple('.btn')
    function RippleState(width, height, posX, posY) {
        this.width = (width <= height) ? height : width
        this.height = (width <= height) ? height : width
        this.top = posY - (this.height * 0.5)
        this.left = posX - (this.width * 0.5)
    }

    function offset(el) {
        let rect = el.getBoundingClientRect()

        return {
            top: rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft
        }
    }

    document.querySelectorAll(selector).forEach(el => {
        let timeout = null

        let span = document.createElement('span')
        span.style.zIndex = '1'
        span.style.position = 'relative'
        span.innerText = el.textContent
        el.innerHTML = ''
        el.appendChild(span)

        el.addEventListener('dragstart', e => e.preventDefault())

        el.addEventListener('mousedown', (e) => {
            let ripple = document.createElement('span')
            ripple.classList.add('ripple')

            let pos = offset(el)

            let width = el.offsetWidth
            let height = el.offsetHeight

            let posX = e.clientX - pos.left
            let posY = e.clientY - pos.top

            let state = new RippleState(width, height, posX, posY)

            el.style.setProperty('position', 'relative')
            el.style.setProperty('overflow', 'hidden')

            el.appendChild(ripple)

            ripple.style.setProperty('-webkit-transition', '0s')
            ripple.style.setProperty('-o-transition', '0s')
            ripple.style.setProperty('transition', '0s')
            ripple.style.setProperty('opacity:', '1')
            ripple.style.setProperty('-webkit-transform', 'scale(0)')
            ripple.style.setProperty('-ms-transform', 'scale(0)')
            ripple.style.setProperty('transform', 'scale(0)')

            el.addEventListener('mouseup', () => {
                ripple.setAttribute('style', `
                    display: block;
                    position: absolute;
                    border-radius: 100%;
                    background-image: -webkit-radial-gradient(rgba(255,255,255, .5), rgba(255,255,255, .3), rgba(255,255,255, .1));
                    background-image: -o-radial-gradient(rgba(255,255,255, .5), rgba(255,255,255, .3), rgba(255,255,255, .1));
                    background-image: radial-gradient(rgba(255,255,255, .5), rgba(255,255,255, .3), rgba(255,255,255, .1));
                    left: ${state.left}px;
                    top: ${state.top}px;
                    width: ${state.width}px;
                    height: ${state.height}px;
                    -webkit-transform: scale(2);
                    -ms-transform: scale(2);
                    transform: scale(2);
                    opacity: 0;
                    z-index: 0;
                    -webkit-transition: opacity 1s, -webkit-transform 1s;
                    transition: opacity 1s, -webkit-transform 1s;
                    -o-transition: transform 1s, opacity 1s;
                    transition: transform 1s, opacity 1s;
                    transition: transform 1s, opacity 1s, -webkit-transform 1s;
                    pointer-events: none;
                `)
            })

            if (timeout !== null) clearTimeout(timeout)

            timeout = setTimeout(() => {
                el.style.removeProperty('display')
                el.style.removeProperty('position')
                el.style.removeProperty('overflow')
            }, 1000)

            setTimeout(() => ripple.remove(), 1000)
        })
    })
}