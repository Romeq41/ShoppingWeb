class FooterComponent extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({mode: 'open'});

        const container = document.createElement('div');
        container.innerHTML = `
      <!-- Start footer -->
      <div class="footer">
        <div class="container">
          <div class="contact">
            <a href="#" class="logo">Store</a>
            <div class="info">
              <h4>Contact</h4>
              <p><span>Address:</span> 10 Street Giza</p>
              <p><span>Phone:</span> +02 1110649108</p>
            </div>
            <div class="follow">
              <i class="fa-brands fa-facebook-f"></i>
              <i class="fa-brands fa-twitter"></i>
              <i class="fa-brands fa-instagram"></i>
              <i class="fa-brands fa-youtube"></i>
            </div>
          </div>
          <div class="box">
            <h4>About</h4>
            <ul class="menu">
              <li><a href="#">Home</a></li>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
          <div class="box">
            <h4>My Account</h4>
            <ul>
              <li><a href="#">My Account</a></li>
              <li><a href="#">My Cart</a></li>
              <li><a href="#">My Wishlist</a></li>
            </ul>
          </div>
        </div>
      </div>
      <!-- End footer -->
    `;

        const style = document.createElement('style');
        style.textContent = `
      .footer {
        min-width: fit-content;
        background: linear-gradient(to right, white, var(--mainColor));
        padding-top: 60px;
        padding-bottom: 20px;
      }
      .footer .container {
        display: flex;
        justify-content: space-between;
      }
      .footer .container .contact .logo {
        color: var(--mainColor);
        font-size: 80px;
        font-weight: bold;
        text-decoration: none;
      }
      .footer .container .contact .info h4 {
        margin: 10px 0;
        font-size: 25px;
        color: var(--textColor);
      }
      .footer .container .contact .info p {
        color: var(--textColor);
      }
      .footer .container .contact .info p:not(:last-child) {
        margin-bottom: 5px;
      }
      .footer .container .contact .info p span {
        color: var(--mainColor);
      }
      .footer .container .contact .follow {
        color: var(--textColor);
        margin-top: 10px;
        font-size: 20px;
      }
      .footer .container .contact .follow i {
        cursor: pointer;
        transition: var(--mainTransition);
      }
      .footer .container .contact .follow i:not(:last-child) {
        margin-right: 5px;
      }
      .footer .container .contact .follow i:hover {
        color: var(--mainColor);
      }
      .footer .container .box h4 {
        margin-bottom: 10px;
        font-size: 25px;
        color: var(--textColor);
      }
      .footer .container .box ul li a {
        color: var(--textColor);
        display: block;
        padding: 10px 0;
        text-decoration: none;
        transition: color 0.3s;
      }
      .footer .container .box ul li a:hover {
        color: var(--mainColor);
      }
      .footer .dev {
        text-align: center;
        font-size: 20px;
        margin-top: 15px;
      }
      .footer .dev a {
        color: var(--mainColor);
      }
      @media (max-width: 767px) {
        .footer .container {
          flex-direction: column;
        }
        .footer .container .contact {
          margin-bottom: 20px;
        }
      }
      .container {
      padding-left: 15px;
      padding-right: 15px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Small */
    @media (min-width: 768px) {
      .container {
        width: 750px;
      }
    }
    /* Medium */
    @media (min-width: 992px) {
      .container {
        width: 970px;
      }
    }
    /* Large */
    @media (min-width: 1200px) {
      .container {
        width: 1170px;
      }
    }
    `;

        shadow.appendChild(style);
        shadow.appendChild(container);

        this.addEventListeners();
    }

    addEventListeners() {
        const shadow = this.shadowRoot;

        shadow.querySelectorAll('.menu a, .box ul li a').forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const targetText = event.target.textContent;

                if (targetText === 'Home') {
                    window.location.href = `${window.location.origin}${window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/'))}/index.php`;
                } else if (targetText === 'My Account') {
                    window.location.href = `${window.location.origin}${window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/'))}/userpage.php`;
                } else if (targetText === 'My Cart') {
                    window.location.href = `${window.location.origin}${window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/'))}/cart.php`;
                } else if (targetText === 'My Wishlist') {
                    window.location.href = `${window.location.origin}${window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/'))}/favorites.php`;
                } else if (targetText === 'About Us') {
                    window.location.href = `${window.location.origin}${window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/'))}/about.php`;
                } else if (targetText === 'Contact Us') {
                    window.location.href = `${window.location.origin}${window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/'))}/contact.php`;
                }
            });
        });

        shadow.querySelectorAll('.follow i').forEach(icon => {
            icon.addEventListener('click', () => {
                alert(`Navigating to ${icon.classList[1].split('-')[2]} page`);
            });
        });
    }
}

customElements.define('footer-component', FooterComponent);