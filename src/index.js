
import css from './style.scss';

import svgDownload from './images/download.svg';

const initialize = () => {

    // console.log(css);
    document.head.appendChild(document.createElement('style')).appendChild(document.createTextNode(css));


    const $helper = document.createElement('div');
    $helper.className = 'downloader-helper-container';

    const iconDownload = document.createElement('div');
    iconDownload.innerHTML = svgDownload;
    $helper.appendChild(iconDownload);

    const label = document.createElement('span');
    label.innerHTML = 'save';
    $helper.appendChild(label);

    document.body.appendChild($helper);


    document.body.addEventListener('mouseover', (e) => {

        const $target = e.target;

        if (!$target.classList.contains('swiper-slide')) {
            return;
        }

        $target.appendChild($helper);

        // console.log($target.classList);

        // const br = $target.getBoundingClientRect();

        // const t = br.top + 10;
        // const l = br.left + br.width - 30;

        // container.style.top = `${t}px`;
        // container.style.left = `${l}px`;
        // container.style.display = 'block';

        const leaveHandler = (ee) => {
            $target.removeEventListener('mouseleave', leaveHandler);

            if ($helper.parentNode) {
                $helper.parentNode.removeChild($helper);
            }

        };

        $target.addEventListener('mouseleave', leaveHandler);

    });

};


window.addEventListener('load', () => {

    initialize();

});
