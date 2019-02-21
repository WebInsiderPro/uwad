class YT {

  constructor(API_KEY) {

    this.API_KEY = API_KEY
    this.channels = {}

    this.video_render()

  }


  video(url, callback = () => {}) {

    let id = YT.get_video_id(url)
    url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${this.API_KEY}`

    fetch(url).then((response) => {
      return response.json()
    }).then((data) => {
      let video = data.items[0]
      video.embed = `https://www.youtube.com/embed/${id}`
      video.url = `https://www.youtube.com/watch?v=${id}`
      this.channel(video['snippet']['channelId'], (channel) => {
        callback({ channel, video })
      })
    }).catch((Err) => {
      console.log(Err)
    })

  }


  channel(id, callback = () => {}) {

    if (typeof this.channels[id] === 'object') return callback(this.channels[id])

    let url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${id}&key=${this.API_KEY}`

    fetch(url).then((response) => {
      return response.json()
    }).then((data) => {
      let channel = data.items[0]
      channel.url = `https://www.youtube.com/channel/${id}`
      this.channels[channel.id] = channel
      return callback(channel)
    }).catch((Err) => {
      console.log(Err)
    })

  }


  video_render() {

    let v_blocks = document.querySelectorAll('[data-yt]')

    if (v_blocks) v_blocks.forEach((el) => {

      let url = el.dataset.yt

      if (!url) {
        el.innerHTML = '<strong style="color: tomato">Insert video URL to [data-yt] attribute</strong>'
        return delete el.dataset.yt
      }

      this.video(url, (r) => {

        // For Debug
        if (el.innerHTML.match(/{!}/gi)) {
          el.innerHTML = el.innerHTML.replace(/{!}/gi, `<code>${JSON.stringify(r)}</code>`)
        }

        let regexp = /(\[\[)[a-z.]+(]])/gi
        let matches = el.innerHTML.match(regexp)

        if (matches) matches.forEach(match => {

          let _regexp = /([a-z.])+/gi
          let keys = match.match(_regexp)

          if (keys) keys.forEach(key => {

            let key_parts = key.split('.')
            let replace_key = `[[${key}]]`

            let cnt = this.get_value(r, key_parts)

            // Render to HTML
            if (cnt) {

              // Convert Tags to Links
              if (key.match('tags') !== null) {
                let cnt_str = ''
                cnt.forEach(tag => {
                  cnt_str += ` <a href="https://www.youtube.com/results?search_query=${tag.replace(/\s/g, '+')}" target="_blank"><span>#</span>${tag}</a>`
                })
                // Remove First Space
                cnt = cnt_str.replace(' ', '')
              }

              if (typeof cnt === 'string') {

                // Links as Html
                if (replace_key.toLowerCase().match(/description/)) {

                  // URLs
                  let url_regex = /(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.​\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[​6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1​,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00​a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u​00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?/ig
                  cnt = cnt.replace(url_regex, (m) => {
                    return `<a href="${m}" target="_blank">${m}</a>`
                  })

                  // Emails
                  let email_regex = /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/ig
                  cnt = cnt.replace(email_regex, (m) => {
                    return `<a href="mailto:${m}">${m}</a>`
                  })

                  // HashTags
                  let hash_regex = /(#[a-zа-я]+)/gi
                  cnt = cnt.replace(hash_regex, (m) => {
                    return `<a href="https://www.youtube.com/results?search_query=${m.replace('#', '%23')}" target="_blank"">${m}</a>`
                  })
                }

                // Break Lines
                cnt = cnt.replace(/\n/g, '<br>')
              }

              // Render Object
              else if (typeof cnt === 'object') cnt = `<code>${JSON.stringify(cnt)}</code>`


              // Render finally
              el.innerHTML = el.innerHTML.replace(replace_key, cnt)
            }

          })

        })


        // Set Images
        el.querySelectorAll('[data-img]').forEach((img) => {
          let node = document.createElement('img')
          for (let i = 0; i < img.attributes.length; i++) {
            let attr = img.attributes[i]
            let name = attr.name
            if (name === 'data-img') name = 'src'
            node.setAttribute(name, attr.value)
          }
          img.replaceWith(node)
        })


        // Set Backgrounds
        el.querySelectorAll('[data-bg]').forEach((div) => {
          let src = div.dataset.bg
          delete div.dataset.bg
          div.style.backgroundImage = `url(${src})`
        })


        // Set Player or Play by click the Preview
        let player = `<iframe src="${r.video.embed}?autoplay=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
        let autoplay = `<iframe src="${r.video.embed}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`

        let play = el.querySelector('[data-play]')
        let video = el.querySelector('[data-video]')

        if (play) {
          play.innerHTML = '<span class="play-button"></span>'
          play.addEventListener('click', (e) => {
            e.preventDefault()
            play.innerHTML = autoplay
          })
        }

        if (video) video.innerHTML = player

        delete el.dataset.yt

      })

    })

  }


  get_value(obj, keys) {
    if (typeof obj === 'string') return obj
    keys.forEach(k => {
      if (obj.hasOwnProperty(k)) obj = obj[k]
      else obj = `Key <span style="color: tomato">${k}</span> not found`
    })
    return obj
  }


  static get_video_id(url) {
    url = url.replace(/([><])/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)
    if (url[2] !== undefined) return url[2].split(/[^0-9a-z_\-]/i)[0]
    else return url
  }

}
exports.YT = YT

class MainNavigation {
    // Ex: new MainNavigation('.main-navigation')

    constructor(selector) {
        this.main_menu = document.querySelector(selector)

        if (! this.main_menu) return

        this.parent_links = []
        this.set_parent_links()
        this.add_arrows()
        this.sub_menu()
        MainNavigation.mark()

        this.main_menu.addEventListener('click', (e) => {
            e.stopPropagation()
        })
    }


    set_parent_links() {
        this.main_menu.querySelectorAll('li ul').forEach((el) => {
            this.parent_links.push(el.parentNode.firstChild)
        })
    }


    add_arrows() {
        this.parent_links.forEach((link) => {
            link.appendChild(document.createElement('span'))
        })
    }


    show_sub_menu() {
        this.parent_links.forEach((link) => {
            let counter = 1
            link.addEventListener('click', (e) => {

                e.currentTarget.parentNode.parentNode.querySelectorAll('li').forEach((el) => {
                    if (e.currentTarget.parentNode !== el) el.classList.remove('show')
                })

                if (link.parentNode.classList.contains('show')) counter++

                if (counter === 1) {
                    e.preventDefault()
                    link.parentNode.classList.add('show')
                } else counter = 0
            })
        })
    }


    hide_sub_menu() {
        this.parent_links.forEach((link) => { link.parentNode.classList.remove('show') })
    }


    sub_menu() {
        document.addEventListener('click', () => {
            this.hide_sub_menu()
            this.show_sub_menu.counter = 0
        })
        this.show_sub_menu()
    }


    static mark() {
        document.querySelectorAll('li.mark a').forEach((el) => {
            el.innerHTML = `<div>${el.innerHTML}</div>`
        })
    }

}
exports.MainNavigation = MainNavigation

exports.Declension = (num, ...words) => {
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

exports.AutoExpandTextarea = () => {
    // Ex: <textarea data-auto-expand data-max-height="200"></textarea>
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