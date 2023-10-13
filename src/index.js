
import css from './style.scss';

import svgDownload from './images/download.svg';

const initialize = () => {

    // console.log(css);
    document.head.appendChild(document.createElement('style')).appendChild(document.createTextNode(css));

    const iconDownload = document.createElement('div');
    iconDownload.innerHTML = svgDownload;

    const container = document.createElement('div');
    container.className = 'downloader-helper-container';

    container.appendChild(iconDownload);

    document.body.appendChild(container);

    document.body.addEventListener('mouseover', (e) => {

        const $target = e.target;

        if (!$target.classList.contains('swiper-slide')) {
            return;
        }


        // console.log($target.classList);

        const br = $target.getBoundingClientRect();

        container.style.top = `${br.top}px`;
        container.style.left = `${br.left}px`;

    });

};


window.addEventListener('load', () => {

    initialize();

});
